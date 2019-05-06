(function() {
  const { waitForClass, addStyles } = window.__MJT_USERSCRIPTS__.utils;

  const REPO_PATH = location.pathname.match(/^(?:\/[^\/]+){2}/)[0];
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

  const commitInfoCache = {};

  const getCommitInfo = async hash => {
    if (!commitInfoCache[hash]) {
      const response = await fetch(`${API_BASE}/commit/${hash}`);
      commitInfoCache[hash] = response.json();
    }

    return await commitInfoCache[hash];
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

            if (hoverTimeout) {
              link.tipsy('show');
            }

            isTooltipInitialized = true;
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
        $(this)
          .attr('disabled', true)
          .find('.aui-icon')
          .removeClass('aui-iconfont-devtools-browse-up')
          .addClass('aui-icon-wait');

        const parentHash = (await getCommitInfo(hash)).parents[0].hash;
        const lineNumber = getLineNumber(annotation);

        // Clicking the line number adds the appropriate hash to the URL which
        // will be preserved when the pathname is replaced.
        $(`.linenodiv > pre > a:nth-child(${lineNumber})`).click();

        location.pathname = location.pathname.replace(
          /\/annotate\/[^\/]+/,
          `/annotate/${parentHash}`,
        );
      });

    annotation.append(' ', transitiveBlameButton);
  });

  // Drop the +/- from diff lines to simplify copying.
  const removeDiffNotation = line => {
    const firstTextNode = line.childNodes[0];
    const newTextNode = document.createTextNode(
      ' ' + firstTextNode.wholeText.slice(1),
    );
    line.replaceChild(newTextNode, firstTextNode);
  };

  // Word diffing occurs in JS and overwrites the lines' text.
  const applyDiffTransform = () => {
    // Not all lines will be processed for word-diff so do an initial pass
    $('.udiff-line:not(.common) > .source').each((i, line) =>
      removeDiffNotation(line),
    );

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
            removeDiffNotation(line);
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
    const removed = sumLines($('.lines-removed'));

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
        <span class="mjt-lines-removed">${removed}</span>
      </div>`);

    $('.compare-widget-container').after(combined);
  });
})();
