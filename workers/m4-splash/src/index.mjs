// m4-splash — streaming splash Worker for m44.cl
// Route: m44.cl/* (fail open)
//
// Approach: stream a minimal splash prefix immediately, then pipe the
// full origin response behind it. The browser receives orange screen
// in ~1ms, then the real page streams in. window.load fires when all
// resources finish → dismiss() slides the splash up.
//
// The streamed response has duplicate <html>/<head>/<body> tags which
// browsers handle gracefully (duplicates are silently ignored).
// This is intentional and the only approach that keeps Ghost Portal,
// web components, and all Ghost-internal scripts working correctly.

// Dark background painted as early as possible — eliminates the white
// flash while the Worker waits on origin.
//
// MUST be emitted AFTER <!DOCTYPE html>, inside <head>. While this style
// was concatenated BEFORE the doctype, the HTML parser discarded the
// doctype and rendered every cache-miss page in QUIRKS MODE (measured:
// document.compatMode === 'BackCompat', document.doctype === null).
// Cache hits serve the clean origin response in standards mode, so the
// breakage only ever appeared on misses.
const INSTANT_BG = `<style id="m4bg">html{background:#110f16;overflow:hidden}</style>`;

// Minimal orange overlay. No body{height:100%} — that was causing the
// phantom 100vh block after the splash dismissed. position:fixed on
// the loader covers the screen without affecting document layout.
const SPLASH = `<!DOCTYPE html><html lang="es"><head>\
<meta charset="utf-8">${INSTANT_BG}\
<meta name="viewport" content="width=device-width,initial-scale=1">\
<title>m44</title>\
<script>\
if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme:dark)').matches)){\
document.documentElement.classList.add('dark');\
}\
<\/script>\
<script>if(sessionStorage.getItem('m4_vis'))document.documentElement.classList.add('m4-skip');<\/script>\
<style>\
.m4-skip #m4-loader{display:none!important}\
#m4-loader{position:fixed;inset:0;z-index:99999;background:#F73E05;display:flex;align-items:center;justify-content:center;transition:transform .85s cubic-bezier(.16,1,.3,1);will-change:transform;pointer-events:all}\
#m4-loader.out{transform:translateY(-100%);pointer-events:none}\
#m4-loader.gone{display:none}\
.m4-logo{width:clamp(120px,30vw,300px);height:auto;display:block;animation:m4p 2s ease-in-out infinite}\
@keyframes m4p{0%,100%{opacity:1}50%{opacity:.5}}\
.m4-hint{position:absolute;bottom:clamp(1.25rem,4vw,2rem);left:50%;transform:translateX(-50%) translateY(8px);color:rgba(255,255,255,.82);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:clamp(.75rem,1.6vw,.875rem);letter-spacing:.04em;white-space:nowrap;opacity:0;transition:opacity .5s,transform .5s}\
.m4-hint.show{opacity:1;transform:translateX(-50%) translateY(0)}\
#m4-loader.out .m4-hint{opacity:0}\
<\/style>\
<\/head>\
<body>\
<div id="m4-loader">\
<svg class="m4-logo" viewBox="0 250 1000 500" xmlns="http://www.w3.org/2000/svg">\
<path fill="#151515" fill-rule="nonzero" d="m299.475 727.825 35.75-76.7-183.3-378.3h-72.8zm151.45-455v455h72.8v-455zm-336.05 455h-72.8l36.4-76.05zM809.075 727.825h72.8v-455h-72.8zm-208-178.75h75.4v-76.7zm280.8 0h76.05v-76.7z"/>\
<\/svg>\
<p class="m4-hint" id="m4h"><\/p>\
<\/div>\
<script>\
(function(){\
var l=document.getElementById('m4-loader'),h=document.getElementById('m4h'),done=false;console.log('[splash] visible | compatMode='+document.compatMode+' doctype='+(document.doctype?document.doctype.name:'(none)'));\
h.textContent=new RegExp('^/en(/|$)').test(location.pathname)?'First time?':'\u00bfPrimera vez?';\
var ht=setTimeout(function(){if(!done)h.classList.add('show');},3000);\
function dismiss(reason){\
if(done)return;done=true;clearTimeout(ht);console.log('[splash] dismissed:',reason||'unknown');\
try{sessionStorage.setItem('m4_vis','1');}catch(e){}\
var bg=document.getElementById('m4bg');if(bg)bg.remove();\
document.documentElement.style.overflow='';\
l.classList.add('out');\
l.addEventListener('transitionend',function(){l.classList.add('gone');l.remove();},{once:true});\
}\
window._m4dismiss=dismiss;\
setTimeout(function(){dismiss('timeout-8s');},8000);\
window.addEventListener('load',function(){dismiss('window-load');},{once:true});\
})();\
<\/script>\
`;


// Params that never change the rendered document. Dropped from the cache
// key so shared links don't each get their own entry, and — critically —
// so the key for a clean URL is byte-identical to the URL the purge
// pipeline emits. See CACHE KEY CONTRACT below.
// Clients that must never be splashed. The splash cannot preserve a status
// code -- the status line ships with the first byte, long before the origin
// has answered -- so anything that reads status codes gets the origin
// response verbatim instead. That is search crawlers (a soft 200 on a 404
// gets broken URLs indexed), link unfurlers, and auditing tools.
const NO_SPLASH_UA = /bot|crawler|spider|crawling|slurp|lighthouse|headlesschrome|facebookexternalhit|embedly|preview|whatsapp|telegram|discord|pinterest|yandex|baiduspider|duckduckbo|applebot|semrush|ahrefs/i;

// Escape for embedding in an inline <script>. JSON.stringify alone is not
// enough: a "</script>" inside the value would close the element early.
const jsString = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

const TRACKING_PARAM = /^(utm_.*|fbclid|gclid|msclkid|mc_cid|mc_eid|igshid|ref)$/i;

// CACHE KEY CONTRACT
// -----------------
// Entries written here live in caches.default, which is the same cache a
// zone purge-by-URL acts on. A purge only evicts this entry when the URL
// it purges matches this key EXACTLY. For a query-less URL that key is
// `https://host/path`, which is the form the purge pipeline emits — so
// they line up. Changing either side without the other silently breaks
// invalidation with no error anywhere. Keep them in sync.
function cacheKeyFor(rawUrl) {
  const u = new URL(rawUrl);
  const kept = new URLSearchParams();
  for (const k of [...new Set(u.searchParams.keys())].sort()) {
    if (TRACKING_PARAM.test(k)) continue;
    for (const v of u.searchParams.getAll(k)) kept.append(k, v);
  }
  const qs = kept.toString();
  return `${u.protocol}//${u.host}${u.pathname}${qs ? '?' + qs : ''}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';
    const log = (...a) => console.log('[splash]', url.pathname, ...a);

    // ── Non-HTML: pass through unchanged ─────────────────────────────────
    if (!accept.includes('text/html')) return fetch(request);

    // ── File extension check ──────────────────────────────────────────────
    const ext = url.pathname.split('.').pop().toLowerCase();
    const nonHtml = new Set([
      'js','css','png','jpg','jpeg','gif','webp','svg','ico',
      'woff','woff2','ttf','otf','eot',
      'mp4','webm','mp3','ogg',
      'pdf','zip','json','xml','txt','map'
    ]);
    if (nonHtml.has(ext)) return fetch(request);

    // ── Ghost internal paths ──────────────────────────────────────────────
    const p = url.pathname;
    if (
      p.startsWith('/ghost/') ||
      p.startsWith('/api/') ||
      p.startsWith('/members/')
    ) {
      log('passthrough: internal path');
      return fetch(request);
    }

    // ── Signed-in users (members and staff) ──────────────────────────────
    // Never splash, never cache — these responses are per-user.
    const cookie = request.headers.get('Cookie') || '';
    if (
      cookie.includes('ghost-admin-api-session') ||
      cookie.includes('ghost-members-ssr')
    ) {
      log('passthrough: authenticated');
      return fetch(request);
    }

    // ── Cache check ───────────────────────────────────────────────────────
    const reqCC = request.headers.get('Cache-Control') || '';
    const bypassCache = reqCC.includes('no-cache') || reqCC.includes('no-store');

    const cacheKey = new Request(cacheKeyFor(request.url), {
      method: 'GET', headers: { 'Accept': 'text/html' }
    });
    const cache = caches.default;

    if (!bypassCache) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        log('hit');
        const r = new Response(cached.body, cached);
        r.headers.set('X-M4-Worker', 'hit');
        return r;
      }
    }

    // ── Clients that need a truthful status code ─────────────────────────
    // Placed after the cache lookup on purpose: a cache hit replays a real
    // origin response (only 2xx are ever stored), so it is correct for these
    // clients and saves the low-RAM origin a render.
    if (NO_SPLASH_UA.test(request.headers.get('User-Agent') || '')) {
      log('passthrough: no-splash client');
      return fetch(request);
    }

    // ── Cache miss ────────────────────────────────────────────────────────
    const originRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      // An incoming Request carries redirect:'manual', but a Request built
      // from a URL defaults to 'follow'. Without this, Cloudflare follows a
      // Ghost 301 internally and serves the target's body under the original
      // URL -- so /rss and /rss/ both returned 200 with identical content,
      // and the 3xx branch below could never fire.
      redirect: 'manual',
      cf: {
        cacheEverything: !bypassCache,
        cacheTtlByStatus: bypassCache ? undefined : {
          '200-299': 300,
          '301-302': 60,
          '404': 30,
          '500-599': 0,
        },
      },
    });
    const originPromise = fetch(originRequest);

    // Give the origin a short head start. If it answers within the deadline
    // we forward its response verbatim — correct status, correct headers,
    // working redirects — and skip the splash, because a response that fast
    // never needed one.
    //
    // Committing to the splash means committing to `200` before the status
    // is known: once the first byte is on the wire the status line is
    // already sent. That is why the old unconditional splash turned every
    // Ghost 404 into a soft 200 and swallowed every 301/302 redirect,
    // streaming the redirect's body instead of following it.
    const deadlineMs = Number(env?.SPLASH_DEADLINE_MS ?? 200);
    const FELL_THROUGH = Symbol('deadline');
    const winner = await Promise.race([
      originPromise.catch(() => null),
      new Promise((res) => setTimeout(() => res(FELL_THROUGH), deadlineMs)),
    ]);

    if (winner !== FELL_THROUGH) {
      if (!winner) {
        log('origin error; failing open');
        return fetch(request);
      }
      log('fast origin', winner.status, '— passthrough, no splash');
      if (winner.ok && !bypassCache) {
        ctx.waitUntil(cache.put(cacheKey, winner.clone()));
      }
      const r = new Response(winner.body, winner);
      r.headers.set('X-M4-Worker', 'fast');
      return r;
    }

    // ── Slow origin: stream the splash, then pipe the body behind it ─────
    log('slow origin >', deadlineMs + 'ms — splashing');
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();

    ctx.waitUntil((async () => {
      try {
        const origin = await originPromise;
        if (origin.ok && !bypassCache) {
          ctx.waitUntil(cache.put(cacheKey, origin.clone()));
        }
        // The status line is already sent as 200, so a redirect cannot be
        // expressed in the response. Hand it to the client instead of
        // streaming the redirect's placeholder body, which is what used to
        // leave the reader on a blank page behind the splash.
        const loc = origin.headers.get('Location');
        if (origin.status >= 300 && origin.status < 400 && loc) {
          await writer.write(enc.encode(
            `<script>console.log('[splash] origin ${origin.status}, redirecting client');`
            + `location.replace(${jsString(loc)});<\/script>`
          ));
          return;
        }

        // 204/304 and other bodiless responses have a null body.
        if (!origin.body) {
          await writer.write(enc.encode('</body></html>'));
          return;
        }
        const reader = origin.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);   // awaited: respect backpressure
        }
      } catch (err) {
        await writer.write(enc.encode(
          `<script>console.error('[splash] origin stream failed');<\/script></body></html>`
        ));
      } finally {
        writer.close();
      }
    })());

    writer.write(enc.encode(SPLASH));

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-M4-Worker': 'splash',
      },
    });
  },
};
