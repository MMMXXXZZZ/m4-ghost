import { expect, test } from 'bun:test';
import { derive, batch, SITE } from './derive.mjs';

const post = (over = {}) => ({
  url: `${SITE}/mi-post/`, slug: 'mi-post',
  tags: [{ slug: 'politica' }], primary_author: { slug: 'max' }, ...over,
});

test('spanish post purges the root collection, not /en/', () => {
  const u = derive({ current: post() });
  expect(u).toContain(`${SITE}/`);
  expect(u).toContain(`${SITE}/page/2/`);
  expect(u).not.toContain(`${SITE}/en/`);
});

test('english post purges /en/ and its pagination, not the root', () => {
  const u = derive({ current: post({ tags: [{ slug: 'in-english' }] }) });
  expect(u).toContain(`${SITE}/en/`);
  expect(u).toContain(`${SITE}/en/page/2/`);
  expect(u).not.toContain(`${SITE}/page/2/`);
});

test('gaining in-english purges BOTH collections', () => {
  const u = derive({
    current:  post({ tags: [{ slug: 'in-english' }] }),
    previous: post({ tags: [{ slug: 'politica' }] }),
  });
  expect(u).toContain(`${SITE}/`);
  expect(u).toContain(`${SITE}/en/`);
});

test('a slug change purges the old URL too', () => {
  const u = derive({
    current:  post({ url: `${SITE}/nuevo/`, slug: 'nuevo' }),
    previous: post({ url: `${SITE}/viejo/`, slug: 'viejo' }),
  });
  expect(u).toContain(`${SITE}/nuevo/`);
  expect(u).toContain(`${SITE}/viejo/`);
});

test('tags from both versions are purged', () => {
  const u = derive({
    current:  post({ tags: [{ slug: 'nueva' }] }),
    previous: post({ tags: [{ slug: 'vieja' }] }),
  });
  expect(u).toContain(`${SITE}/tag/nueva/`);
  expect(u).toContain(`${SITE}/tag/vieja/`);
});

test('sparse previous without tags does not flip the collection', () => {
  // Ghost sends only changed fields in `previous`.
  const u = derive({ current: post(), previous: { title: 'Old title' } });
  expect(u).toContain(`${SITE}/`);
  expect(u).not.toContain(`${SITE}/en/`);
});

test('feeds and amp are always included', () => {
  const u = derive({ current: post() });
  expect(u).toContain(`${SITE}/rss/`);
  expect(u).toContain(`${SITE}/sitemap-posts.xml`);
  expect(u).toContain(`${SITE}/mi-post/amp/`);
});

test('author is purged', () => {
  expect(derive({ current: post() })).toContain(`${SITE}/author/max/`);
});

test('empty payload derives nothing', () => {
  expect(derive({})).toEqual([]);
  expect(derive({ current: {}, previous: {} })).toEqual([]);
});

test('urls are unique', () => {
  const u = derive({ current: post(), previous: post() });
  expect(new Set(u).size).toBe(u.length);
});

test('batches cap at 30', () => {
  const b = batch(Array.from({ length: 65 }, (_, i) => `${SITE}/p${i}/`));
  expect(b.map((x) => x.length)).toEqual([30, 30, 5]);
});
