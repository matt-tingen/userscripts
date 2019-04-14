(function() {
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

  const getCommitInfo = async url => {
    if (!commitInfoCache[url]) {
      const response = await fetch(url);
      const html = await response.text();
      const doc = $(html);

      commitInfoCache[url] = {
        parentHash: doc
          .find('.commit-parents a:first-of-type')
          .attr('href')
          .match(/\/commits\/([a-f\d]{40})(?:$|\/|\?)/)[1],
        commitMessage: doc.find('.commit-message > p:first-child').text(),
      };
    }

    return commitInfoCache[url];
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
    const link = $(el).find('.cset');
    const url = link.attr('href');

    let hoverTimeout;
    let isTooltipInitialized = false;
    link.hover(
      () => {
        hoverTimeout = setTimeout(async () => {
          if (!isTooltipInitialized) {
            link.attr('title', (await getCommitInfo(url)).commitMessage).tipsy({
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

        const { parentHash } = await getCommitInfo(url);
        location.pathname = location.pathname.replace(
          /\/annotate\/[^\/]+/,
          `/annotate/${parentHash}`,
        );
      });

    $(el).append(' ', transitiveBlameButton);
  });
})();
