import { expect, test } from 'bun:test';
import { verifySignature } from './index.mjs';

const SECRET = 'test-secret';
const BODY = JSON.stringify({ post: { current: { slug: 'x' } } });

async function sign(body, ts, secret = SECRET) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${body}${ts}`));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `sha256=${hex}, t=${ts}`;
}

test('accepts a valid signature', async () => {
  const ts = Date.now();
  expect(await verifySignature(BODY, await sign(BODY, ts), SECRET)).toBe(true);
});

test('rejects a tampered body', async () => {
  const ts = Date.now();
  const h = await sign(BODY, ts);
  expect(await verifySignature(BODY + 'x', h, SECRET)).toBe(false);
});

test('rejects a wrong secret', async () => {
  const ts = Date.now();
  expect(await verifySignature(BODY, await sign(BODY, ts, 'other'), SECRET)).toBe(false);
});

test('rejects a replayed old delivery', async () => {
  const old = Date.now() - 10 * 60 * 1000;
  expect(await verifySignature(BODY, await sign(BODY, old), SECRET)).toBe(false);
});

test('rejects missing or malformed headers', async () => {
  expect(await verifySignature(BODY, null, SECRET)).toBe(false);
  expect(await verifySignature(BODY, 'garbage', SECRET)).toBe(false);
  expect(await verifySignature(BODY, `sha256=zz, t=${Date.now()}`, SECRET)).toBe(false);
});

test('rejects when no secret is configured', async () => {
  const ts = Date.now();
  expect(await verifySignature(BODY, await sign(BODY, ts), '')).toBe(false);
});
