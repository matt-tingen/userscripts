(function() {
  const { css } = window.__MJT_USERSCRIPTS__.utils;
  css`
    :root {
      --dark1: #111;
      --dark2: #222;
      --dark-accent: #777;
      --primary: darkred;
      --input-bg: #181818;
      --text-header: #ccc;
      --text-body: #aaa;
      --text-block: #181818;
      --text-muted: #666;
    }

    body {
      background: var(--dark1);
    }

    #hnmain {
      background: var(--dark2);
      padding-bottom: 0.5em;
    }

    /* Nav bar */
    #hnmain > tbody > tr:first-child > td {
      background: var(--primary);
    }

    /* Logo */
    #hnmain
      > tbody
      > tr:nth-child(1)
      > td
      > table
      > tbody
      > tr
      > td:nth-child(1) {
      display: none;
    }

    textarea,
    input[type='submit'] {
      background: var(--input-bg);
      border: 1px solid var(--dark-accent);
      color: var(--text-body);
    }

    .title a,
    .subtitle a,
    .comhead a,
    .reply a {
      color: var(--text-header) !important;
    }

    .commtext,
    .commtext a {
      line-height: 1.5;
      color: var(--text-body) !important;
    }

    .commtext pre {
      background: var(--text-block);
    }
    .commtext pre {
      margin-left: -0.8em;
    }

    /* New user, downvoted comment */
    .hnuser font[color='#3c963c'],
    .c5a {
      color: var(--text-muted);
    }

    /* Footer */
    #hnmain > tbody > tr:nth-child(4) {
      display: none;
    }

    .votearrow[title='upvote'] {
      background: none;
      margin: 0 5px;
      height: 0;
    }
    .votearrow[title='upvote']::after {
      content: '';
      position: relative;
      width: 0;
      height: 0;
      top: -9px;
      border: 4px solid transparent;
      border-bottom-color: var(--text-header);
    }

    .rank {
      display: none;
    }

    .title a:visited {
      color: var(--text-muted) !important;
    }
  `;
})();
