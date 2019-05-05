(function() {
  const { waitForClass } = window.__MJT_USERSCRIPTS__.utils;

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
