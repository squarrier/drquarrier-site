function canonicalRoute(url) {
  if (!url.startsWith('/') || url.startsWith('//')) return url;

  const match = url.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? url;
  const suffix = match?.[2] ?? '';

  if (pathname === '/' || pathname.endsWith('/') || /\.[^/]+$/.test(pathname)) return url;
  return `${pathname}/${suffix}`;
}

function rewriteLinks(node) {
  if (node?.type === 'link' && typeof node.url === 'string') node.url = canonicalRoute(node.url);
  if (Array.isArray(node?.children)) node.children.forEach(rewriteLinks);
}

export default function remarkRouteSlashes() {
  return rewriteLinks;
}