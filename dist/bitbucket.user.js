// ==UserScript==
// @name BitBucket
// @namespace https://github.com/matt-tingen/userscripts
// @version 2.0
// @author Matt Tingen
// @description Transitive blame UI
// @downloadURL https://raw.githubusercontent.com/matt-tingen/userscripts/master/dist/bitbucket.user.js
// @match https://bitbucket.org/*
// @grant none
// ==/UserScript==


window.__MJT_USERSCRIPTS__ = {
  utils: (function() {
    const includesClass = className => {
      // Valid CSS class names do not require escaping at the root of a regex.
      const regex = new RegExp(`(^| )${className}($| )`, 'g');
      return classNames => regex.test(classNames);
    };

    const waitForClass = (className, nodes, callback) => {
      const hasClass = includesClass(className);
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          const node = mutation.target;

          if (!hasClass(mutation.oldValue) && hasClass(node.className)) {
            callback(node);
          }
        });
      });

      nodes.forEach(node => {
        observer.observe(node, {
          attributes: true,
          attributeFilter: ['class'],
          attributeOldValue: true,
        });
      });
    };

    return {
      includesClass,
      waitForClass,
    };
  })(),
};


(function() {
  const { waitForClass } = window.__MJT_USERSCRIPTS__.utils;

  const REPO_PATH = location.pathname.match(/^(?:\/[^\/]+){2}/)[0];
  // The official API (https://api.bitbucket.org/2.0/) requires auth. This
  // undocumented API appears to use the user's cookies.
  const API_BASE = `https://bitbucket.org/!api/2.0/repositories${REPO_PATH}`;

  const ICON_SIZE = 10;
  const TITLE = 'View blame prior to this change';
  const styles = `
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
  }
  `;
  $('head').append(`<style type="text/css">${styles}</style>`);

  const commitInfoCache = {};

  const getCommitInfo = async hash => {
    if (!commitInfoCache[hash]) {
      const response = await fetch(`${API_BASE}/commit/${hash}`);
      commitInfoCache[hash] = response.json();
      // commitInfoCache[hash] = {
      //   parentHash: parseHashFromUrl(
      //     doc.find('.commit-parents a:first-of-type').attr('href'),
      //   ),
      //   commitMessage: doc.find('.commit-message > p:first-child').text(),
      // };
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
      firstTextNode.wholeText.slice(1),
    );
    line.replaceChild(newTextNode, firstTextNode);
  };

  // Not all lines will be processed for word-diff so do an initial pass
  $('.udiff-line:not(.common) > .source').each((i, line) =>
    removeDiffNotation(line),
  );

  // Word diffing occurs in JS and overwrites the lines' text.
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
})();
