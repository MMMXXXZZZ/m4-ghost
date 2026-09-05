// m4-purge — Ghost content webhook -> Cloudflare purge-by-URL for m44.cl.
//
// Replaces the deploy-time `purge_everything` in .github/workflows/
// deploy-theme.yml as the mechanism for CONTENT freshness. That purge still
// belongs on theme deploys, where every rendered page really does change;
// it just never fired when a post was published, which left the edge serving
// stale HTML for as long as the edge TTL allowed.
//
// This Worker is publicly reachable, so the HMAC signature IS the access
// control -- every request is rejected before its body is parsed unless it
// carries a valid Ghost signature.

import { derive, batch } from './derive.mjs';

const enc = new TextEncoder();

// Constant-time comparison. A fast-exit compare leaks how much of a forged
// signature was correct, which is enough to forge one byte at a time.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Ghost sends: X-Ghost-Signature: sha256=<hex>, t=<unix ms>
// signed over the raw body concatenated with that timestamp.
export async function verifySignature(rawBody, header, secret, { toleranceMs = 5 * 60 * 1000, now = Date.now } = {}) {
  if (!header || !secret) return false;
  const m = /^sha256=([a-f0-9]+),\s*t=(\d+)$/i.exec(header.trim());
  if (!m) return false;
  const [, sig, ts] = m;

  // Reject replays of an old, once-valid delivery.
  if (Math.abs(now() - Number(ts)) > toleranceMs) return false;

  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${rawBody}${ts}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(expected, sig.toLowerCase());
}

async function purge(urls, env) {
  const results = [];
  for (const files of batch(urls)) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CF_PURGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),
      },
    );
    const body = await res.json().catch(() => ({}));
    results.push({ count: files.length, ok: res.ok && body.success === true, errors: body.errors });
  }
  return results;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') return new Response('method not allowed', { status: 405 });

    const raw = await request.text();
    const ok = await verifySignature(raw, request.headers.get('X-Ghost-Signature'), env.GHOST_WEBHOOK_SECRET);
    if (!ok) {
      console.log('[purge] rejected: bad or missing signature');
      return new Response('forbidden', { status: 403 });
    }

    let body;
    try { body = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }

    // post.*, page.* and tag.* all arrive with the same {current, previous} shape.
    const payload = body.post || body.page || body.tag || {};
    const urls = derive(payload, { paginationDepth: Number(env.PAGINATION_DEPTH ?? 5) });

    if (!urls.length) {
      console.log('[purge] nothing to purge for this payload');
      return Response.json({ purged: 0 });
    }

    // Answer Ghost immediately -- it does not retry reliably, and a slow
    // response is more likely to be recorded as a failure than to help.
    ctx.waitUntil((async () => {
      const results = await purge(urls, env);
      const failed = results.filter((r) => !r.ok);
      console.log(`[purge] ${urls.length} urls in ${results.length} batch(es), ${failed.length} failed`);
      for (const f of failed) console.log('[purge] batch error', JSON.stringify(f.errors));
    })());

    return Response.json({ purged: urls.length, urls });
  },
};
