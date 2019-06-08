(function() {
  const { waitForClass, addStyles } = window.__MJT_USERSCRIPTS__.utils;

  const parseUrl = () => {
    let filePath;
    let fileName;
    let hash;

    const parts = location.pathname.split('/');
    const repoPath = parts.slice(0, 3).join('/');

    if (parts[3] === 'annotate') {
      hash = parts[4];
      filePath = parts.slice(5).join('/');
      fileName = parts[parts.length - 1];
    }

    return { repoPath, filePath, fileName, hash };
  };

  let parsedUrl;
  try {
    parsedUrl = parseUrl();
  } catch (ignore) {
    return;
  }

  const {
    repoPath: REPO_PATH,
    filePath: FILE_PATH,
    fileName: FILE_NAME,
    hash: HASH,
  } = parsedUrl;
  // The official API (https://api.bitbucket.org/2.0/) requires auth. This
  // undocumented API appears to use the user's cookies.
  const API_BASE = `https://bitbucket.org/!api/2.0/repositories${REPO_PATH}`;

  const ICON_SIZE = 10;
  const TITLE = 'View blame prior to this change';
  addStyles(`
  .mjt-transitive-diff {
    display: block;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
  .mjt-transitive-diff:before {
    font-size: ${ICON_SIZE}px;
    margin-top: ${-ICON_SIZE}px;
  }
  .mjt-transitive-diff.aui-icon-wait {
    position: relative;
    top: ${-ICON_SIZE / 2}px;
    background-size: ${ICON_SIZE}px;
  }`);

  const fetchJson = async url => {
    const response = await fetch(url);
    return await response.json();
  };
  const fetchApi = path => fetchJson(`${API_BASE}/${path}`);

  const commitInfoCache = {};
  const getCommitInfo = async hash => {
    if (!commitInfoCache[hash]) {
      commitInfoCache[hash] = await fetchApi(`commit/${hash}`);
    }

    return await commitInfoCache[hash];
  };

  const getFileDiffStat = async hash => {
    let fileDiffStat;
    let diffStat;

    do {
      diffStat = await (diffStat
        ? fetchJson(diffStat.next)
        : fetchApi(`diffstat/${HASH}..${hash}`));

      fileDiffStat = diffStat.values.find(
        value => value.new && value.new.path === FILE_PATH,
      );
    } while (!fileDiffStat && diffStat.next);

    return fileDiffStat;
  };

  const parseHashFromUrl = url => url.match(/\/([a-f\d]{40})(?:$|\/|\?)/)[1];

  const getLineNumber = annotation => {
    // Annotations are separated by blank lines in a <pre> tag.
    const numPrevCommits = annotation.prevAll().length;
    const lines = annotation
      .parent()
      .html()
      .split('\n');
    let lineIndex = 0;

    // Scan through the lines until the provided annotation has been passed.
    // That _index_ is the line _number_ of the provided annotation.
    for (let commitsPassed = 0; commitsPassed <= numPrevCommits; lineIndex++) {
      if (lines[lineIndex]) {
        commitsPassed++;
      }
    }

    return lineIndex;
  };

  // https://docs.atlassian.com/aui/5.6.8/docs/icons.html
  const icon = $('<span>')
    .addClass(
      'aui-icon aui-icon-small aui-iconfont-devtools-browse-up mjt-transitive-diff',
    )
    .attr('title', TITLE)
    .text(TITLE);

  const pendHashButton = button => {
    button
      .attr('disabled', true)
      .find('.aui-icon')
      .removeClass('aui-iconfont-devtools-browse-up')
      .addClass('aui-icon-wait');

    button.children().attr('title', 'Loading...');
  };

  const buttonsByHash = {};
  const disableHashButtons = hash => {
    const buttons = $(buttonsByHash[hash]);

    buttons
      .find('.aui-icon')
      .removeClass('aui-icon-wait')
      .addClass('aui-iconfont-devtools-browse-up');

    buttons
      .attr('disabled', true)
      .children()
      .attr(
        'title',
        'The blame could not be tracked past this commit. This is probably due to a rename.',
      );
  };

  const annotations = $('.annotationdiv > pre > span');

  annotations.each((i, el) => {
    const annotation = $(el);
    const link = annotation.find('.cset');
    const url = link.attr('href');
    const hash = parseHashFromUrl(url);

    let hoverTimeout;
    let isTooltipInitialized = false;
    link.hover(
      () => {
        hoverTimeout = setTimeout(async () => {
          if (!isTooltipInitialized) {
            link
              .attr('title', (await getCommitInfo(hash)).message.split('\n')[0])
              .tipsy({
                trigger: 'manual',
              });

            isTooltipInitialized = true;
          }

          if (hoverTimeout) {
            link.tipsy('show');
          }
        }, 100);
      },
      () => {
        if (isTooltipInitialized) {
          link.tipsy('hide');
        }
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      },
    );

    const transitiveBlameButton = $('<button>')
      .addClass('aui-button aui-button-link')
      .append(icon.clone())
      .click(async function() {
        const button = $(this);
        pendHashButton(button);

        const commit = await getCommitInfo(hash);
        const parentHash = commit.parents[0].hash;
        const diffStat = await getFileDiffStat(parentHash);
        const { status } = diffStat;

        if (status === 'added') {
          disableHashButtons(hash);
        } else {
          const lineNumber = getLineNumber(annotation);

          // Clicking the line number adds the appropriate hash to the URL which
          // will be preserved when the pathname is replaced.
          $(`.linenodiv > pre > a:nth-child(${lineNumber})`).click();

          location.href = `${
            location.host
          }${REPO_PATH}/annotate/${parentHash}/${
            status === 'renamed' ? diffStat.old.path : FILE_PATH
          }#${FILE_NAME}-${lineNumber}`;
        }
      });

    if (!buttonsByHash[hash]) {
      buttonsByHash[hash] = [];
    }
    buttonsByHash[hash].push(transitiveBlameButton[0]);

    annotation.append(' ', transitiveBlameButton);
  });

  // Highlight row upon hovering.
  const getVerticalDistance = (...nodes) => {
    const [a, b] = nodes.map(node => node.getBoundingClientRect().top);
    return b - a;
  };

  const initFileViewer = () => {
    const lineNodes = $('.linenodiv a:nth-child(-n+2)');
    const fileViewer = $('.file-source');

    if (!fileViewer.length) {
      return;
    }

    const lineOuterHeight = getVerticalDistance(...lineNodes.toArray());
    const lineInnerHeight = lineNodes.height();
    const fileViewerPadding = parseFloat(
      $('.linenos')
        .css('padding-top')
        .replace('px', ''),
    );

    const lineHighlight = $('<div>').css({
      width: '100%',
      height: lineInnerHeight,
      position: 'absolute',
      top: 0,
      left: 0,
      background: 'black',
      opacity: 0.08,
      pointerEvents: 'none',
    });
    fileViewer.after(lineHighlight);

    const lineHighlightOffset = getVerticalDistance(
      lineHighlight[0],
      lineNodes[0],
    );
    lineHighlight.hide();

    let prevLine = null;
    const setActiveLine = line => {
      if (line !== prevLine) {
        prevLine = line;
        lineHighlight.toggle(!!line);

        if (line) {
          lineHighlight.css(
            'top',
            lineHighlightOffset + (line - 1) * lineOuterHeight,
          );
        }
      }
    };

    fileViewer.mouseleave(() => {
      setActiveLine(null);
    });

    fileViewer.mousemove(({ clientY }) => {
      const activeLine =
        Math.floor(
          (clientY -
            fileViewerPadding -
            fileViewer[0].getBoundingClientRect().top) /
            lineOuterHeight,
        ) + 1;

      setActiveLine(activeLine || null);
    });
  };

  initFileViewer();

  // Drop the +/- from diff lines to simplify copying.
  const removeFirstCharacter = line => {
    const firstTextNode = line.childNodes[0];
    const newTextNode = document.createTextNode(
      firstTextNode.wholeText.slice(1),
    );
    line.replaceChild(newTextNode, firstTextNode);
  };

  // Word diffing occurs in JS and overwrites the lines' text.
  const applyDiffTransform = () => {
    // Not all lines will be processed for word-diff so do an initial pass
    $('.udiff-line > .source').each((i, line) => removeFirstCharacter(line));

    // The page re-applies the +/- symbol as part of its word diffing in JS.
    // This class signifies that that process is complete.
    waitForClass(
      'word-diff',
      $('.diff-content-container').toArray(),
      container => {
        //  The word diff processing works by finding the deletion -> addition
        //  transition and re-adds the +/- symbol to all contiguous diff lines.
        const transitionPoints = $(container).find(
          '.udiff-line.deletion:not(.conflict)+.addition:not(.conflict)',
        );
        const affectedLines = transitionPoints;

        transitionPoints.each((i, el) => {
          const transitionPoint = $(el);

          affectedLines.push(
            ...transitionPoint.prevUntil('.common, .addition').toArray(),
          );
          affectedLines.push(
            ...transitionPoint.nextUntil('.common, .deletion').toArray(),
          );
        });

        $(affectedLines)
          .find('.source')
          .each((i, line) => {
            removeFirstCharacter(line);
          });
      },
    );
  };

  // Much of the PR contents are loaded asyncronously into this container.
  const pullRequestContent = $('#pr-tab-content');

  if (pullRequestContent.length) {
    pullRequestContent.arrive('#changeset-diff', applyDiffTransform);
  } else {
    // Other diff pages such as the commit page contain diffs on load.
    applyDiffTransform();
  }

  // Sum up change summaries in PRs
  pullRequestContent.arrive('#commit-files-summary', () => {
    const sum = values => values.reduce((total, value) => total + value, 0);
    const sumLines = elements =>
      sum(elements.toArray().map(n => parseInt(n.textContent)));
    const added = sumLines($('.lines-added'));
    const removed = Math.abs(sumLines($('.lines-removed')));

    addStyles(`
      .mjt-change-summary {
        margin-left: 10px;
        border-left: 1px solid #DFE1E6;
        padding-left: 10px;
        display: flex;
        align-items: center;
      }
      .mjt-lines-removed, .mjt-lines-added {
        font-family: monospace;
        font-size: 12px;
        height: 16px;
        line-height: 1.33333333;
        padding: 0 5px;
        text-align: center;
        min-width: 40px;
      }
      .mjt-lines-added {
        border-radius: 3px 0 0 3px;
        background-color: #cfc;
        color: #399839;
      }
      .mjt-lines-removed {
        border-radius: 0 3px 3px 0;
        background-color: #fdd;
        color: #c33;
        margin-left: 3px;
      }
    `);
    const combined = $(`
      <div class="mjt-change-summary">
        <span class="mjt-lines-added">+${added}</span>
        <span class="mjt-lines-removed">-${removed}</span>
      </div>
    `);

    $('.compare-widget-container').after(combined);
  });
})();
