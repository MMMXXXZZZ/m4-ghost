// URL derivation for Ghost content events.
//
// Free-plan Cloudflare has no purge-by-prefix or purge-by-tag (both are
// Enterprise), so every affected URL must be enumerated explicitly and sent
// in batches of 30. That makes this the load-bearing part of the pipeline:
// a URL missed here stays stale until the edge TTL expires.
//
// The site runs two independent collections (content/settings/routes.yaml):
//
//   /en/  permalink /en/{slug}/  filter tag:in-english
//   /     permalink /{slug}/     filter tag:-[in-english]
//
// so a post belongs to exactly one of them, and ADDING OR REMOVING the
// in-english tag moves it between them -- which is why current and previous
// are both inspected and their collections unioned.

export const SITE = 'https://m44.cl';
export const EN_TAG = 'in-english';

const slugsOf = (post) => (post?.tags || []).map((t) => t.slug).filter(Boolean);
const isEnglish = (post) => slugsOf(post).includes(EN_TAG);

// Ghost sends `previous` as a sparse object holding only changed fields, so
// an absent `tags` key means "unchanged" -- fall back to current rather than
// treating it as an empty tag list.
function versions(payload) {
  const current = payload?.current && Object.keys(payload.current).length ? payload.current : null;
  const previous = payload?.previous && Object.keys(payload.previous).length ? payload.previous : null;
  return [current, previous].filter(Boolean);
}

export function derive(payload, { paginationDepth = 5 } = {}) {
  const urls = new Set();
  const seen = versions(payload);
  if (!seen.length) return [];

  const add = (path) => urls.add(new URL(path, SITE).toString());

  // Feeds and sitemaps change on any publish.
  add('/rss/');
  add('/sitemap.xml');
  add('/sitemap-posts.xml');

  const collections = new Set();

  for (const v of seen) {
    // The post's own URL. Ghost sends an absolute url; fall back to building
    // one from the slug when only a slug is present (deletes, sparse payloads).
    const url = v.url || (v.slug ? `${SITE}/${v.slug}/` : null);
    if (url) {
      add(url);
      add(url.endsWith('/') ? `${url}amp/` : `${url}/amp/`);
    }

    // Which paginated collection this version lives in.
    const tagged = 'tags' in v ? isEnglish(v) : isEnglish(seen[0]);
    collections.add(tagged ? '/en/' : '/');

    for (const slug of slugsOf(v)) add(`/tag/${slug}/`);

    const author = v.primary_author?.slug || v.authors?.[0]?.slug;
    if (author) add(`/author/${author}/`);
  }

  // Collection roots plus their first pages. Strictly every page shifts when a
  // post enters or leaves, but deep pages are rarely requested and the edge TTL
  // backstops them; enumerating all of them would blow the batch budget.
  for (const base of collections) {
    add(base);
    for (let i = 2; i <= paginationDepth; i++) add(`${base}page/${i}/`);
  }

  return [...urls];
}

// Cloudflare accepts at most 30 files per purge request on this plan.
export function batch(urls, size = 30) {
  const out = [];
  for (let i = 0; i < urls.length; i += size) out.push(urls.slice(i, i + size));
  return out;
}
