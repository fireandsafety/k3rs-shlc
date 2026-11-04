/* core.js - helper, lapisan API REST (SWR + retry + idempotensi), sesi, router hash, Login Google. Training Fire & Safety Super App SHLC */
var $ = function (id) { return document.getElementById(id); };
var val = function (id) { return $(id).value; };
var ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ENT[c]; }); };
var CFG = window.SHLC || {};
var GAS = CFG.GAS_URL || '';
var save = function (k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
var load = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
var T = '', U = null, Q = null, expRows = [], userRows = [], GCID = '', GTOKEN = '';
var quizPoll = null, LS = null, scanLog = [], scanBusy = false, lastPid = '', lastAt = 0, curTab = '';
var CONSENT = 'Saya menyetujui data pribadi saya (nama, NIK, tanggal lahir, unit kerja, nomor WhatsApp, dan email) dikumpulkan dan diproses oleh Siloam Hospitals Lippo Cikarang untuk pelaksanaan training, pencatatan kehadiran, penilaian, serta penerbitan dan verifikasi sertifikat. Saya dapat mengunduh salinan data saya atau mengajukan penghapusan melalui menu Profil.';

function pd(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/);
  return m ? new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : new Date(NaN);
}
function dt(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/);
  if (!m) return esc(String(s || '').replace('T', ' ').slice(0, 16));
  var z = function (n) { return ('0' + n).slice(-2); };
  return esc(m[1] + '-' + z(m[2]) + '-' + z(m[3]) + (m[4] ? ' ' + z(m[4]) + ':' + m[5] : ''));
}
function normWa(v) {
  var raw = String(v == null ? '' : v).trim(), dg = raw.replace(/\D/g, '');
  if (!dg) return '';
  if (raw.charAt(0) === '+') return '+' + dg;
  if (dg.indexOf('62') === 0) return '+' + dg;
  if (dg.charAt(0) === '0') return '+62' + dg.slice(1);
  if (dg.charAt(0) === '8') return '+62' + dg;
  return '+' + dg;
}
function waNum(v) { var n = normWa(v); return /^\+62[1-9]\d{7,12}$/.test(n) ? n.slice(1) : ''; }
function ini(n) { var p = String(n || '?').trim().split(/\s+/); return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase(); }
function bdg(t) {
  var c = /^(Hadir|Lulus|Selesai)$/.test(t) ? 'ok' : /^Gagal$/.test(t) ? 'bad' : /^Belum/.test(t) ? 'warn' : '';
  return '<span class="badge ' + c + '">' + esc(t) + '</span>';
}
function toast(m) {
  var e = $('toast'); e.textContent = m; e.style.display = 'block';
  clearTimeout(toast.t); toast.t = setTimeout(function () { e.style.display = 'none'; }, 4200);
}
function unitCtl(id, cur, list, kosongAwal) {
  if (!list || !list.length) return '<input id="' + id + '" value="' + esc(cur || '') + '">';
  var h = '<select id="' + id + '">';
  if (kosongAwal) h += '<option value="">Pilih unit kerja</option>';
  if (cur && list.indexOf(cur) < 0) h += '<option value="' + esc(cur) + '" selected>' + esc(cur) + ' (saat ini)</option>';
  list.forEach(function (n) { h += '<option value="' + esc(n) + '"' + (n === cur ? ' selected' : '') + '>' + esc(n) + '</option>'; });
  return h + '</select>';
}
async function loadUnits() { var l = await api('daftarUnit'); if (l && l.length && $('s-unit-w')) $('s-unit-w').innerHTML = unitCtl('s-unit', '', l, true); }
function loadScript(src) {
  loadScript.c = loadScript.c || {};
  if (loadScript.c[src]) return loadScript.c[src];
  return loadScript.c[src] = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = function () { delete loadScript.c[src]; no(new Error('Gagal memuat ' + src)); }; document.head.appendChild(s); });
}

/* ================= LAPISAN API (gas-instant-ux-pro) ================= */
var PUBR = { daftarUnit: 1, appConfig: 1, verifyInfo: 1, deVerifikasi: 1, signUp: 1, requestReset: 1, doReset: 1, login: 1, loginGoogle: 1, signUpGoogle: 1, logout: 1 };
// detik kesegaran cache klien per aksi baca (0 = selalu ke server)
var READ = { me: 45, getSchedule: 30, myReg: 30, myStatus: 30, myCert: 60, evalStatus: 60, statusPermintaanSaya: 60, quizStatus: 10, roster: 12, statusAntrean: 15,
  statusBankSoal: 60, reportData: 45, expiryOverview: 60, expiredList: 60, listUsers: 45, permintaanData: 30, unitAdmin: 45, statusCadangan: 60, riwayatLog: 20,
  daftarUnit: 300, appConfig: 300, notifConfig: 30, crmList: 30, blastList: 20, importInfo: 300, deTemplates: 45, deGenerated: 20, deOfficials: 45, keamananConfig: 30 };
var MC = {}, INFL = {}, EPOCH = 0, FOLLOW = {};
var Perf = { rows: [], add: function (a, total, server, c) { this.rows.push({ aksi: a, total: total, server: server == null ? null : server, jaringan: server != null ? total - server : null, cache: !!c }); if (this.rows.length > 200) this.rows.shift(); }, table: function () { console.table(this.rows.slice(-30)); } };
function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; }
function ckey(fn, a) { return fn + '|' + JSON.stringify(PUBR[fn] ? a : a.slice(1)); }
function persistOk(fn) { return U && U.role === 'peserta' || fn === 'daftarUnit' || fn === 'appConfig'; }   // data staf (PII) tidak disimpan di perangkat
function lsKey(k) { return 'shlc:v4:' + (U ? U.uid : 'pub') + ':' + k; }
function cacheGet(k, fn) {
  var c = MC[k]; if (c) return c;
  if (persistOk(fn)) { var s = load(lsKey(k)); if (s) { try { c = JSON.parse(s); MC[k] = c; return c; } catch (e) {} } }
  return null;
}
function cachePut(k, fn, d, noPersist) {
  var o = { t: Date.now(), h: hashStr(JSON.stringify(d)), d: d }; MC[k] = o;
  if (!noPersist && persistOk(fn)) save(lsKey(k), JSON.stringify(o));
  return o;
}
function cacheClear() {
  MC = {}; EPOCH++;
  try { Object.keys(localStorage).filter(function (x) { return x.indexOf('shlc:v4:') === 0; }).forEach(function (x) { localStorage.removeItem(x); }); } catch (e) {}
}
function waitOnline(ms) { return new Promise(function (r) { if (navigator.onLine !== false) return r(); var t = setTimeout(done, ms); function done() { clearTimeout(t); removeEventListener('online', done); r(); } addEventListener('online', done); }); }
async function apiOnce(body, timeout) {
  var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, timeout), t0 = performance.now();
  try {
    var res = await fetch(GAS, { method: 'POST', redirect: 'follow', cache: 'no-store', signal: ctrl.signal, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    var text = await res.text(), j;
    try { j = JSON.parse(text); } catch (e) { return { success: false, network: true, retryable: res.status >= 500 || res.status === 429, message: 'Server membalas HTTP ' + res.status + ' (bukan JSON).' }; }
    Perf.add(body.action, Math.round(performance.now() - t0), j.ms, j.cached); return j;
  } catch (err) { return { success: false, network: true, retryable: true, message: err.name === 'AbortError' ? 'Server terlalu lama merespons.' : 'Koneksi terputus.' }; }
  finally { clearTimeout(timer); }
}
async function rawCall(fn, args, isRead) {
  var body = { action: fn, args: args }, tries = isRead ? 3 : 2, res;
  if (!isRead) body.reqId = (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random());
  if (!GAS || GAS.indexOf('XXXX') > -1) return { success: false, message: 'Alamat server (GAS_URL) belum diisi di js/config.js.' };
  for (var i = 0; i < tries; i++) {
    if (i) { await new Promise(function (r) { setTimeout(r, 1200 * i); }); if (navigator.onLine === false) await waitOnline(15000); }
    res = await apiOnce(body, isRead ? (i ? 40000 : 25000) : 90000);
    if (res.success || !res.retryable) break;
  }
  return res;
}
function handleRes(fn, res, quiet) {
  if (res.success) { if (res.nq > 0) scheduleDrain(); return res.data; }
  if (res.code === 'AUTH' && T) { onSessionExpired(); return null; }
  if (!quiet) toast(res.message || 'Terjadi kesalahan.');
  return null;
}
/* api(fn, ...args) -> data atau null (toast bila gagal). Argumen pertama aksi bertoken = T (sama seperti versi lama). */
async function api(fn) {
  var a = Array.prototype.slice.call(arguments, 1), ttl = READ[fn];
  if (!ttl) {                                                                         // ===== TULIS =====
    var r = await rawCall(fn, a, false);
    if (r.success) { cacheClear(); }
    return handleRes(fn, r);
  }
  var k = ckey(fn, a), c = cacheGet(k, fn), age = c ? (Date.now() - c.t) / 1000 : 1e9;
  if (c && age < ttl) { Perf.add(fn, 0, null, true); return c.d; }                   // segar: tanpa jaringan
  if (c) { revalidate(fn, a, k, c); return c.d; }                                    // basi: tampilkan lalu segarkan di latar
  var f = k + '#' + EPOCH;
  if (INFL[f]) return INFL[f];
  var p = rawCall(fn, a, true).then(function (res) {
    delete INFL[f];
    var d = handleRes(fn, res); if (d !== null && d !== undefined) cachePut(k, fn, d); return d;
  });
  INFL[f] = p; return p;
}
async function revalidate(fn, a, k, old) {
  var f = 'rv' + k + '#' + EPOCH; if (INFL[f]) return; INFL[f] = 1; var ep = EPOCH;
  try {
    var res = await rawCall(fn, a, true);
    if (ep !== EPOCH) return;
    if (res.success && res.data !== null && res.data !== undefined) {
      var n = cachePut(k, fn, res.data); if (n.h !== old.h) softRerender();
    } else if (res.code === 'AUTH' && T) onSessionExpired();
  } finally { delete INFL[f]; }
}
var rrT = null;
function softRerender() {                                                            // render ulang hanya bila data berubah dan pengguna tidak sedang mengisi
  clearTimeout(rrT); rrT = setTimeout(function () {
    if (!U || !curTab || !V[curTab] || LS || Q || document.hidden) return;
    var ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && $('M').contains(ae)) return;
    if (document.querySelector('#M input.sel:checked')) return;
    V[curTab](true);
  }, 200);
}
var drainT = null, drainN = 0;
function scheduleDrain() { clearTimeout(drainT); drainT = setTimeout(async function () { if (!T) return; var r = await rawCall('drain', [T], false); if (r.success && drainN++ < 3) { /* tuntas */ } }, 500); }
function warmUp() { try { fetch(GAS + '?w=1&_=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).catch(function () {}); } catch (e) {} }
async function prefetch() {                                                          // menu lain dimuat saat idle: 1 panggilan batch
  var plan = { peserta: [['quizStatus'], ['daftarUnit'], ['statusPermintaanSaya']],
    trainer: [['reportData'], ['statusAntrean'], ['statusBankSoal'], ['expiryOverview'], ['getSchedule']],
    admin: [['listUsers'], ['permintaanData'], ['unitAdmin'], ['expiryOverview'], ['statusCadangan'], ['riwayatLog', '']] }[U.role] || [];
  var calls = [];
  plan.forEach(function (p) { var fn = p[0], args = PUBR[fn] ? p.slice(1) : [T].concat(p.slice(1)); if (!cacheGet(ckey(fn, args), fn) || (Date.now() - cacheGet(ckey(fn, args), fn).t) / 1000 > READ[fn]) calls.push({ action: fn, args: args, key: ckey(fn, args) }); });
  if (!calls.length) return;
  var ep = EPOCH, res = await apiOnce({ action: 'batch', calls: calls }, 40000);
  if (ep !== EPOCH || !res.success) return;
  calls.forEach(function (c) { var r = res.data[c.key]; if (r && r.success && r.data !== null && r.data !== undefined) cachePut(c.key, c.action, r.data); });
}

/* apiMany: beberapa panggilan baca dalam SATU permintaan batch. list = [[fn, ...args], ...] (argumen sama seperti api()).
   Yang masih segar di cache tidak dikirim; hasil dikembalikan berurutan (null bila gagal). */
async function apiMany(list) {
  var out = new Array(list.length), need = [];
  list.forEach(function (x, i) {
    var fn = x[0], a = x.slice(1), ttl = READ[fn];
    if (!ttl) { need.push({ i: i, solo: true, fn: fn, a: a }); return; }
    var k = ckey(fn, a), c = cacheGet(k, fn);
    if (c && (Date.now() - c.t) / 1000 < ttl) { out[i] = c.d; return; }
    need.push({ i: i, fn: fn, a: a, k: k, old: c });
  });
  var many = need.filter(function (n) { return !n.solo; });
  if (many.length > 1) {
    var ep = EPOCH, res = await apiOnce({ action: 'batch', calls: many.map(function (n) { return { action: n.fn, args: n.a, key: n.k }; }) }, 40000);
    if (ep === EPOCH && res && res.success && res.data) {
      many.forEach(function (n) { var r = res.data[n.k]; if (r && r.success && r.data !== null && r.data !== undefined) { cachePut(n.k, n.fn, r.data); out[n.i] = r.data; n.done = true; } });
    } else if (res && res.code === 'AUTH' && T) { onSessionExpired(); return out; }
  }
  await Promise.all(need.map(function (n) { if (n.done) return null; return api.apply(null, [n.fn].concat(n.a)).then(function (d) { out[n.i] = d; }); }));
  return out;
}
function idle(fn) { (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(fn); }

/* ================= SHELL, SESI, ROUTER ================= */
var V = {};
function show(id) {
  ['v-login', 'v-signup', 'v-forgot', 'v-reset', 'v-verify', 'v-darurat', 'v-app'].forEach(function (x) { $(x).classList.toggle('hide', x !== id); });
  if (id === 'v-login') { if (!$('v-login').firstChild) initLoginView(); initGoogle(); }
  if (id === 'v-signup') { GTOKEN = ''; $('su-form').classList.add('hide'); $('su-google').classList.remove('hide'); initGoogle(); loadUnits(); }
  if (id !== 'v-app') window.scrollTo(0, 0);
}
var PGDESC = { quiz: 'Pre-test dan Post-test', prof: 'Data pribadi dan keamanan akun', exp: 'Pantau masa berlaku sertifikat', unit: 'Daftar unit kerja baku dan jumlah karyawan', log: 'Riwayat perubahan dan cadangan data', rst: 'Atur ulang password pengguna', more: 'Menu tambahan', notif: 'WhatsApp, email, dan blast', crm: 'Kontak Nama - Email - WhatsApp', dok: 'Dokumen berbasis templat dan tanda tangan pejabat', mig: 'Impor data dari aplikasi lama', sec: 'Login Google dan kebijakan akses' };
var M = function (h) {
  var m = $('M'), ti = typeof tabInfo === 'function' && U ? tabInfo(curTab) : null, title = curTab === 'more' ? 'Lainnya' : ti ? ti[1] : '', icon = curTab === 'more' ? 'apps' : ti ? ti[2] : 'info';
  var w = '<div class="legacy max-w-[1440px] mx-auto p-4 lg:p-8"><div class="flex items-center gap-3 mb-5"><div class="w-11 h-11 rounded-xl bg-secondary-container text-on-secondary flex items-center justify-center shadow-[0_8px_20px_rgba(217,72,15,0.25)]"><span class="material-symbols-outlined">' + icon + '</span></div><div><h1 class="font-headline-md text-headline-md text-on-surface leading-tight">' + esc(title) + '</h1><p class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">' + esc(PGDESC[curTab] || '') + '</p></div></div>' + h + '</div>';
  if (M.last === w) return; M.last = w; m.innerHTML = w;
};
function setWho() {
  $('hd-name').textContent = U.nama_ktp; $('hd-role').textContent = (U.role === 'admin' ? 'Admin K3' : U.role === 'trainer' ? 'Trainer K3' : 'Peserta') + (U.unit_kerja ? ' - ' + U.unit_kerja : ''); $('hd-av').textContent = ini(U.nama_ktp);
  $('mh-role').textContent = U.role === 'admin' ? 'K3 Admin' : U.role === 'trainer' ? 'Trainer' : (U.unit_kerja || 'Peserta'); $('mh-sub').textContent = U.role === 'peserta' ? U.nama_ktp : 'SHLC Fire & Safety';
}
async function darurat() { var r = await api('loginDarurat', val('d-u'), val('d-p'), val('d-k')); if (r) { $('d-p').value = ''; $('d-k').value = ''; startSession(r); } }
async function signup() {
  if (!GTOKEN) { toast('Masuk dengan Google terlebih dahulu.'); return; }
  var d = { nama_ktp: val('s-nama'), nik: val('s-nik'), tgl_lahir: val('s-tgl'), unit_kerja: val('s-unit'), no_wa: normWa(val('s-wa')), email: val('s-email'), username: val('s-user'), password: val('s-pass'), setuju: $('s-setuju').checked };
  if (GTOKEN) { d.idToken = GTOKEN; var g = await api('signUpGoogle', d); if (g) { GTOKEN = ''; startSession(g); } return; }
  var r = await api('signUp', d); if (r) { toast(r); show('v-login'); }
}
async function login() {
  var b = $('l-btn'); b.disabled = true;
  var r = await api('login', val('l-u'), val('l-p')); b.disabled = false; if (!r) return;
  startSession(r);
}
function startSession(r) {
  T = r.token; U = r.user; save('shlc_t', T); save('shlc_u', JSON.stringify(U)); cacheClear();
  Object.keys(r.boot || {}).forEach(function (k) { var fn = k.split('|')[0]; cachePut(PUBR[fn] ? k : k, fn, r.boot[k]); });
  if ($('l-p')) $('l-p').value = ''; boot();
}
function onSessionExpired() {
  if (!T) return; T = ''; U = null; save('shlc_t', null); save('shlc_u', null); cacheClear();
  show('v-login'); location.hash = ''; toast('Sesi berakhir, silakan masuk lagi.');
}
async function logout() {
  if (LS) await stopScan();
  rawCall('logout', [T], false); T = ''; U = null; curTab = ''; save('shlc_t', null); save('shlc_u', null); save('shlc_tab', null); cacheClear(); M.last = null;
  if ($('l-p')) $('l-p').value = ''; show('v-login'); location.hash = '';
}
async function forgot() { var r = await api('requestReset', val('f-email')); if (r) { toast(r); show('v-login'); } }
var RESET = '';
async function reset() { var r = await api('doReset', RESET, val('r-p')); if (r) { toast(r); RESET = ''; location.hash = ''; show('v-login'); } }

var TABS = {
  peserta: [['home', 'Beranda', 'home', 1], ['quiz', 'Kuis', 'quiz', 1], ['prof', 'Profil', 'account_circle', 1]],
  trainer: [['jadwal', 'Agenda', 'calendar_month', 1], ['scan', 'Scan QR', 'qr_code_scanner', 1], ['lap', 'Laporan', 'assignment', 1], ['exp', 'Expired', 'warning', 1], ['prof', 'Profil', 'badge', 1]],
  admin: [['lap', 'Laporan', 'assignment', 1], ['usr', 'Pengguna', 'manage_accounts', 1], ['unit', 'Unit', 'domain', 1], ['log', 'Log', 'history_edu', 1], ['exp', 'Expired', 'warning', 0], ['notif', 'Notifikasi', 'notifications_active', 0], ['crm', 'Kontak', 'contacts', 0], ['mig', 'Migrasi', 'cloud_upload', 0], ['sec', 'Keamanan', 'security', 0]]
};
var STITCH = { home: 1, quiz: 1, prof: 1, jadwal: 1, scan: 1, lap: 1, usr: 1, exp: 1, unit: 1, log: 1, notif: 1, crm: 1, mig: 1, sec: 1, rst: 1 };
function isMob() { return window.innerWidth < 900; }
function boot() {
  setWho();
  if (!U.setuju) { show('v-app'); $('side').innerHTML = ''; $('bnav-in').innerHTML = ''; consent(); return; }
  buildNav(); show('v-app'); route();
  idle(prefetch); idle(prefetchTpl);
}
function buildNav() {
  var tb = TABS[U.role], hasMore = tb.some(function (t) { return !t[3]; });
  $('side').innerHTML = tb.map(function (t) { return '<button type="button" class="nav-i" data-t="' + t[0] + '" title="' + t[1] + '" onclick="go(\'' + t[0] + '\')"><span class="material-symbols-outlined text-[22px]">' + t[2] + '</span><span class="font-label-sm text-label-sm uppercase mt-1 scale-90">' + t[1] + '</span></button>'; }).join('');
  $('bnav-in').innerHTML = tb.filter(function (t) { return t[3]; }).map(function (t) { return '<button type="button" class="flex-1 flex flex-col items-center justify-center h-12 transition-all duration-200 text-on-primary-container" data-t="' + t[0] + '" onclick="go(\'' + t[0] + '\')"><span class="material-symbols-outlined text-[20px]">' + t[2] + '</span><span class="font-label-sm text-label-sm mt-0.5">' + t[1] + '</span></button>'; }).join('') +
    (hasMore ? '<button type="button" class="flex-1 flex flex-col items-center justify-center h-12 transition-all duration-200 text-on-primary-container" data-t="more" onclick="openMore()"><span class="material-symbols-outlined text-[20px]">apps</span><span class="font-label-sm text-label-sm mt-0.5">Lainnya</span></button>' : '');
}
function openMore() {
  $('more-grid').innerHTML = TABS[U.role].filter(function (t) { return !t[3]; }).map(function (t) { return '<button type="button" onclick="closeMore();go(\'' + t[0] + '\')" class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-container-low active:scale-95 transition-transform"><span class="w-11 h-11 rounded-xl bg-secondary-container text-on-secondary flex items-center justify-center shadow-[0_6px_14px_rgba(217,72,15,0.25)]"><span class="material-symbols-outlined">' + t[2] + '</span></span><span class="font-label-md text-label-md text-on-surface text-center">' + t[1] + '</span></button>'; }).join('') +
    '<button type="button" onclick="closeMore();logout()" class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-red-50 active:scale-95 transition-transform"><span class="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center"><span class="material-symbols-outlined">logout</span></span><span class="font-label-md text-label-md text-red-800">Keluar</span></button>';
  $('more-sheet').classList.remove('hide');
}
function closeMore() { $('more-sheet').classList.add('hide'); }
function prefetchTpl() { TABS[U.role].forEach(function (t) { if (STITCH[t[0]]) ensureTpl(t[0]).catch(function () {}); }); }
function consent() {
  $('M').innerHTML = '<div class="max-w-xl mx-auto p-6"><div class="authcard"><h2 class="font-headline-md text-headline-md mb-1">Persetujuan Data Pribadi</h2><p class="text-on-surface-variant mb-3">Diperlukan sebelum Anda melanjutkan.</p><p class="mb-4">' + esc(CONSENT) + '</p><label class="flex items-center gap-2 mb-4 font-bold"><input type="checkbox" id="cs-ok" class="rounded border-[#D6DBE8] text-secondary"> Saya telah membaca dan menyetujui</label><button class="btn-p w-full" onclick="acceptCons()">Lanjutkan</button></div></div>'; M.last = null;
}
async function acceptCons() {
  if (!$('cs-ok').checked) { toast('Centang persetujuan terlebih dahulu.'); return; }
  var r = await api('terimaPersetujuan', T); if (r) { U.setuju = true; save('shlc_u', JSON.stringify(U)); boot(); }
}
function go(t) { if (location.hash === '#/' + t) { showTab(t, true); return; } location.hash = '#/' + t; }
function tabInfo(t) { var l = TABS[U.role].filter(function (z) { return z[0] === t; })[0]; return l; }
async function showTab(t, again) {
  if (!U || !U.setuju) return;
  var valid = TABS[U.role].some(function (z) { return z[0] === t; }) && V[t];
  if (!valid) t = TABS[U.role][0][0];
  if (LS) stopScan();
  if (quizPoll) { clearInterval(quizPoll); quizPoll = null; }
  stopPoll(); closeMore();
  curTab = t; save('shlc_tab', t);
  var cur = tabInfo(t), title = cur ? cur[1] : '';
  $('pt').textContent = title; $('bc').textContent = title; $('mh-title').textContent = title;
  document.querySelectorAll('#side button, #bnav-in button').forEach(function (b) { var on = b.dataset.t === t || (b.dataset.t === 'more' && cur && !cur[3]); b.classList.toggle('on', on); if (b.parentNode.id === 'bnav-in') { b.classList.toggle('text-secondary-container', on); b.classList.toggle('font-body-md-medium', on); b.classList.toggle('text-on-primary-container', !on); } });
  window.scrollTo(0, 0); M.last = null; var mm = $('M'); mm.className = 'relative pt-20 lg:pt-16 w-full flex-1 bg-[#EEF0F5]';
  mm.innerHTML = '<div class="p-4 lg:p-8 max-w-[1440px] mx-auto space-y-4"><div class="skelb h-28"></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="skelb h-32"></div><div class="skelb h-32"></div><div class="skelb h-32"></div></div><div class="skelb h-64"></div></div>';
  if (STITCH[t]) { try { await ensureTpl(t); } catch (e) { toast('Gagal memuat tampilan. Periksa koneksi.'); return; } if (curTab !== t) return; }
  V[t](); startPoll(t);
}
function route() {
  var h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'v' || h[0] === 'd') { return showVerify(h[0], h[1]); }
  if (h[0] === 'reset' && h[1]) { RESET = h[1]; return show('v-reset'); }
  if (h[0] === 'darurat' && !U) return show('v-darurat');
  if (!U) return;
  if (document.body.className.indexOf('out') === 0) show('v-app');
  var last = load('shlc_tab');
  showTab(h[0] || (TABS[U.role].some(function (t) { return t[0] === last; }) ? last : TABS[U.role][0][0]));
}
async function showVerify(kind, kode) {
  show('v-verify'); var box = $('vf-box'); box.innerHTML = '<div class="skel" style="height:160px"></div>';
  var r = await api(kind === 'v' ? 'verifyInfo' : 'deVerifikasi', kode || ''); var h;
  if (!r) h = '<div class="vs bad"><h2>Tidak dapat memeriksa</h2><p>Periksa koneksi lalu muat ulang halaman.</p></div>';
  else if (!r.found) h = '<div class="vs bad"><h2>Tidak ditemukan</h2><p>Dokumen dengan kode ini tidak terdaftar di sistem SHLC.</p></div>';
  else if (kind === 'v') h = '<div class="vs ' + (r.valid ? 'ok' : 'warn') + '"><h2>' + (r.valid ? 'Sertifikat VALID' : 'Asli, masa berlaku berakhir') + '</h2></div><table class="tbl2"><tr><td>Nama</td><td><b>' + esc(r.nama) + '</b></td></tr><tr><td>NIK</td><td>&bull;&bull;&bull;&bull;' + esc(r.nik4) + '</td></tr><tr><td>No. Sertifikat</td><td>' + esc(r.nomor) + '</td></tr><tr><td>Pelaksanaan</td><td>' + esc(r.tanggal) + '</td></tr><tr><td>Berlaku sampai</td><td>' + esc(r.exp || '-') + '</td></tr></table>';
  else h = '<div class="vs ' + (r.utuh ? 'ok' : 'bad') + '"><h2>' + (r.utuh ? 'Dokumen ASLI dan utuh' : 'Dokumen TIDAK utuh') + '</h2></div><table class="tbl2"><tr><td>Jenis</td><td>' + esc(r.jenis) + '</td></tr><tr><td>Nomor</td><td><b>' + esc(r.nomor) + '</b></td></tr><tr><td>Terbit</td><td>' + esc(r.terbit) + '</td></tr>' +
    (r.penandatangan || []).map(function (p) { return '<tr><td>Penandatangan</td><td>' + esc(p.nama) + '<br><small>' + esc(p.jabatan) + ' &middot; ' + esc(p.waktu) + '</small></td></tr>'; }).join('') + '</table>';
  box.innerHTML = h;
}
function leaveVerify() { location.hash = ''; if (U) { show('v-app'); route(); } else show('v-login'); }

/* ================= LOGIN GOOGLE (Google Identity Services) ================= */
function initGoogle() {
  var ws = ['g-btn', 'g-btn2'].map($).filter(function (x) { return x && x.offsetParent !== null; });
  if (!GCID) { ws.forEach(function (w) { w.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center">Login Google belum diaktifkan oleh admin.</p>'; }); return; }
  loadScript('https://accounts.google.com/gsi/client').then(function () {
    if (!window.google || !google.accounts) return;
    if (!initGoogle.done) { google.accounts.id.initialize({ client_id: GCID, callback: onGoogle, auto_select: false, cancel_on_tap_outside: true }); initGoogle.done = true; }
    ws.forEach(function (w) { w.innerHTML = ''; google.accounts.id.renderButton(w, { theme: 'filled_black', size: 'large', text: w.id === 'g-btn2' ? 'signup_with' : 'signin_with', shape: 'pill', logo_alignment: 'left', width: Math.min(340, Math.max(220, (w.parentNode.clientWidth || 300) - 8)) }); });
  }).catch(function () { ws.forEach(function (w) { w.innerHTML = '<p class="font-body-sm text-body-sm text-error text-center">Tombol Google tidak dapat dimuat. Periksa koneksi.</p>'; }); });
}
async function onGoogle(resp) {
  var r = await api('loginGoogle', resp.credential); if (!r) return;
  if (r.needSignup) {
    var already = !$('v-signup').classList.contains('hide'); show('v-signup'); GTOKEN = resp.credential; $('su-google').classList.add('hide'); $('su-form').classList.remove('hide');
    $('s-email').value = r.google.email; $('s-nama').value = r.google.nama || '';
    toast('Akun Google belum terdaftar. Lengkapi data untuk mendaftar.'); return;
  }
  startSession(r);
}


/* ================= AUTO-REFRESH (polling ringan, satu panggilan batch) ================= */
var pollT = null, POLLSET = { home: [['myStatus'], ['getSchedule'], ['myReg'], ['myCert'], ['quizStatus']], quiz: [['quizStatus'], ['myReg'], ['getSchedule']], jadwal: [['roster']], lap: [['reportData'], ['statusAntrean']], usr: [['listUsers'], ['permintaanData']], exp: [['expiryOverview']], log: [['riwayatLog', '']], notif: [['notifConfig'], ['blastList']] };
function stopPoll() { if (pollT) { clearInterval(pollT); pollT = null; } }
function startPoll(t) { stopPoll(); if (!POLLSET[t] || !U) return; pollT = setInterval(pollNow, U.role === 'peserta' ? 12000 : 20000); }
async function pollNow() {
  if (document.hidden || !U || !T || !POLLSET[curTab] || LS || Q) return;
  var calls = POLLSET[curTab].map(function (p) { var a = [T].concat(p.slice(1)); return { action: p[0], args: a, key: ckey(p[0], a) }; }), ep = EPOCH;
  var res = await apiOnce({ action: 'batch', calls: calls }, 30000); if (ep !== EPOCH || !res.success) { if (res && res.code === 'AUTH') onSessionExpired(); return; }
  var ch = false; calls.forEach(function (c) { var r = res.data[c.key]; if (r && r.success && r.data !== null && r.data !== undefined) { var o = cacheGet(c.key, c.action), n = cachePut(c.key, c.action, r.data); if (!o || o.h !== n.h) ch = true; } });
  if (ch) softRerender();
}
document.addEventListener('visibilitychange', function () { if (!document.hidden) pollNow(); });
var wasMob = isMob(), rzT = null;
window.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(function () { var m = isMob(); if (m === wasMob) return; wasMob = m; if ($('v-app').classList.contains('hide')) { $('v-login').innerHTML = ''; initLoginView(); initGoogle(); } else if (U) showTab(curTab); }, 250); });
