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

// Painted before everything — dark background appears in ~1ms,
// eliminates white flash on click while Worker fetches origin.
const INSTANT_BG = `<style id="m4bg">html{background:#110f16;overflow:hidden}</style>`;

// Minimal orange overlay. No body{height:100%} — that was causing the
// phantom 100vh block after the splash dismissed. position:fixed on
// the loader covers the screen without affecting document layout.
const SPLASH = `<!DOCTYPE html><html lang="es"><head>\
<meta charset="utf-8">\
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
var l=document.getElementById('m4-loader'),h=document.getElementById('m4h'),done=false;\
h.textContent=new RegExp('^/en(/|$)').test(location.pathname)?'First time?':'\u00bfPrimera vez?';\
var ht=setTimeout(function(){if(!done)h.classList.add('show');},3000);\
function dismiss(){\
if(done)return;done=true;clearTimeout(ht);\
try{sessionStorage.setItem('m4_vis','1');}catch(e){}\
var bg=document.getElementById('m4bg');if(bg)bg.remove();\
document.documentElement.style.overflow='';\
l.classList.add('out');\
l.addEventListener('transitionend',function(){l.classList.add('gone');l.remove();},{once:true});\
}\
window._m4dismiss=dismiss;\
setTimeout(dismiss,8000);\
window.addEventListener('load',function(){dismiss();},{once:true});\
})();\
<\/script>\
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const accept = request.headers.get('Accept') || '';

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
      return fetch(request);
    }

    // ── Logged-in editors ─────────────────────────────────────────────────
    const cookie = request.headers.get('Cookie') || '';
    if (
      cookie.includes('ghost-admin-api-session') ||
      cookie.includes('ghost-members-ssr')
    ) {
      return fetch(request);
    }

    // ── Cache check ───────────────────────────────────────────────────────
    const reqCC = request.headers.get('Cache-Control') || '';
    const bypassCache = reqCC.includes('no-cache') || reqCC.includes('no-store');

    const cacheKey = new Request(
      `${url.protocol}//${url.host}${url.pathname}`,
      { method: 'GET', headers: { 'Accept': 'text/html' } }
    );
    const cache = caches.default;

    if (!bypassCache) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        // Cache hit — serve instantly, no splash needed
        return cached;
      }
    }

    // ── Cache miss: stream INSTANT_BG + SPLASH immediately ───────────────
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();

    const originRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
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

    ctx.waitUntil((async () => {
      try {
        const origin = await originPromise;
        if (origin.ok && !bypassCache) {
          ctx.waitUntil(cache.put(cacheKey, origin.clone()));
        }
        const reader = origin.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          writer.write(value);
        }
      } catch (err) {
        writer.write(enc.encode('</body></html>'));
      } finally {
        writer.close();
      }
    })());

    // Dark bg lands first (~1ms), splash overlay follows immediately
    writer.write(enc.encode(INSTANT_BG + SPLASH));

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
