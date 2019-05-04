const origin = 'https://github.com/';
function getLink(branch) {
  const path = location.href.replace(origin, '');
  const repo = path.match(/^([^\/]+\/[^\/]+)/)[0];
  return `${origin}${repo}/tree/${encodeURIComponent(branch)}`;
}

const branches = $('.commit-ref');
branches.each(function() {
  const el = $(this);
  const branch = el.text();
  const href = getLink(branch);
  const link = $('<a>').attr('href', href);
  el.wrapInner(link);
});
