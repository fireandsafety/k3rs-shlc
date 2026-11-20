/* tpl.js - markup layar Stitch (desktop = d, mobile = m); dibuat otomatis */
var TPLRAW = {};
var TPLMAIN = {"login": "flex-1 flex flex-col relative w-full px-margin-mobile bg-surface", "home": "flex flex-col relative w-full px-gutter-sm pt-20 pb-28 bg-surface min-h-screen", "quiz": "flex flex-col relative w-full px-gutter-sm pt-20 pb-28 bg-surface min-h-screen", "prof": "flex flex-col relative w-full px-gutter-sm pt-20 pb-28 bg-surface min-h-screen", "jadwal": "flex-1 flex flex-col relative w-full px-margin-mobile pt-16 pb-28 bg-surface", "scan": "flex-1 flex flex-col relative w-full px-margin-mobile pt-16 pb-28 bg-surface", "lap": "flex-1 flex flex-col relative w-full px-margin-mobile pt-16 pb-28 bg-surface", "usr": "flex-1 flex flex-col relative w-full px-margin-mobile pt-16 pb-28 bg-surface", "exp": "flex-1 w-full bg-surface pt-16 pb-safe", "unit": "flex-1 w-full bg-surface pt-16 pb-safe", "log": "flex-1 w-full bg-surface pt-16 pb-safe", "notif": "flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface", "crm": "flex-1 flex flex-col relative w-full pt-16 pb-safe bg-surface", "mig": "flex-1 w-full pt-16 pb-20 bg-surface px-space-md", "sec": "flex-1 w-full pt-16 pb-20 bg-surface px-space-md", "rst": "flex-1 w-full pt-16 pb-20 bg-surface px-space-md"};
var MOBOK = {};                 // layar yang sudah punya pengikat mobile (diisi views-mobile.js)
var CURVAR = { name: '', v: 'd' };
var TPL = {};
Object.keys(TPLMAIN).forEach(function (k) { Object.defineProperty(TPL, k, { get: function () { var m = typeof isMob === 'function' && isMob() && MOBOK[k] && TPLRAW[k].m; CURVAR = { name: k, v: m ? 'm' : 'd' }; return m ? TPLRAW[k].m : TPLRAW[k].d; } }); });
var TPLL = {};
function ensureTpl(name) {          // muat markup layar saat pertama dibutuhkan (lazy, dan di-cache oleh service worker)
  if (TPLRAW[name]) return Promise.resolve();
  if (TPLL[name]) return TPLL[name];
  return TPLL[name] = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'js/t/' + name + '.js'; s.onload = ok; s.onerror = function () { delete TPLL[name]; no(new Error('tpl ' + name)); }; document.head.appendChild(s); });
}
