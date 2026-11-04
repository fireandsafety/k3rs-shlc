/* views-mobile.js - pengikat varian MOBILE Stitch. MASIH KOSONG: isi per layar lalu daftarkan di MOBOK (lihat HANDOFF).
   Pola: var _hD = V.home; V.home = function () { return isMob() ? homeM.apply(this, arguments) : _hD.apply(this, arguments); }; MOBOK.home = 1; */

MOBOK.login = 1;   // login: varian mobile Stitch diikat oleh initLoginView (views-stitch2.js)

/* ===================== HOME (peserta) - varian mobile ===================== */
function hariKe(tgl) { var d = pd(tgl); if (isNaN(d)) return ''; var a = new Date(d); a.setHours(0, 0, 0, 0); var b = new Date(); b.setHours(0, 0, 0, 0); var n = Math.round((a - b) / 864e5); return n > 0 ? 'H-' + n : n === 0 ? 'Hari ini' : 'Lewat'; }
function msg(sec, title, text) { sec.innerHTML = '<div class="flex flex-col gap-1"><h3 class="font-title-lg text-title-lg text-on-surface">' + esc(title) + '</h3><p class="font-body-sm text-body-sm text-on-surface-variant">' + esc(text) + '</p></div>'; }
var _homeD = V.home;
V.home = function () { return isMob() ? homeM.apply(this, arguments) : _homeD.apply(this, arguments); };
MOBOK.home = 1;
async function homeM() {
  var res = await apiMany([['myStatus', T], ['getSchedule', T], ['myReg', T], ['myCert', T], ['evalStatus', T], ['quizStatus', T]]);
  var m = res[0], s = res[1], g = res[2], ct = res[3], ev = res[4], qs = res[5], r = MS(TPL.home), sec = r.querySelectorAll('section');
  var st = m ? m.state : 'belum', online = s && s.jenis === 'online', done = g && s && g.sid === s.sid, hero = sec[0];
  /* hero */
  S(hero, 'Aktif & Terverifikasi', { ok: 'Aktif & Terverifikasi', soon: 'Segera Berakhir', expired: 'Kedaluwarsa', belum: 'Belum Bersertifikat' }[st] || 'Belum Bersertifikat');
  var sisa = m && m.sisa >= 0 ? m.sisa : 0; S(hero, '324', sisa); S(hero, 'Hari Tersisa', st === 'belum' ? 'Belum ada masa berlaku' : st === 'expired' ? 'Hari, sudah lewat' : 'Hari Tersisa');
  S(hero, 'Kondisi Prima (Level A1)', { ok: 'Kondisi Prima', soon: 'Segera Perpanjang (' + (m && m.exp ? tglLong(m.exp) : '') + ')', expired: 'Wajib Retraining', belum: 'Daftar training, lulus Post-test min. 80' }[st] || '-');
  var circ = hero.querySelectorAll('circle'), ring = circ[1], pct = Math.round(Math.min(1, sisa / 365) * 100);
  if (ring) { var da = parseFloat(ring.getAttribute('stroke-dasharray')) || 226; ring.setAttribute('stroke-dashoffset', String(Math.round(da * (1 - pct / 100)))); }
  S(hero, '88%', pct + '%'); S(hero, 'SHLC-2021-0842', U.nik || '-'); S(hero, 'ICU Lantai 2 (Kritis)', U.unit_kerja || '-');
  /* dua ubin */
  var tl = sec[1]; S(tl, 'H-2', s ? hariKe(s.tanggal) : ''); S(tl, 'Jumat, 24 Okt', s ? tglMid(s.tanggal) : 'Belum ada'); S(tl, '08:30 - 11:45 WIB', s ? jamTxt(s.tanggal) : 'Menunggu trainer');
  S(tl, 'Lulus KKM 80', qs && qs.lulus ? 'Lulus' : 'Belum lulus'); S(tl, 'Post-test Terakhir', 'Skor Terbaik'); S(tl, '92', qs && qs.best != null ? qs.best : '-'); S(tl, 'Skor Kepatuhan Prima', qs && qs.lulus ? 'Standar KKM 80 tercapai' : 'Minimal 80 untuk lulus');
  /* jadwal */
  var jd = sec[2];
  if (!s) { msg(jd, 'Belum ada jadwal training', 'Trainer belum mempublikasikan jadwal. Halaman diperbarui otomatis.'); }
  else {
    S(jd, 'Sesi 03 • Q4-2024', s.sid); S(jd, 'Code Red: Penanganan Kebakaran & Evakuasi Pasien Kritis', 'Training Fire & Safety (' + (online ? 'Online' : 'Offline QR') + ')');
    var jp = jd.querySelector('p'); if (jp) jp.textContent = tglPanjang(s.tanggal) + ', ' + jamTxt(s.tanggal) + '. ' + (done ? 'Anda sudah terdaftar pada sesi ini.' : 'Pendaftaran dibuka.');
    gone(jd.querySelector('.relative.w-full.h-32')); gone(find(jd, 'Kapasitas: Sisa 4')); S(jd, 'Auditorium Gedung B, Lantai 4', online ? 'Online (Meeting)' : 'Sesuai pengumuman trainer');
    var bd = $('btnDaftarSesi'); if (done) { setTxt(find(bd, 'Daftar Sesi Ini'), 'Telah Terdaftar'); bd.disabled = true; bd.classList.remove('bg-secondary'); bd.classList.add('bg-emerald-600'); } else bd.onclick = reg;
    $('btnSyncKalender').onclick = function () { if (done) dlIcs(); else toast('Daftar dulu pada jadwal ini.'); };
  }
  /* ID & QR */
  var idc = sec[3];
  if (!g) hid(idc);
  else {
    S(idc, 'PID-SHLC-2026-0992', g.pid);
    var qbox = idc.querySelector('.relative.p-3\\.5'), qcol = qbox && qbox.parentElement, tok = up($('inputTokenDarurat'), 3);
    if (g.status === 'Hadir') { var cb = idc.children[1]; while (idc.children.length > 1) idc.removeChild(idc.lastChild); idc.insertAdjacentHTML('beforeend', '<div class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-800"><span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1">check_circle</span><div><div class="font-title-md text-title-md">Kehadiran tercatat</div><div class="font-body-sm text-body-sm">' + esc(g.waktu_hadir || '') + '</div></div></div>'); }
    else if (g.jenis === 'online') {
      gone(qcol); S(idc, 'Token Cadangan Darurat (Manual Input)', 'Kode Absensi Online'); S(idc, 'Koneksi Lemah?', 'Dari trainer'); var ti = $('inputTokenDarurat'); ti.placeholder = 'Kode absensi'; ti.maxLength = 12; ti.setAttribute('inputmode', 'numeric'); S(idc, 'Konfirmasi Hadir', 'Konfirmasi');
      $('btnKonfirmasiHadir').onclick = function () { attend2(ti.value); }; var fb = $('statusTokenFeedback'); if (fb) gone(fb);
    } else {
      var svg = qbox.querySelector('svg'); if (svg) { var w = document.createElement('div'); w.innerHTML = qrSvg(g.pid, svg.getAttribute('class')); var ns = w.firstChild; if (ns) svg.parentNode.replaceChild(ns, svg); }
      gone(tok); S(idc, 'Tunjukkan ke Scanner Instruktur Lapangan saat apel keselamatan', 'Tunjukkan QR ini ke trainer saat masuk ruangan.');
    }
  }
  /* sertifikat */
  var cs = sec[4];
  if (!ct) msg(cs, 'Sertifikat Digital K3', m && m.state !== 'belum' ? 'Sertifikat sedang disiapkan trainer dan akan dikirim ke email Anda.' : 'Sertifikat terbit otomatis setelah Anda lulus Post-test (nilai minimal 80).');
  else {
    S(cs, 'Regulasi Standar Akreditasi KARS', 'Training Fire & Safety'); S(cs, 'v2.4', st === 'ok' ? 'Terverifikasi' : st === 'soon' ? 'Segera Berakhir' : 'Kedaluwarsa');
    S(cs, 'CERT-SHLC-FIRE-2024.pdf', 'Sertifikat ' + (ct.nomor || '')); S(cs, '1.8 MB • Tanda Tangan Elektronik BSrE', m && m.exp ? 'Berlaku sampai ' + tglLong(m.exp) : '');
    $('btnDownloadCert').onclick = function () { window.open(ct.url, '_blank', 'noopener'); };
    var va = find(cs, 'Verifikasi Tautan Publik Rumah Sakit', 'a'); if (va) { if (ct.kode) { va.href = verifUrl(ct.kode); va.target = '_blank'; va.rel = 'noopener'; } else hid(va); } S(cs, 'Hash: 8d9a...e4b1', ct.kode ? 'Kode: ' + ct.kode : '');
  }
  /* evaluasi */
  var es = sec[5];
  if (!ev || !ev.boleh) msg(es, 'Evaluasi Sesi Training', 'Evaluasi dapat diisi setelah Anda lulus Post-test.');
  else if (ev.sudah) msg(es, 'Evaluasi Sesi Training', 'Terima kasih, evaluasi Anda sudah kami terima.');
  else {
    EVR = [0, 0, 0, 0, 0]; S(es, 'Evaluasi Pelatihan Terakhir', 'Evaluasi Sesi Training'); S(es, 'Quality Improvement Feedback', 'Evaluasi Anonim'); S(es, 'Catatan Rekomendasi Alur Evakuasi', 'Catatan (opsional)'); S(es, 'Kirim Ulasan Pelatihan', 'Kirim Evaluasi Anonim');
    [].slice.call(es.querySelectorAll('.star-group')).forEach(function (grp, i) {
      var lab = grp.previousElementSibling; setTxt(lab, (i + 1) + '. ' + (ev.pertanyaan[i] || '')); var stars = grp.querySelectorAll('button');
      stars.forEach(function (b, k) { var ic = b.querySelector('.material-symbols-outlined'); b.className = b.className.replace('text-secondary', 'text-outline-variant'); ic.style.fontVariationSettings = "'FILL' 0";
        b.onclick = function () { EVR[i] = k + 1; stars.forEach(function (z, j) { var on = j <= k, zi = z.querySelector('.material-symbols-outlined'); zi.style.fontVariationSettings = on ? "'FILL' 1" : "'FILL' 0"; z.classList.toggle('text-secondary', on); z.classList.toggle('text-outline-variant', !on); }); }; });
    });
    $('btnKirimEvaluasi').onclick = async function () { if (EVR.some(function (x) { return !x; })) { toast('Beri bintang untuk kelima butir penilaian.'); return; } var r2 = await api('kirimEvaluasi', T, EVR, $('feedbackNotes').value); if (r2) { toast(r2); V.home(); } };
  }
}

/* ===================== JADWAL (trainer) - varian mobile ===================== */
var _jadD = V.jadwal;
V.jadwal = function () { return isMob() ? jadwalM.apply(this, arguments) : _jadD.apply(this, arguments); };
MOBOK.jadwal = 1;
function btnByIcon(root, icon) { var b = [].slice.call(root.querySelectorAll('button')).filter(function (x) { return x.textContent.indexOf(icon) > -1; }); return b[0] || null; }
function rowsM() { return filtRows().slice(0, rosterPage * 15); }
async function jadwalM() {
  if (jdTimer) { clearInterval(jdTimer); jdTimer = null; }
  var d = await api('roster', T), s = d && d.schedule, rows = d ? d.rows : [], m = MS(TPL.jadwal), sec = m.querySelectorAll('section'); selPid = {}; ROSTER = rows; rosterPage = 1; rosterQ = '';
  var online = s && s.jenis === 'online', hero = sec[0], wkS = sec[1], formS = sec[2], listS = sec[3];
  /* --- form sesi baru --- */
  var ins = formS.querySelectorAll('input'), dI = ins[0], tI = ins[1], lI = ins[2], fm = ins[3], na = ins[4], prev = find(formS, '142/X/2026/K3-SHLC');
  dI.type = 'date'; dI.value = ''; tI.type = 'time'; tI.value = '08:30'; lI.value = ''; lI.placeholder = 'https://meet.google.com/...'; lI.type = 'url';
  var mb = formS.querySelectorAll('button'), bOff = mb[0], bOn = mb[1], clsOn = bOff.className, clsOff = bOn.className, jenis = 'offline';
  setTxt(find(bOff, 'Offline Lapangan'), 'Offline QR'); setTxt(find(bOn, 'Hybrid Modul'), 'Online (kode)'); var lw = up(lI, 2); lw.classList.add('hidden'); var lab = find(formS, 'TAUTAN ZOOM CADANGAN (OPSIONAL)'); if (lab) { setTxt(lab, 'TAUTAN MEETING (UNTUK ONLINE)'); lab.classList.add('hidden'); }
  function pick(j) { jenis = j; bOff.className = j === 'offline' ? clsOn : clsOff; bOn.className = j === 'online' ? clsOn : clsOff; lw.classList.toggle('hidden', j !== 'online'); if (lab) lab.classList.toggle('hidden', j !== 'online'); }
  bOff.onclick = function () { pick('offline'); }; bOn.onclick = function () { pick('online'); }; pick('offline');
  S(formS, 'Penjadwalan simulasi proteksi kebakaran', 'Jadwal baru menggantikan jadwal aktif'); S(formS, 'Pratinjau Live', 'Pratinjau');
  fm.value = s ? (s.fmt_nomor || '') : ''; fm.placeholder = '{NO}/SHLC/FS/{BULAN_ROMAWI}/{TAHUN}'; na.type = 'number'; na.min = 1; na.value = s ? (s.no_awal || 1) : 1;
  var upd = function () { setTxt(prev, fm.value && fm.value.indexOf('{NO}') > -1 ? fmtFormat(fm.value, +na.value || 1) : 'Format harus memuat {NO}'); }; fm.oninput = upd; na.oninput = upd; upd();
  var pubBtn = [].slice.call(formS.querySelectorAll('button')).pop(); if (pubBtn) setTxt(pubBtn, 'Publikasikan Jadwal');
  pubBtn.onclick = async function () {
    if (!dI.value) { toast('Isi tanggal pelaksanaan.'); return; }
    var r = await api('setSchedule', T, { tanggal: dI.value + 'T' + (tI.value || '08:00'), jenis: jenis, link: lI.value }); if (!r) return;
    if (fm.value && fm.value.indexOf('{NO}') > -1) await api('setCertFormat', T, fm.value, na.value);
    toast(r); V.jadwal();
  };
  if (!s) {
    hero.innerHTML = '<div class="flex flex-col items-center text-center gap-2 py-6"><span class="material-symbols-outlined text-[40px] text-on-primary-container">event_busy</span><h2 class="font-headline-sm text-headline-sm text-on-primary">Belum ada jadwal aktif</h2><p class="font-body-sm text-on-primary-container">Publikasikan jadwal pada formulir di bawah.</p></div>'; gone(wkS); gone(listS); return;
  }
  /* --- hero --- */
  var hd = rows.filter(function (x) { return x.status === 'Hadir'; }).length, pre = rows.filter(function (x) { return x.status === 'Hadir' && x.pre !== ''; }).length, lul = rows.filter(function (x) { return +x.post >= 80; }).length;
  S(hero, 'Sedang Berlangsung', 'Sesi Aktif'); S(hero, 'Target 48 Staf', 'Terdaftar ' + rows.length); S(hero, 'Simulasi Tanggap Darurat & Evakuasi (Code Red) - Batch 14', 'Training Fire & Safety (' + (online ? 'Online' : 'Offline QR') + ') - ' + tglPendek(s.tanggal));
  S(hero, '42', hd); S(hero, '40', pre); S(hero, '28', lul);
  var pOpen = !!s.post_buka, pc = find(hero, 'Post-test Aktif s/d 17.00 WIB'), tm = find(hero, '02:14:38'), tutup = s.post_tutup ? pd(s.post_tutup) : null;
  setTxt(pc, pOpen ? 'Post-test dibuka' + (s.post_tutup ? ' s/d ' + jamAny(s.post_tutup) : '') : 'Post-test tertutup');
  var tick = function () { if (!pOpen) { tm.textContent = 'Tertutup'; return; } if (!tutup || isNaN(tutup)) { tm.textContent = s.post_tutup ? 'Tutup ' + jamAny(s.post_tutup) : 'Tanpa batas'; return; } var ms = tutup - new Date(); if (ms <= 0) { tm.textContent = '00:00:00'; return; } var z = function (n) { return ('0' + n).slice(-2); }; tm.textContent = z(Math.floor(ms / 36e5)) + ':' + z(Math.floor(ms % 36e5 / 6e4)) + ':' + z(Math.floor(ms % 6e4 / 1e3)); };
  tick(); if (pOpen && tutup) jdTimer = setInterval(function () { if (!find($('M'), 'Tutup Post', 'button')) { clearInterval(jdTimer); return; } tick(); }, 1000);
  find(hero, 'Buka Post', 'button').onclick = async function () { var r = await api('setPostTest', T, 'buka', 45); if (r) { toast(r); V.jadwal(); } };
  find(hero, 'Tutup Post', 'button').onclick = ptClose;
  var tokS = up(find(hero, 'Token Absen Cadangan'), 2);
  if (!online) gone(tokS);
  else {
    var aOpen = !!s.absen_buka; S(hero, 'RED-901', s.kode_absen || '------'); setTxt(find(hero, 'PIN Aktif'), aOpen ? 'Absen dibuka' : 'Absen tertutup'); S(hero, 'Token Absen Cadangan', 'Kode Absensi Online');
    var cp = btnByIcon(tokS, 'content_copy'); if (cp) cp.onclick = function () { copyTxt(s.kode_absen || ''); };
    find(tokS, 'Ganti Kode', 'button').onclick = abNew; var tb = find(tokS, 'Tutup Absen', 'button');
    if (aOpen) tb.onclick = abClose; else { setTxt(find(tb, 'Tutup Absen'), 'Buka Absen 30 Menit'); tb.onclick = function () { abOpen2(30); }; }
  }
  /* --- walk-in --- */
  var wq = wkS.querySelector('input'); wq.id = 'wk-q'; wq.placeholder = 'Cari nama, NIK, username, atau unit (min. 2 huruf)'; wq.removeAttribute('value'); wq.value = '';
  var wbox = up(wq, 1).nextElementSibling; var wtpl = wbox.firstElementChild.cloneNode(true); wbox.innerHTML = '';
  var wk = function (res) {
    wbox.innerHTML = ''; if (!res.length) { wbox.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant">Tidak ada hasil.</p>'; return; }
    res.slice(0, 8).forEach(function (u) {
      var n = wtpl.cloneNode(true), bt = n.querySelector('button'), sp = n.querySelectorAll('.min-w-0 > span');
      setTxt(sp[0], u.nama); sp[0].classList.remove('truncate'); sp[0].classList.add('break-words'); setTxt(sp[1], u.username + ' - ' + u.unit);
      if (u.pid) { bt.outerHTML = '<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">Sudah terdaftar</span>'; } else bt.onclick = function () { daftarWk(u.uid, true); };
      wbox.appendChild(n);
    });
  };
  var wT = null; wq.oninput = function () { clearTimeout(wT); wT = setTimeout(async function () { var q = wq.value.trim(); if (q.length < 2) { wbox.innerHTML = ''; return; } var r = await api('cariPeserta', T, q); if (r) wk(r); }, 350); };
  /* --- daftar peserta --- */
  S(listS, 'Peserta Hadir', 'Peserta Sesi Ini'); setTxt(find(listS, '48'), rows.length);
  var fb = btnByIcon(listS, 'tune'), fq = document.createElement('input'); fq.type = 'search'; fq.placeholder = 'Cari nama atau unit'; fq.className = 'h-9 px-3 rounded-full bg-surface-container-lowest text-on-surface font-label-sm shadow-sm w-40'; if (fb) fb.parentNode.replaceChild(fq, fb);
  var cbox = listS.querySelector('.flex.flex-col.gap-2\\.5'), ctpl = cbox.firstElementChild.cloneNode(true), bar = up(find(listS, 'Tandai Hadir', 'button'), 2) || null;
  var bulkBtn = find(m, 'Tandai Hadir', 'button'), remBtn = find(m, 'Ingatkan', 'button'), cnt = findHas(m, 'Terpilih'), barEl = bulkBtn ? bulkBtn.parentElement.parentElement : null;
  if (barEl) barEl.classList.add('hidden'); if (bulkBtn) bulkBtn.onclick = bulkHadir; if (remBtn) remBtn.onclick = function () { remind(this); };
  function updB() { var n = Object.keys(selPid).length; if (barEl) { barEl.classList.toggle('hidden', !n); } var c = barEl && barEl.querySelector('span.font-numeric-stat, strong, b'); if (c) c.textContent = n; }
  function draw() {
    cbox.innerHTML = ''; var f = filtRows(), pr = f.slice(0, rosterPage * 15);
    pr.forEach(function (x) {
      var hadir = x.status === 'Hadir', c = ctpl.cloneNode(true), cb = c.querySelector('input'), hh = c.querySelector('h4'), pp = c.querySelector('p');
      setTxt(hh, x.nama); setTxt(pp, (x.unit || '-') + ' • ' + x.nik); var chip = find(c, 'Hadir', 'span'); if (chip) { chip.lastChild.textContent = x.status; if (!hadir) { chip.className = chip.className.replace(/bg-emerald-\S+/, 'bg-amber-500/10').replace(/text-emerald-\S+/, 'text-amber-700'); } }
      if (hadir) { cb.disabled = true; cb.checked = false; cb.style.opacity = '.3'; } else { cb.checked = !!selPid[x.pid]; cb.onchange = function () { if (cb.checked) selPid[x.pid] = 1; else delete selPid[x.pid]; updB(); }; }
      var sp = c.querySelectorAll('.bg-surface-container-low\\/60 span'); var tmE = find(c, '08:24 WIB'); if (tmE) setTxt(tmE, hadir ? jamTxt(x.hadir) : 'Belum hadir');
      var st = c.querySelectorAll('strong'); if (st[0]) st[0].textContent = x.pre === '' ? '-' : x.pre; if (st[1]) st[1].textContent = x.post ? x.post + (x.percobaan > 1 ? ' (' + x.percobaan + 'x)' : '') : '-';
      var act = document.createElement('div'); act.className = 'flex gap-2 justify-end';
      if (hadir) { if (x.nomor) act.appendChild(ibtn('verified', 'Kirim ulang email sertifikat', function () { kirimUlangSert(this); }, x.pid)); else act.appendChild(ibtn('undo', 'Batalkan hadir', function () { if (confirm('Batalkan kehadiran peserta ini?')) batalHadir(x.pid); }, x.pid)); }
      else { var ab = document.createElement('button'); ab.type = 'button'; ab.textContent = 'Absenkan'; ab.className = 'h-8 px-3 rounded-lg bg-secondary-container text-on-secondary-container font-label-sm text-label-sm'; ab.onclick = function () { markRow(x.pid); }; act.appendChild(ab); if (x.pre === '') act.appendChild(ibtn('close', 'Batalkan pendaftaran', function () { if (confirm('Batalkan pendaftaran peserta ini?')) batalDaftar(x.pid); }, x.pid)); }
      c.appendChild(act); cbox.appendChild(c);
    });
    if (!pr.length) cbox.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center py-6">Tidak ada peserta.</p>';
    if (f.length > pr.length) { var mb2 = document.createElement('button'); mb2.type = 'button'; mb2.className = 'h-11 rounded-xl bg-surface-container-lowest shadow-sm font-label-md text-on-surface'; mb2.textContent = 'Tampilkan lebih banyak (' + (f.length - pr.length) + ')'; mb2.onclick = function () { rosterPage++; draw(); }; cbox.appendChild(mb2); }
    updB();
  }
  fq.oninput = function () { rosterQ = fq.value.toLowerCase(); rosterPage = 1; draw(); }; draw();
}

/* ===================== SCAN QR (trainer) - varian mobile ===================== */
var _scanD = V.scan, _lsrD = logScanRender;
V.scan = function () { return isMob() ? scanM.apply(this, arguments) : _scanD.apply(this, arguments); };
logScanRender = function () { if (USRT && USRT.mob) return logScanM(); return _lsrD(); };
MOBOK.scan = 1;
function logScanM() {
  if (!USRT || !USRT.hbox) return; var box = USRT.hbox; box.innerHTML = '';
  scanLog.slice(0, 5).forEach(function (x) {
    var n = USRT.htpl.cloneNode(true), nm = x.m.replace(/\s*(sudah\s+)?tercatat hadir\.?$/i, '').replace(/\.$/, ''), p = n.querySelectorAll('p'); setTxt(p[0], nm); setTxt(p[1], x.src + ' • ' + x.t); box.appendChild(n);
  });
  if (USRT.cnt) USRT.cnt.textContent = scanLog.length;
  var t = USRT.ok; if (t && scanLog.length) { var x = scanLog[0], nm2 = x.m.replace(/\s*(sudah\s+)?tercatat hadir\.?$/i, '').replace(/\.$/, ''), sp = t.querySelectorAll('span.font-label-sm, span.font-body-sm'), p2 = t.querySelectorAll('p'); t.classList.remove('hidden'); if (sp[1]) sp[1].textContent = x.t; if (p2[0]) p2[0].textContent = nm2; if (p2[1]) p2[1].textContent = x.src; clearTimeout(USRT.tt); USRT.tt = setTimeout(function () { t.classList.add('hidden'); }, 6000); }
}
async function scanM() {
  loadScript(LIBQR).catch(function () {}); scanLog = []; lastPid = ''; scanBusy = false;
  var s = await api('getSchedule', T), m = MS(TPL.scan), tst = $('statusToast'); USRT = { mob: true, ok: tst }; tst.classList.add('hidden');
  S(tst, 'Verifikasi Berhasil', 'Hadir tercatat'); gone(find(tst, 'NIK: SHLC-2021-0842 • Unit ICU Sentral')); btn(tst, 'Bukti', function () { window.print(); });
  var vf = m.firstElementChild.children[1]; vf.classList.add('relative', 'overflow-hidden');
  var live = document.createElement('div'); live.id = 'qr-live'; live.className = 'absolute inset-0 z-[5] w-full h-full hide bg-black overflow-hidden flex items-center justify-center'; vf.insertBefore(live, vf.firstChild);
  S(vf, 'HD 1080P Feed', s ? 'Sesi ' + tglPendek(s.tanggal) : 'Belum ada jadwal'); var th = find(vf, 'Sensor 36.4°C'); if (th) gone(up(th, 1)); S(vf, 'Siaga', 'Siap');
  var rb = [].slice.call(vf.querySelectorAll('.material-symbols-outlined')).filter(function (e) { return e.textContent.trim() === 'filter_center_focus'; })[0], box = rb && rb.parentElement;
  if (box) { box.innerHTML = '<button type="button" id="sb-start" class="flex flex-col items-center gap-1 text-on-primary active:scale-95"><span class="material-symbols-outlined text-[44px]">play_circle</span><span class="font-label-md text-label-md">Mulai Kamera</span></button>'; }
  [].slice.call(vf.querySelectorAll('div.absolute')).forEach(function (e) { if (e.id !== 'qr-live') e.classList.add('pointer-events-none'); }); if ($('sb-start')) $('sb-start').classList.add('relative', 'z-20');
  S(vf, 'Arahkan ke ID Card Nakes atau Barcode Tabung APAR', 'Tekan Mulai Kamera, arahkan ke QR di layar HP peserta');
  var capP = find(vf, 'Tekan Mulai Kamera, arahkan ke QR di layar HP peserta'), capBox = capP && up(capP, 1);
  var stop = document.createElement('button'); stop.type = 'button'; stop.id = 'sb-stop'; stop.className = 'hide self-center h-9 px-4 rounded-full bg-error text-white font-label-md text-label-md flex items-center gap-1'; stop.innerHTML = '<span class="material-symbols-outlined text-[18px]">stop_circle</span> Hentikan Kamera'; if (capBox) capBox.parentNode.insertBefore(stop, capBox.nextSibling);
  $('sb-start').onclick = startScan; stop.onclick = stopScan;
  ['btnFlipCam', 'btnTorch', 'btnContinuous'].forEach(function (id) { var b = $(id); if (b && b.parentElement && b.parentElement.children.length <= 3) gone(b); }); var ctl = $('btnFlipCam') && up($('btnFlipCam'), 1); if (ctl) gone(ctl);
  var bts = [].slice.call(m.querySelectorAll('button')), uf = bts.filter(function (b) { return /Unggah Foto/.test(b.textContent); })[0], ck = bts.filter(function (b) { return /Cek Kamera/.test(b.textContent); })[0]; var fi = document.createElement('input'); fi.type = 'file'; fi.id = 'qr-file'; fi.accept = 'image/*'; fi.setAttribute('capture', 'environment'); fi.style.display = 'none'; fi.onchange = function () { scanFile(fi); }; uf.parentNode.appendChild(fi); uf.onclick = function () { fi.click(); };
  S(uf, 'Dari galeri perangkat', 'Foto QR dari layar HP'); ck.onclick = camDiag; var dg = document.createElement('div'); dg.id = 'cam-diag'; dg.className = 'text-body-sm text-on-surface-variant px-1'; ck.parentNode.parentNode.insertBefore(dg, ck.parentNode.nextSibling);
  var tmp = document.createElement('div'); tmp.id = 'qr-tmp'; tmp.style.display = 'none'; m.appendChild(tmp);
  var pid = $('manualInputCode'); pid.id = 'm-pid'; pid.placeholder = 'PTC-AB12CD'; pid.setAttribute('autocapitalize', 'characters'); bts.filter(function (b) { return b.textContent.trim().replace(/\s+/g, ' ') === 'Catat'; })[0].onclick = function () { mark($('m-pid').value, 'Manual Trainer'); $('m-pid').value = ''; };
  S(m, 'Ketik Kode Peserta atau Serial APAR jika kamera silau atau kotor.', 'Ketik ID peserta (PTC-...) jika kamera tidak bisa dipakai.'); S(m, 'Input ID Manual', 'Input ID Manual');
  var lh = find(m, 'Presensi Sesi Ini'); USRT.cnt = lh && lh.nextElementSibling; gone(find(m, 'Lihat Semua', 'button'));
  var r0 = repeatRow(find(m, 'Ns. Budi Santoso')); USRT.hbox = r0.parentElement; USRT.htpl = r0.cloneNode(true); USRT.hbox.innerHTML = ''; if (USRT.cnt) USRT.cnt.textContent = '0';
  logScanM();
}

/* ===================== LAPORAN (trainer/admin) - varian mobile ===================== */
function rowOf(el) { while (el && el.parentElement) { var p = el.parentElement, k = el.children.length; if (k >= 2 && p.children.length >= 2 && p.children[0].tagName === el.tagName && p.children[1].tagName === el.tagName && p.children[0].children.length === k && p.children[1].children.length === k) return el; el = p; } return null; }
var _lapD = V.lap;
V.lap = function () { return isMob() ? lapM.apply(this, arguments) : _lapD.apply(this, arguments); };
MOBOK.lap = 1;
async function lapM() {
  var res = await apiMany([['reportData', T], ['statusAntrean', T], ['statusBankSoal', T]]), r = res[0], q = res[1], bs = res[2], m = MS(TPL.lap);
  if (!r) { msg(m.firstElementChild || m, 'Laporan', 'Data belum dapat dimuat. Periksa koneksi lalu buka menu ini lagi.'); return; }
  var pc = function (n) { return r.total ? Math.round(n / r.total * 1000) / 10 : 0; };
  S(m, 'Audit Ready Mode', 'Laporan K3'); S(m, '08:42 WIB', jamNow()); S(m, 'Kepatuhan KARS & JCI', 'Kepatuhan Sertifikasi'); S(m, 'Standar Akreditasi KARS / JCI FMS.11 • Ruang Isolasi & Penunjang', num(r.total) + ' akun peserta terdata');
  S(m, 'Export Laporan PDF / XLS', 'Unduh Expired (Excel)'); $('exportBtn').onclick = function () { dlXlsx('expiry'); };
  S(m, '78.4%', pc(r.aktif) + '%'); S(m, '842', num(r.aktif)); S(m, '48', num(r.soon)); S(m, '19', num(r.expired)); S(m, '165', num(r.belum));
  /* training */
  var tr = up(findHas(m, 'Code Red: Skenario'), 3), tb = tr.parentElement, tt = tr.cloneNode(true), tcls = tr.className, tanchor = document.createElement('div'); tb.insertBefore(tanchor, tr); [].slice.call(tb.children).forEach(function (c) { if (c.className === tcls) tb.removeChild(c); });
  S(m, '2 Batch Aktif', r.trainings.length + ' Sesi'); S(m, 'Efektivitas Pelatihan Terakhir', 'Efektivitas Pelatihan');
  if (!r.trainings.length) tanchor.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant py-3">Belum ada training.</p>';
  r.trainings.slice(0, 6).forEach(function (x) {
    var n = tt.cloneNode(true), pct = x.hadir ? Math.round(x.lulus / x.hadir * 1000) / 10 : 0;
    S(n, 'Batch 10', x.sid); S(n, '18 Feb 2025', tglPendek(x.tanggal)); S(n, findHas(n, 'Code Red: Skenario').textContent, 'Training Fire & Safety (' + (x.jenis === 'online' ? 'Online' : 'Offline QR') + ')');
    S(n, '42/42', x.hadir + '/' + x.daftar); S(n, '100% Hadir', (x.daftar ? Math.round(x.hadir / x.daftar * 100) : 0) + '% Hadir'); S(n, '39 Lulus', x.lulus + ' Lulus'); S(n, '92.8% Skor', x.hadir ? pct + '% Lulus' : '-');
    var ev = find(n, 'Avg Evaluasi'), evc = ev && ev.parentElement, evv = evc && [].slice.call(evc.querySelectorAll('span')).filter(function (e) { return /^4\.9$/.test(e.textContent.trim()); })[0]; if (evv) evv.textContent = x.evalN ? x.evalAvg : '-';
    S(n, 'Skala 5.0', x.evalN ? x.evalN + ' penilai' : 'Belum ada');
    btn(n, 'Daftar Hadir', function () { dlXlsx('hadir', x.sid); }); btn(n, 'Hasil Kuis', function () { dlXlsx('kuis', x.sid); });
    tb.insertBefore(n, tanchor);
  });
  /* per unit */
  var ur = up(findHas(m, 'ICU (Intensive Care)'), 3), ub = ur.parentElement, ut = ur.cloneNode(true); ub.innerHTML = '';
  var lst = (r.perUnit || []).map(function (u) { var tot = u.karyawan != null ? u.karyawan : u.akun, pct = u.pct != null ? u.pct : (u.akun ? Math.round(u.aktif / u.akun * 1000) / 10 : 0); return { u: u.unit, a: u.aktif, t: tot, p: pct }; }).filter(function (z) { return z.t; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 8);
  S(m, 'Kepatuhan Unit Prioritas', 'Kepatuhan per Unit (terendah)');
  if (!lst.length) ub.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant py-3">Belum ada data unit. Isi jumlah karyawan di menu Unit.</p>';
  lst.forEach(function (z) { var n = ut.cloneNode(true); S(n, 'ICU (Intensive Care)', z.u); S(n, '52/54', z.a + '/' + z.t); S(n, '96.2%', z.p + '%'); var bar = n.querySelector('[style*="width"]'); if (bar) setW(bar, z.p); ub.appendChild(n); });
  /* bank soal */
  if (bs) { var pv = bs.total ? Math.round(bs.valid / bs.total * 100) : 0; S(m, '98 / 100 Soal', bs.valid + ' / ' + bs.total + ' Soal'); S(m, 'Sesuai Kurikulum Damkar & KARS', bs.cukup ? 'Cukup untuk ' + bs.jumlahKuis + ' kuis acak' : 'Soal kurang, tambah di sheet questions'); S(m, '98%', pv + '%'); var ring = m.querySelector('circle[stroke-dashoffset]'); if (ring) { var da = parseFloat(ring.getAttribute('stroke-dasharray')) || 264; ring.setAttribute('stroke-dashoffset', String(Math.round(da * (1 - pv / 100)))); } }
  else gone(up(find(m, 'Validasi Bank Soal K3'), 3));
  /* antrean sertifikat */
  if (q) {
    S(m, 'Google Workspace SMTP', 'Antrean email'); S(m, 'Terkirim 88/100', 'Terkirim ' + q.terkirim); S(m, '3 Sertifikat Pending', q.menunggu + ' menunggu' + (q.gagal ? ', ' + q.gagal + ' gagal' : '')); S(m, 'Antrean batch berikutnya', q.sisaKuota + ' email tersisa hari ini');
    $('queueProcessBtn').onclick = async function () { var x = await api(q.gagal && !q.menunggu ? 'ulangGagal' : 'prosesAntreanManual', T); if (x) { toast(x); V.lap(); } };
  } else gone(up($('queueProcessBtn'), 4));
  var au = findHas(m, 'Audit Trail Kepatuhan Rumah Sakit'); if (au) gone(up(au, 2));
}

/* ===================== PENGGUNA (admin) - varian mobile ===================== */
var _usrD = V.usr, USRM = null;
V.usr = function () { return isMob() ? usrM.apply(this, arguments) : _usrD.apply(this, arguments); };
MOBOK.usr = 1;
function btnRe(root, re) { return [].slice.call(root.querySelectorAll('button')).filter(function (b) { return re.test(b.textContent.replace(/\s+/g, ' ').trim()); })[0] || null; }
async function usrM() {
  var res = await apiMany([['listUsers', T], ['permintaanData', T], ['daftarUnit']]);
  userRows = res[0] || []; reqRows = res[1] || []; unitNames = res[2] || []; usrQ = ''; usrRole = ''; EDITUID = ''; var page = 1;
  var m = MS(TPL.usr), pend = reqRows.filter(function (x) { return x.status === 'menunggu'; }), sec = m.querySelectorAll('section');
  /* permintaan hapus data */
  var pc = findHas(m, 'Hak Privasi UU PDP'); pc = pc && (pc.closest('section') || up(pc, 3));
  if (!pend.length) gone(pc);
  else {
    var q = pend[0]; S(pc, '1 Permintaan Menunggu', pend.length + ' Permintaan Menunggu'); S(pc, 'dr. Hendra Wibowo, Sp.B', q.nama || q.username || '-');
    var sp = findHas(pc, 'NIK: 3171048802910003'); if (sp) sp.textContent = (q.unit || '-') + ' • ' + (q.username || '-');
    var al = findHas(pc, 'Pindah tugas definitif'); if (al) al.textContent = '“' + (q.alasan || 'Tidak ada alasan yang ditulis.') + '”'; S(pc, 'Kepatuhan Pasal 40 & 44 UU Perlindungan Data Pribadi No. 27/2022', 'Diajukan ' + tglLong(q.waktu) + ' (' + jamTxt(q.waktu) + ')');
    btnRe(pc, /Setujui/).onclick = function () { if (confirm('Setujui dan hapus akun ' + (q.nama || q.username) + '?')) rqSetuju(q.rid); };
    btnRe(pc, /Tolak/).onclick = async function () { var c = prompt('Catatan penolakan (wajib):', ''); if (c === null) return; var r = await api('prosesPermintaan', T, q.rid, 'tolak', c); if (r) { toast(r); V.usr(); } };
  }
  /* direktori */
  S(m, 'Sinkronisasi SIMRS Terpadu • 1.074 Total Terdaftar', num(userRows.length) + ' akun terdaftar'); gone(btnRe(m, /Tambah/)); var xb = $('userSearchInput'); var clr = xb.nextElementSibling; if (clr && clr.tagName === 'BUTTON') gone(clr);
  var cnt = function (r) { return userRows.filter(function (u) { return u.role === r; }).length; };
  var chips = [].slice.call(m.querySelectorAll('.filter-chip')), cv = ['', 'peserta', 'trainer', 'admin'], cl = ['Semua', 'Peserta', 'Trainer', 'Admin K3'], cn = [userRows.length, cnt('peserta'), cnt('trainer'), cnt('admin')], ccOn = chips[0].className, ccOff = chips[1].className;
  chips.forEach(function (b, i) { b.className = i === 0 ? ccOn : ccOff; var s2 = b.querySelectorAll('span'); if (s2[0]) s2[0].textContent = cl[i]; if (s2[1]) s2[1].textContent = num(cn[i]); b.onclick = function () { usrRole = cv[i]; page = 1; chips.forEach(function (x, k) { x.className = k === i ? ccOn : ccOff; }); draw(); }; });
  xb.placeholder = 'Cari nama, username, atau unit'; xb.oninput = function () { usrQ = xb.value.toLowerCase(); page = 1; draw(); };
  var tp = {}; [['peserta', 'Ns. Siti Rahmawati, S.Kep'], ['admin', 'dr. Ferry Hidayat'], ['trainer', 'Bambang Pamungkas, S.T.']].forEach(function (z) { var el = findHas(m, z[1]), card = el; while (card && !(card.parentElement && card.querySelector('button') && card.parentElement.children.length >= 3 && /bg-surface-container-lowest|rounded-2xl|rounded-3xl/.test(card.className))) card = card.parentElement; tp[z[0]] = card; });
  var box = tp.peserta.parentElement, TPL3 = { peserta: tp.peserta.cloneNode(true), admin: tp.admin.cloneNode(true), trainer: tp.trainer.cloneNode(true) }; box.innerHTML = '';
  var more = document.createElement('button'); more.type = 'button'; more.className = 'h-11 w-full rounded-xl bg-surface-container-lowest shadow-sm font-label-md text-on-surface'; var holder = document.createElement('div'); holder.className = 'flex flex-col gap-space-sm'; box.parentNode.insertBefore(holder, box); holder.appendChild(box); holder.appendChild(more);
  USRM = {};
  function openEdit(u) {
    var md = $('modalEditUser'), ins = md.querySelectorAll('form input'), se = md.querySelector('form select'), tabs = md.querySelectorAll('.role-tab'); EDITUID = u.uid;
    ins[0].value = u.nama; ins[1].value = u.nik || ''; se.innerHTML = '<option value="">-</option>' + unitNames.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join(''); if (u.unit && unitNames.indexOf(u.unit) < 0) se.insertAdjacentHTML('afterbegin', '<option>' + esc(u.unit) + '</option>'); se.value = u.unit || '';
    ins[2].value = String(u.wa || '').replace(/^\+62/, ''); ins[3].value = u.email || ''; var role = u.role;
    var self = U && u.uid === U.uid, fix = u.role === 'admin' || self;
    tabs.forEach(function (t, i) { var rv = ['peserta', 'trainer', 'admin'][i]; var on = rv === role; t.classList.toggle('bg-secondary-container', on); t.classList.toggle('text-on-secondary-container', on); t.disabled = fix || rv === 'admin'; t.classList.toggle('opacity-40', t.disabled); t.onclick = function () { if (t.disabled) return; role = rv; tabs.forEach(function (z, k) { var o = k === i; z.classList.toggle('bg-secondary-container', o); z.classList.toggle('text-on-secondary-container', o); }); }; });
    var sv = md.querySelector('form button:last-of-type') || btnRe(md, /Simpan/); setTxt(sv, 'Simpan Perubahan');
    sv.type = 'button'; sv.onclick = async function () {
      var ph = (ins[2].value || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^62/, '');
      var r = await api('editUser', T, u.uid, { nama_ktp: ins[0].value, nik: ins[1].value, tgl_lahir: tglIso(u.tgl) || u.tgl || '', unit_kerja: se.value, no_wa: ph ? '+62' + ph : '', email: ins[3].value }); if (!r) return;
      if (role !== u.role && (role === 'peserta' || role === 'trainer')) await api('setRole', T, u.uid, role);
      md.classList.add('hidden'); toast(r); V.usr();
    };
    md.classList.remove('hidden'); md.classList.add('flex');
  }
  var closeB = $('modalEditUser').querySelector('button.w-8'); if (closeB) closeB.onclick = function () { $('modalEditUser').classList.add('hidden'); $('modalEditUser').classList.remove('flex'); };
  function draw() {
    var f = userRows.filter(function (u) { return (!usrRole || u.role === usrRole) && (!usrQ || (u.nama + ' ' + u.username + ' ' + u.unit + ' ' + u.nik).toLowerCase().indexOf(usrQ) > -1); }), shown = f.slice(0, page * 8); box.innerHTML = '';
    shown.forEach(function (u) {
      var n = TPL3[u.role === 'admin' ? 'admin' : u.role === 'trainer' ? 'trainer' : 'peserta'].cloneNode(true), self = U && u.uid === U.uid, tn = { peserta: 'Ns. Siti Rahmawati, S.Kep', admin: 'dr. Ferry Hidayat', trainer: 'Bambang Pamungkas, S.T.' }[u.role === 'admin' ? 'admin' : u.role === 'trainer' ? 'trainer' : 'peserta'];
      var ne = findHas(n, tn); ne.textContent = u.nama; ne.classList.remove('truncate'); ne.classList.add('break-words');
      var av = [].slice.call(n.querySelectorAll('div')).filter(function (d) { return d.children.length === 0 && /^[A-Z]{2}$/.test(d.textContent.trim()); })[0]; if (av) { av.textContent = ini(u.nama); av.classList.add('text-white'); }
      var sub = findHas(n, 'NIK:'); if (sub) sub.textContent = (u.unit || '-') + ' • NIK: ' + (u.nik || '-'); S(n, 'Trainer Damkar', 'Trainer K3'); S(n, 'Admin K3', 'Admin K3');
      ['Sertifikat Basic Life & Fire Safety', 'Otoritas Akses: Root Master Eksekutif', 'Sertifikasi Ahli K3 Kebakaran BNSP'].forEach(function (t) { var e = findHas(n, t); if (e) gone(e.closest('div[class*="bg-"]') || up(e, 2)); }); var ak = findHas(n, 'Akses Penuh'); if (ak) gone(ak);
      [].slice.call(n.querySelectorAll('button')).forEach(function (b) {
        var t = b.textContent.replace(/\s+/g, ' ').trim();
        if (/Jadikan Trainer/.test(t)) b.onclick = function () { chRole(u.uid, 'trainer'); };
        else if (/Jadwal Latih APAR/.test(t)) { setTxt(b, 'Jadikan Peserta'); var bi = b.querySelector('.material-symbols-outlined'); if (bi) bi.textContent = 'person'; b.onclick = function () { chRole(u.uid, 'peserta'); }; if (self) gone(b); }
        else if (/Audit Hak Akses/.test(t)) gone(b);
        else if (/Edit/.test(t)) b.onclick = function () { openEdit(u); };
        else if (/Hapus/.test(t)) { if (self || u.role === 'admin') gone(b); else b.onclick = function () { if (confirm('Hapus akun ' + u.nama + '? Semua data pendaftaran dan sertifikatnya ikut dihapus.')) hapusUser2(u.uid); }; }
      });
      box.appendChild(n);
    });
    if (!f.length) box.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant">Tidak ada pengguna.</p>';
    more.classList.toggle('hidden', f.length <= shown.length); more.textContent = 'Tampilkan lebih banyak (' + (f.length - shown.length) + ')'; more.onclick = function () { page++; draw(); };
  }
  draw();
}

/* ===================== PROFIL - varian mobile ===================== */
var _profD = V.prof;
V.prof = function () { return isMob() ? profM.apply(this, arguments) : _profD.apply(this, arguments); };
MOBOK.prof = 1;
async function profM() {
  var peserta = U.role === 'peserta';
  var res = await apiMany([['daftarUnit'], ['statusPermintaanSaya', T], peserta ? ['myStatus', T] : ['daftarUnit']]), un = res[0] || [], rq = res[1], st = peserta ? res[2] : null;
  var m = MS(TPL.prof), rl = U.role === 'peserta' ? 'PESERTA' : U.role === 'trainer' ? 'TRAINER' : 'ADMIN', sec = m.querySelectorAll('section');
  S(m, 'SR', ini(U.nama_ktp)); S(m, 'PESERTA - ICU', rl + (U.unit_kerja ? ' - ' + U.unit_kerja : '')); S(m, 'Ns. Siti Rahmawati, S.Kep', U.nama_ktp); S(m, 'Perawat Pelaksana ICU • SHLC Cikarang', (U.unit_kerja || '-') + ' • SHLC Lippo Cikarang');
  var kv = find(m, 'K3 Terverifikasi'); if (kv && !(st && (st.state === 'ok' || st.state === 'soon'))) gone(kv.parentElement && plain(kv.parentElement).length < 30 ? kv.parentElement : kv);
  var cs = findHas(m, 'Status Sertifikat'), ct = cs && up(cs, 2);
  if (!peserta || !st) gone(ct); else S(m, 'Aktif s/d Nov 2027', st.state === 'belum' ? 'Belum lulus' : st.state === 'expired' ? 'Kedaluwarsa ' + tglPendek(st.exp) : 'Aktif s/d ' + tglPendek(st.exp));
  S(m, 'Tervalidasi', 'Tercatat'); S(m, 'Informasi identitas dinas terintegrasi HRIS', 'Data identitas Anda pada aplikasi ini');
  var f = $('form-credentials'), ins = f.querySelectorAll('input'), se = f.querySelector('select'), tgl = ins[0], wa = ins[1], em = ins[2];
  var nk = findHas(f, 'SHLC-2021-0842'); if (nk) nk.textContent = U.nik || '-'; gone(findHas(f, 'Terkunci HR')); gone(findHas(f, 'Zonasi Merah K3'));
  tgl.type = 'date'; tgl.value = tglIso(U.tgl_lahir) || ''; tgl.id = 'p-tgl'; tgl.readOnly = false;
  S(f, 'Unit Kerja (Tercatat 43 Unit)', 'Unit Kerja' + (un.length ? ' (' + un.length + ' unit)' : '')); se.id = 'p-unit'; se.innerHTML = ''; var lst = un.slice(); if (U.unit_kerja && lst.indexOf(U.unit_kerja) < 0) lst.unshift(U.unit_kerja);
  lst.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n; if (n === U.unit_kerja) o.selected = true; se.appendChild(o); });
  S(f, 'No. WhatsApp Darurat Fire Alarm', 'Nomor WhatsApp'); wa.id = 'p-wa'; wa.value = normWa(U.no_wa).replace(/^\+62/, ''); wa.setAttribute('inputmode', 'numeric'); wa.placeholder = '81234567890';
  em.id = 'p-email'; em.value = U.email || ''; em.readOnly = true; em.classList.add('opacity-70');
  var sv = f.querySelector('button[type=submit], button:last-of-type'); sv.type = 'button'; sv.onclick = saveProf3; f.onsubmit = function (e) { e.preventDefault(); saveProf3(); };
  gone(sec[1]); gone(find(m, 'Perubahan berhasil disimpan!') && up(find(m, 'Perubahan berhasil disimpan!'), 2));
  /* privasi */
  var pv = sec[2]; S(pv, 'Unduh seluruh arsip sertifikat K3, log kehadiran simulasi kebakaran, dan riwayat skor kuis Anda.', 'Unduh data akun, riwayat kehadiran, skor kuis, dan sertifikat Anda.'); S(pv, 'Instan', 'Excel'); S(pv, 'Unduh Data Pribadi Saya (Excel/PDF)', 'Unduh Data Saya (Excel)');
  var db = btnRe(pv, /Unduh Data/); if (db) db.onclick = function () { dlB64('unduhDataSaya'); };
  var chip = findHas(pv, 'Tidak ada permohonan aktif'); if (chip) setTxt(chip, rq && rq.status === 'menunggu' ? 'Sedang diproses admin' : rq && rq.status === 'ditolak' ? 'Permintaan ditolak' : 'Tidak ada permohonan aktif');
  var ta = $('deid-reason'); ta.id = 'dr-a'; ta.placeholder = 'Tuliskan alasan pengajuan Anda'; ta.maxLength = 300; var del = $('btn-delete-req');
  if (rq && rq.status === 'menunggu') { ta.disabled = true; del.disabled = true; del.classList.add('opacity-50'); setTxt(del, 'Permintaan sedang diproses'); }
  else del.onclick = function () { if (confirm('Ajukan penghapusan akun dan data pribadi Anda? Admin akan meninjau permintaan ini.')) ajukanHapus(); };
  var enc = findHas(m, 'Enkripsi End-to-End SHLC Cloud'); if (enc) gone(up(enc, 3));
}

/* ===================== KUIS (peserta) - varian mobile ===================== */
var _quizD = V.quiz;
V.quiz = function () { return isMob() ? quizM.apply(this, arguments) : _quizD.apply(this, arguments); };
MOBOK.quiz = 1;
async function quizM() {
  if (quizPoll) { clearInterval(quizPoll); quizPoll = null; } if (quizTick) { clearInterval(quizTick); quizTick = null; }
  var s = await api('quizStatus', T); if (!s) return; Q = null; QZ = null;
  var m = MS(TPL.quiz), r = m.firstElementChild, hasPre = s.pre !== null && s.pre !== undefined, terbuka = !!s.postBuka;
  var stepsCard = r.children[1], qc = r.children[2], hist = r.children[3], steps = stepsCard.querySelectorAll('.relative.flex.items-start.gap-3');
  var st3 = !s.hadir || !hasPre ? 'lock' : s.lulus ? 'done' : terbuka ? 'now' : 'lock', d1 = !!s.hadir, d2 = hasPre;
  var cur = d1 ? (d2 ? 3 : 2) : 1; S(stepsCard, 'Langkah 3 dari 3', 'Langkah ' + cur + ' dari 3');
  S(steps[0], 'Terverifikasi', d1 ? 'Terverifikasi' : s.terdaftar ? 'Menunggu' : 'Belum daftar'); S(steps[0], 'Ruang Aula Lantai 3 • 08:15 WIB', d1 ? 'Hadir tercatat' : 'Dicatat trainer (scan QR / kode)');
  S(steps[1], 'Skor 80/100', hasPre ? 'Skor ' + s.pre + '/100' : 'Wajib 1x'); S(steps[1], 'Selesai (1x)', hasPre ? 'Selesai (1x)' : 'Belum dikerjakan'); S(steps[1], 'Baseline terdata', hasPre ? 'Baseline terdata' : 'Setelah hadir');
  S(steps[2], 'Wajib ≥ 80', 'Wajib ≥ 80'); S(steps[2], 'Dibuka s/d 17.00 WIB', s.lulus ? 'Lulus (terbaik ' + s.best + ')' : terbuka ? (s.postTutup ? 'Ditutup ' + jamAny(s.postTutup) : 'Dibuka') : 'Menunggu dibuka trainer');
  if (!d1) { steps[1].classList.add('opacity-60'); steps[2].classList.add('opacity-60'); } else if (!d2) steps[2].classList.add('opacity-60'); else if (!terbuka && !s.lulus) steps[2].classList.add('opacity-60');
  if (!d1) steps[0].classList.add('opacity-90');
  var tmEl = findHas(qc, '02:10:08'), tut = s.postTutup ? new Date(String(s.postTutup).replace(' ', 'T') + '+07:00') : null;
  if (tmEl && terbuka && tut && !isNaN(tut) && !s.lulus) { var tick = function () { if (!tmEl.isConnected) { clearInterval(quizTick); quizTick = null; return; } var d = Math.max(0, Math.floor((tut - new Date()) / 1000)); tmEl.textContent = ('0' + Math.floor(d / 3600)).slice(-2) + ':' + ('0' + Math.floor(d % 3600 / 60)).slice(-2) + ':' + ('0' + d % 60).slice(-2); }; tick(); quizTick = setInterval(tick, 1000); }
  else if (tmEl) gone(up(tmEl, 1));
  var t3 = findHas(steps[2], '02:10:08'); if (t3) gone(up(t3, 1));
  /* panel status / hasil */
  var pnl = document.createElement('div'); pnl.id = 'q-panel'; pnl.className = 'rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col items-center text-center gap-3 py-8';
  r.insertBefore(pnl, qc); qc.classList.add('hidden');
  function panel(icon, ttl, txt, actions) {
    pnl.innerHTML = '<div class="w-14 h-14 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center"><span class="material-symbols-outlined text-[30px]">' + icon + '</span></div><h2 class="font-headline-sm text-headline-sm text-on-surface">' + esc(ttl) + '</h2><p class="font-body-md text-on-surface-variant">' + esc(txt) + '</p><div class="flex gap-2 flex-wrap justify-center" id="q-act"></div>';
    (actions || []).forEach(function (a) { var b = document.createElement('button'); b.type = 'button'; b.className = a.sec ? 'h-11 px-5 rounded-lg bg-surface-container text-on-surface font-label-md' : 'h-11 px-6 rounded-lg bg-secondary text-on-secondary font-label-md shadow-md'; b.textContent = a.t; b.onclick = a.f; $('q-act').appendChild(b); });
  }
  var reload = { t: 'Muat Ulang', sec: true, f: function () { V.quiz(); } };
  if (!s.aktif) panel('event_busy', 'Belum ada jadwal training aktif', 'Kuis tersedia setelah trainer mempublikasikan jadwal.', [reload]);
  else if (!s.terdaftar) panel('how_to_reg', 'Anda belum terdaftar', 'Daftar pada jadwal aktif lewat menu Beranda terlebih dahulu.', [reload]);
  else if (!s.hadir) panel('qr_code_scanner', 'Kehadiran belum dicatat', 'Minta trainer menandai hadir, lalu tekan Muat Ulang.', [reload]);
  else if (!hasPre) panel('assignment_turned_in', 'Pre-Test', 'Wajib dikerjakan satu kali sebelum Post-test.', [{ t: 'Mulai Pre-test', f: function () { startQM('pretest'); } }]);
  else if (!s.lulus && !terbuka) { panel('hourglass_top', 'Menunggu Post-test dibuka', 'Halaman memeriksa otomatis setiap 20 detik.', [reload]); quizPoll = setInterval(function () { if (!$('q-panel')) { clearInterval(quizPoll); quizPoll = null; return; } if (document.hidden) return; api('quizStatus', T).then(function (z) { if (z && z.postBuka && $('q-panel')) V.quiz(); }); }, 20000); }
  else if (!s.lulus) panel('play_circle', 'Post-Test', 'Lulus jika nilai minimal 80. Percobaan ke-' + ((s.post || 0) + 1) + '.', [{ t: 'Mulai Post-test', f: function () { startQM('posttest'); } }]);
  else panel('workspace_premium', 'Anda sudah lulus', 'Sertifikat tersedia di menu Beranda.', []);
  /* kartu soal */
  var labels = qc.querySelectorAll('fieldset label'), tplL = labels[0].cloneNode(true), fs = labels[0].parentElement, mk = findHas(tplL, 'Jawaban Anda dipilih'); if (mk) gone(mk);
  var qNum = findHas(qc, 'Soal #07'), qOf = findHas(qc, '/ 25'), chipT = findHas(qc, 'Post-test'), qText = qc.querySelector('p'), prog = findHas(qc, 'Progress: 7 Terjawab (28%)'), left = findHas(qc, 'Tersisa: 18 Soal'), kls = findHas(qc, 'Kelas C • ICU');
  if (kls) gone(kls.parentElement && plain(kls.parentElement).length < 20 ? kls.parentElement : kls);
  var bar = qc.querySelector('.h-1\\.5.rounded-full > div'), nav = qc.querySelector('.grid-cols-10'), nb = nav.children, K = { a: nb[0].className, c: nb[6].className, e: nb[7].className }, navHead = nav.previousElementSibling;
  var pn = qc.querySelector('.grid-cols-2.gap-2'), bPrev = pn.children[0], bNext = pn.children[1];
  var sub = document.createElement('button'); sub.type = 'button'; sub.className = 'h-11 w-full rounded-lg bg-surface-container text-on-surface-variant font-label-md mt-2 flex items-center justify-center gap-1'; sub.innerHTML = '<span class="material-symbols-outlined text-[18px]">task_alt</span><span>Kirim Jawaban</span>'; pn.parentNode.insertBefore(sub, pn.nextSibling);
  S(navHead, 'Navigasi Cepat 25 Soal', 'Navigasi Cepat');
  function paint() {
    var z = QZ, n = z.soal.length, c = z.soal[z.i], dn = 0; z.soal.forEach(function (x) { if (z.ans[x.id]) dn++; });
    setTxt(qNum, 'Soal #' + (z.i + 1)); setTxt(qOf, '/ ' + n); if (bar) bar.style.width = Math.round(dn / n * 100) + '%'; setTxt(prog, 'Progress: ' + dn + ' Terjawab (' + Math.round(dn / n * 100) + '%)'); setTxt(left, 'Tersisa: ' + (n - dn) + ' Soal'); qText.textContent = c.pertanyaan;
    fs.innerHTML = ''; c.pilihan.forEach(function (p, k) {
      var L = 'ABCD'.charAt(k), e = tplL.cloneNode(true), inp = e.querySelector('input'); inp.type = 'radio'; inp.name = 'q' + c.id; inp.checked = z.ans[c.id] === L; inp.value = L;
      var sp = [].slice.call(e.querySelectorAll('span')).filter(function (x) { return x.children.length === 0 && x.textContent.trim() && !/^(check|[a-z_]+)$/.test(x.textContent.trim()); }); var lt = sp.filter(function (x) { return /^[A-D]\.$/.test(x.textContent.trim()); })[0], tx = sp.filter(function (x) { return x !== lt; }).pop();
      if (lt) lt.textContent = L + '.'; if (tx) tx.textContent = p; e.onclick = function (ev) { ev.preventDefault(); z.ans[c.id] = L; paint(); }; fs.appendChild(e);
    });
    nav.innerHTML = ''; z.soal.forEach(function (x, ix) { var b = document.createElement('button'); b.type = 'button'; b.textContent = ix + 1; b.className = ix === z.i ? K.c : z.ans[x.id] ? K.a : K.e; b.onclick = function () { z.i = ix; paint(); }; nav.appendChild(b); });
    bPrev.disabled = z.i === 0; bPrev.classList.toggle('opacity-40', z.i === 0); setTxt(bNext.querySelector('span:not(.material-symbols-outlined)') || bNext, z.i === n - 1 ? 'Selesai' : 'Selanjutnya');
    var all = dn === n; sub.disabled = !all; sub.className = 'h-11 w-full rounded-lg font-label-md mt-2 flex items-center justify-center gap-1 ' + (all ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface-container text-on-surface-variant'); sub.lastChild.textContent = all ? 'Kirim Jawaban' : 'Kirim (' + (n - dn) + ' soal tersisa)';
  }
  bPrev.onclick = function () { if (QZ.i > 0) { QZ.i--; paint(); } }; bNext.onclick = function () { if (QZ.i < QZ.soal.length - 1) { QZ.i++; paint(); } else sub.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  var j0 = '';
  sub.onclick = async function () {
    if (sub.disabled) return; sub.disabled = true; var res2 = await api('submitQuiz', T, QZ.j, QZ.ans); if (!res2) { paint(); return; }
    qc.classList.add('hidden'); pnl.classList.remove('hidden'); var lulus = res2.status === 'Lulus', ex = '';
    if (lulus) { var ms = await api('myStatus', T); if (ms && ms.exp) ex = ' Sertifikasi berlaku sampai ' + ms.exp + '.'; }
    panel(lulus ? 'workspace_premium' : 'replay', 'Nilai: ' + res2.nilai, (lulus ? 'Selamat, Anda dinyatakan LULUS.' + ex : (j0 === 'pretest' ? 'Pre-test tercatat.' : 'Nilai belum mencapai 80. Anda dapat mengulang Post-test.')) + ' Percobaan ke-' + res2.percobaan + '.', [{ t: 'Kembali ke Kuis', f: function () { V.quiz(); } }]);
  };
  async function startQM(j) {
    var rs = await api('startQuiz', T, j); if (!rs) { V.quiz(); return; } j0 = j; Q = { j: j, soal: rs.soal }; QZ = { j: j, soal: rs.soal, i: 0, ans: {}, flag: {} };
    setTxt(chipT, j === 'pretest' ? 'Pre-test' : 'Post-test #' + rs.percobaan); pnl.classList.add('hidden'); qc.classList.remove('hidden'); paint(); qc.scrollIntoView({ block: 'start' });
  }
  /* riwayat */
  var rh = findHas(hist, 'Riwayat Percobaan Post-Test'); if (rh) setTxt(rh, 'Riwayat Nilai'); gone(findHas(hist, 'Maksimal 3x Sesi'));
  var rows = hist.querySelector('.flex.flex-col.gap-2');
  var rowH = function (t, sb, sc, ok) { return '<div class="p-3 rounded-xl bg-surface-container-high flex items-center justify-between gap-2"><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface">' + esc(t) + '</span><span class="font-body-sm text-body-sm text-on-surface-variant">' + esc(sb) + '</span></div><span class="font-title-md text-title-md ' + (ok ? 'text-secondary' : 'text-on-surface') + '">' + esc(sc) + '</span></div>'; };
  rows.innerHTML = rowH('Pre-test', hasPre ? 'Dikerjakan 1x' : 'Belum dikerjakan', hasPre ? String(s.pre) : '-', false) + rowH('Post-test', s.post ? s.post + ' percobaan' + (s.lulus ? ' • Lulus' : ' • Min. 80') : 'Belum dikerjakan', s.post ? 'Terbaik ' + s.best : '-', s.lulus);
}

/* ===================== ADMIN BERBENTUK FORMULIR - varian mobile ===================== */
function mShell(key, title, sub) {
  var m = MS(TPL[key]), root = m.firstElementChild, head = root.children[0], t = head.querySelector('h1, h2, h3, .font-headline-sm, .font-headline-xl-mobile');
  if (t) { t.textContent = title; var sb = t.nextElementSibling; if (sb) sb.textContent = sub; }
  if (t && t.parentElement !== head) { while (head.children.length > 1) head.removeChild(head.lastChild); } else if (head.children.length > 1) gone(head.children[0]);
  while (root.children.length > 1) root.removeChild(root.lastChild); root.classList.add('px-gutter-sm', 'pb-6', 'flex', 'flex-col', 'gap-3'); root.classList.remove('pb-24', 'space-y-space-md', 'space-y-4', 'gap-space-md');
  return root;
}
function mTiles(root, items) { var g = document.createElement('div'); g.className = 'grid grid-cols-2 gap-2.5'; items.forEach(function (x) { var d = document.createElement('div'); d.className = 'p-3 rounded-xl bg-surface-container-lowest shadow-sm'; statCard(d, x[0], x[1], x[2]); var vv = d.querySelector('.font-numeric-stat'); if (vv) vv.className = 'font-headline-sm text-headline-sm text-on-surface break-words'; g.appendChild(d); }); root.appendChild(g); }
/* notifikasi */
var _notifD = V.notif;
V.notif = function () { return isMob() ? notifM.apply(this, arguments) : _notifD.apply(this, arguments); };
MOBOK.notif = 1;
async function notifM() {
  var res = await apiMany([['notifConfig', T], ['blastList', T], ['daftarUnit']]), c = res[0], bl = res[1] || [], un = res[2] || []; if (!c) return;
  var root = mShell('notif', 'Pusat Notifikasi', c.waAktif ? 'WhatsApp aktif - ' + (c.emailAktif ? 'Email aktif' : 'Email nonaktif') : 'WhatsApp nonaktif - ' + (c.emailAktif ? 'Email aktif' : 'Email nonaktif'));
  mTiles(root, [['Antrean WA', c.antrean.menunggu + ' menunggu', c.antrean.terkirim + ' terkirim, ' + c.antrean.gagal + ' gagal'], ['Kuota Email', c.sisaEmail + ' sisa', 'Hari ini'], ['WhatsApp', c.waAktif ? 'Aktif' : 'Nonaktif', c.adaToken ? 'Token ' + c.tokenMask : 'Token kosong'], ['Pengiriman', 'Batch ' + c.batch, 'Jeda ' + c.jeda + ' dtk']]);
  var bt = document.createElement('button'); bt.type = 'button'; bt.className = FC.sec + ' w-full'; bt.textContent = 'Proses Antrean Sekarang'; bt.onclick = async function () { var r = await api('prosesAntreanManual', T); if (r) { toast(typeof r === 'string' ? r : 'Antrean diproses.'); V.notif(); } }; root.appendChild(bt);
  notifCards(root, c, bl, un);
}
/* kontak */
var _crmD = V.crm;
V.crm = function () { return isMob() ? crmM.apply(this, arguments) : _crmD.apply(this, arguments); };
MOBOK.crm = 1;
async function crmM() {
  var c = await api('crmList', T, '', ''); if (!c) return;
  var root = mShell('crm', 'Kontak', 'Daftar penerima blast WhatsApp dan email');
  mTiles(root, [['Total Kontak', c.total, 'Peserta, staf, manual'], ['WA Terdaftar', c.terdaftarWa, 'Hasil deteksi'], ['Opt-out', c.optOut, 'Tidak menerima blast']]);
  var bar = document.createElement('div'); bar.className = 'flex gap-2 flex-wrap'; bar.innerHTML = '<button type="button" id="k-sync" class="' + FC.sec + '">Sinkron dari Akun</button><button type="button" id="k-det" class="' + FC.sec + '">Deteksi WA</button><button type="button" id="k-xls" class="' + FC.pri + '">Unduh Excel</button>'; root.appendChild(bar);
  crmCards(root, c); $('k-sync').onclick = crmSync; $('k-det').onclick = crmDetect; $('k-xls').onclick = function () { dlB64('crmExport'); };
}
/* migrasi */
var _migD = V.mig;
V.mig = function () { return isMob() ? migM.apply(this, arguments) : _migD.apply(this, arguments); };
MOBOK.mig = 1;
async function migM() {
  var i = await api('importInfo', T); if (!i) return; var nm = { units: 'Unit kerja', users: 'Akun pengguna', schedules: 'Jadwal', registrations: 'Registrasi', scores: 'Nilai', certificates: 'Sertifikat', questions: 'Bank soal', evaluations: 'Evaluasi' };
  var root = mShell('mig', 'Migrasi Data', 'Impor akun dan data dari aplikasi lama atau CSV');
  var tp = document.createElement('button'); tp.type = 'button'; tp.className = FC.sec + ' w-full'; tp.textContent = 'Unduh Templat CSV'; tp.onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + String(i.csvKolom).replace(/,\s*/g, ';') + '\r\n'], { type: 'text/csv' })); a.download = 'templat-karyawan.csv'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }; root.appendChild(tp);
  migCards(root, i, nm);
}
/* keamanan */
var _secD = V.sec;
V.sec = function () { return isMob() ? secM.apply(this, arguments) : _secD.apply(this, arguments); };
MOBOK.sec = 1;
async function secM() {
  var c = await api('keamananConfig', T); if (!c) return;
  var root = mShell('sec', 'Keamanan & Akses Login', c.googleAktif ? 'Login Google aktif' : 'Login Google belum aktif');
  fcard(root, 'g-card', 'Login Google dan Kebijakan Akses', 'Rahasia sistem disimpan di Script Properties dan tidak tampil di sini.', secFormHtml(c, FC.lab, FC.inp));
  $('g-save').onclick = secSave; $('g-pol').onclick = secWajib; $('g-reload').onclick = function () { V.sec(); };
  fcard(root, 'g-staf', 'Akun Trainer dan Admin', 'Email harus sama dengan akun Google yang dipakai masuk.', c.staf.map(function (s) { return '<div class="p-3 rounded-xl bg-surface-container-low flex flex-col"><b class="font-title-md text-on-surface">' + esc(s.nama) + '</b><span class="font-body-sm text-on-surface-variant">' + esc(s.role) + ' - ' + esc(s.username) + '</span><span class="font-body-sm text-on-surface-variant break-all">' + esc(s.email) + '</span></div>'; }).join('') || '<p class="font-body-md text-on-surface-variant">Belum ada akun.</p>');
}

/* ===================== MASA BERLAKU - varian mobile ===================== */
var _expD = V.exp;
V.exp = function () { return isMob() ? expM.apply(this, arguments) : _expD.apply(this, arguments); };
MOBOK.exp = 1;
async function expM() {
  var r = await api('expiryOverview', T) || { expired: [], soon: [] }; expRows = [];
  r.expired.forEach(function (x) { x.status = 'Kedaluwarsa'; expRows.push(x); }); r.soon.forEach(function (x) { x.status = 'Segera berakhir'; expRows.push(x); });
  var m = MS(TPL.exp), root = m.firstElementChild, hdr = root.children[0], tabsEl = root.children[1], statEl = root.children[2].firstElementChild;
  gone(findHas(hdr, 'Audit Aktif Q4')); S(hdr, 'Komite K3 • SHLC', 'Masa Berlaku Sertifikat');
  var tb = [].slice.call(tabsEl.querySelectorAll('button')), onC = tb[0].className, offC = tb[1].className, flt = 'all', q = '';
  while (root.children.length > 3) root.removeChild(root.lastChild);
  var sc = statEl.children; statCard(sc[0], 'Kedaluwarsa', r.expired.length, 'Wajib training ulang'); statCard(sc[1], 'Segera Berakhir', r.soon.length, 'Dalam 30 hari'); gone(sc[3]); gone(sc[2]);
  [].slice.call(sc).forEach(function (d) { var vv = d.querySelector('.font-numeric-stat'); if (vv) vv.className = 'font-headline-sm text-headline-sm text-on-surface'; });
  var wrap = document.createElement('div'); wrap.className = 'px-margin-mobile flex flex-col gap-3 pb-4'; var sq = document.createElement('input'); sq.className = FC.inp; sq.type = 'search'; sq.placeholder = 'Cari nama, NIK, atau unit'; wrap.appendChild(sq); var box = document.createElement('div'); box.className = 'flex flex-col gap-3'; wrap.appendChild(box); root.appendChild(wrap);
  var lbl = [['Semua', expRows.length], ['Wajib Retraining', r.expired.length], ['Segera Berakhir', r.soon.length]];
  tb.forEach(function (b, i) { var dot = b.querySelector('span.w-2'); b.innerHTML = (dot ? dot.outerHTML : '') + esc(lbl[i][0] + ' (' + lbl[i][1] + ')'); b.className = i === 0 ? onC : offC; b.onclick = function () { flt = ['all', 'exp', 'soon'][i]; tb.forEach(function (z, k) { z.className = k === i ? onC : offC; }); draw(); }; });
  function draw() {
    box.innerHTML = ''; var n = 0, f = norm(sq.value).toLowerCase();
    expRows.forEach(function (x) {
      var soon = x.status !== 'Kedaluwarsa'; if (flt === 'exp' && soon) return; if (flt === 'soon' && !soon) return; if (f && (x.nama + ' ' + x.nik + ' ' + x.unit).toLowerCase().indexOf(f) < 0) return; n++;
      var c = document.createElement('div'); c.className = 'bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3';
      c.innerHTML = '<div class="flex items-start gap-3"><div class="w-11 h-11 rounded-full ' + (soon ? 'bg-secondary-fixed text-secondary' : 'bg-error-container text-on-error-container') + ' flex items-center justify-center font-bold shrink-0">' + esc(ini(x.nama)) + '</div><div class="min-w-0 flex-1"><b class="font-title-md text-on-surface break-words">' + esc(x.nama) + '</b><div class="font-body-sm text-on-surface-variant">NIK ' + esc(x.nik || '-') + ' • ' + esc(x.unit || '-') + '</div></div><span class="font-label-sm px-2.5 py-0.5 rounded-full ' + (soon ? 'bg-secondary-fixed text-secondary' : 'bg-error-container text-on-error-container') + ' font-bold shrink-0">' + (soon ? 'Sisa ' + x.sisa + ' hari' : 'Lewat ' + (typeof x.sisa === 'number' ? Math.abs(x.sisa) : 0) + ' hari') + '</span></div><div class="font-body-sm text-on-surface-variant">' + (soon ? 'Berakhir: ' : 'Expired: ') + esc(x.exp) + ' • Lulus terakhir: ' + esc(x.lulus) + '</div><div class="grid grid-cols-2 gap-2"><button type="button" class="b-wa ' + FC.sec + '">WhatsApp</button><button type="button" class="b-em ' + FC.sec + '">Email</button></div>';
      var bw = c.querySelector('.b-wa'), be = c.querySelector('.b-em'); if (waNum(x.wa)) bw.onclick = function () { window.open(wa(x, soon), '_blank'); }; else { bw.disabled = true; bw.classList.add('opacity-50'); bw.textContent = 'WA tidak valid'; } be.setAttribute('data-e', x.email || ''); be.onclick = function () { kirimEmail(be); };
      box.appendChild(c);
    });
    if (!n) box.innerHTML = '<p class="font-body-md text-on-surface-variant text-center py-6">' + (expRows.length ? 'Tidak ada hasil.' : 'Tidak ada sertifikat yang kedaluwarsa atau segera berakhir.') + '</p>';
  }
  sq.oninput = draw; draw();
}

/* ===================== UNIT KERJA - varian mobile ===================== */
var _unitD = V.unit;
V.unit = function () { return isMob() ? unitM.apply(this, arguments) : _unitD.apply(this, arguments); };
MOBOK.unit = 1;
async function unitM() {
  var res = await apiMany([['unitAdmin', T], ['reportData', T]]), u = res[0], rp = res[1]; if (!u) return; unitData = u;
  var pu = {}; ((rp && rp.perUnit) || []).forEach(function (x) { pu[x.unit] = x; }); var names = u.units.map(function (z) { return z.unit; });
  var m = MS(TPL.unit), root = m.firstElementChild, hdr = root.children[0], srch = root.children[1].firstElementChild;
  gone(findHas(hdr, 'KARS Rev. 2024')); S(hdr, 'SHLC K3 & Zonasi Risiko RS', 'Master Unit Kerja'); var si = srch.querySelector('input'); si.id = 'search-unit-input'; si.placeholder = 'Cari unit kerja...';
  while (root.children.length > 2) root.removeChild(root.lastChild); while (root.children[1].children.length > 1) root.children[1].removeChild(root.children[1].lastChild); [].slice.call(srch.children).forEach(function (c) { if (c.tagName === 'DIV' && c.className.indexOf('right-0') > -1) gone(c); });
  root.classList.add('gap-3'); var holder = document.createElement('div'); holder.className = 'px-margin-mobile flex flex-col gap-3 pb-6'; root.appendChild(holder);
  mTiles(holder, [['Total Unit', u.units.length, 'Unit baku'], ['Perlu Dipetakan', u.lain.length, 'Isian lama']]);
  /* pemetaan */
  if (u.lain.length) {
    var mp = u.lain.map(function (z, i) { return '<div class="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2"><div class="flex items-center justify-between gap-2"><b class="font-title-md text-on-surface break-words">' + esc(z.nilai) + '</b><span class="font-label-sm px-2 py-0.5 rounded-full bg-surface-container">' + z.jumlah + ' pengguna</span></div><select id="pm-' + i + '" class="' + FC.inp + '">' + names.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</select><button type="button" class="' + FC.pri + '" onclick="unitPetakan(' + i + ')">Petakan</button></div>'; }).join('');
    fcard(holder, 'u-map', 'Perlu Dipetakan', u.aktif ? 'Isian unit lama yang belum ada di daftar baku.' : 'Tambahkan unit baku terlebih dahulu.', u.aktif ? mp : '');
  }
  fcard(holder, 'u-add', 'Tambah atau Perbarui Unit', 'Peserta memilih unit dari daftar ini.', '<label class="' + FC.lab + '">Nama Unit Kerja</label><input id="un-n" class="' + FC.inp + '" maxlength="80" placeholder="Contoh: Hemodialisa"><label class="' + FC.lab + '">Jumlah Karyawan (opsional)</label><input id="un-k" inputmode="numeric" class="' + FC.inp + '" placeholder="Untuk persentase di Laporan"><div><button type="button" id="un-s" class="' + FC.pri + '">Simpan Unit Kerja</button></div>'); $('un-s').onclick = unitSimpan;
  var lc = document.createElement('div'); lc.className = 'flex flex-col gap-3'; holder.appendChild(lc);
  function draw() {
    var f = norm(si.value).toLowerCase(); lc.innerHTML = ''; var n = 0;
    u.units.forEach(function (z) {
      if (f && z.unit.toLowerCase().indexOf(f) < 0) return; n++; var p = pu[z.unit] || { aktif: 0 }, den = +z.karyawan > 0 ? +z.karyawan : (+p.akun || 0), pc = den ? Math.min(100, Math.round(p.aktif / den * 100)) : 0, c = document.createElement('div'); c.className = 'rounded-2xl p-4 bg-surface-container-lowest shadow-sm flex flex-col gap-2';
      c.innerHTML = '<div class="flex items-start justify-between gap-2"><div class="min-w-0"><b class="font-title-md text-on-surface break-words">' + esc(z.unit) + '</b><div class="font-body-sm text-on-surface-variant">Dipakai ' + z.dipakai + ' pengguna' + (z.karyawan !== '' ? ' • ' + z.karyawan + ' karyawan' : '') + '</div></div><span class="font-label-sm px-2 py-0.5 rounded-full shrink-0 ' + (!den ? 'bg-surface-container text-on-surface-variant' : pc >= 80 ? 'bg-emerald-100 text-emerald-900' : 'bg-error-container text-on-error-container') + '">' + (den ? pc + '%' : 'n/a') + '</span></div><div class="h-2 rounded-full bg-surface-container overflow-hidden"><div class="h-full bg-secondary" style="width:' + pc + '%"></div></div><div class="grid grid-cols-2 gap-2"><button type="button" class="b-ub ' + FC.sec + '">Ubah Nama</button><button type="button" class="b-hp ' + FC.dgr + '">Hapus</button></div>';
      var bu = c.querySelector('.b-ub'), bh = c.querySelector('.b-hp');
      bu.onclick = async function () { var nn = window.prompt('Nama baru untuk unit "' + z.unit + '"', z.unit); if (nn === null) return; var rr = await api('gantiNamaUnit', T, z.unit, nn); if (rr) { toast(rr); V.unit(); } };
      if (z.dipakai) { bh.disabled = true; bh.classList.add('opacity-40'); } else bh.onclick = function () { if (confirm('Hapus unit "' + z.unit + '"?')) api('hapusUnit', T, z.unit).then(function (rr) { if (rr) { toast(rr); V.unit(); } }); };
      lc.appendChild(c);
    });
    if (!n) lc.innerHTML = '<p class="font-body-md text-on-surface-variant text-center py-6">' + (u.units.length ? 'Tidak ada hasil.' : 'Belum ada unit baku.') + '</p>';
  }
  si.oninput = draw; draw();
}

/* ===================== LOG & CADANGAN - varian mobile ===================== */
var _logD = V.log;
V.log = function () { return isMob() ? logM.apply(this, arguments) : _logD.apply(this, arguments); };
MOBOK.log = 1;
async function logM() {
  var res = await apiMany([['statusCadangan', T], ['riwayatLog', T, '']]), c = res[0] || {}, lg = res[1] || [];
  var m = MS(TPL.log), root = m.firstElementChild, s = root.children;
  S(s[0], 'ISO 27001 / PDP', 'Audit'); var hp = s[0].querySelector('p'); if (hp) hp.textContent = 'Riwayat perubahan data dan cadangan otomatis sistem.';
  var hero = s[1].firstElementChild, inner = hero.querySelector('.relative.z-10');
  inner.innerHTML = '<div class="flex flex-col gap-1"><span class="font-label-sm uppercase tracking-wider text-primary-fixed-dim">Cadangan Data</span><b class="font-headline-sm text-on-primary">' + esc(c.terakhir || 'Belum ada cadangan') + '</b><span class="font-body-sm text-primary-fixed-dim">' + (c.simpan || 14) + ' salinan disimpan • otomatis tiap malam di folder Drive "Cadangan SHLC"</span></div><div class="flex gap-2 flex-wrap"><button type="button" id="b-now" class="' + FC.pri + '">Cadangkan Sekarang</button>' + (c.url ? '<button type="button" id="b-url" class="' + FC.sec + '">Buka Folder</button>' : '') + '<button type="button" id="b-xls" class="' + FC.sec + '">Unduh Log</button></div>';
  $('b-now').onclick = function () { cadangNow($('b-now')); }; if (c.url) $('b-url').onclick = function () { window.open(c.url, '_blank'); }; $('b-xls').onclick = function () { dlB64('exportLog'); };
  var sec2 = s[2], si = sec2.querySelector('input'); si.id = 'audit-search'; si.placeholder = 'Cari pelaku, aksi, atau target'; var pills = sec2.querySelector('.overflow-x-auto'); gone(pills); gone(sec2.querySelector('button.hidden'));
  var list = s[3]; list.innerHTML = '';
  function draw(a) {
    list.innerHTML = a.length ? '' : '<p class="font-body-md text-on-surface-variant text-center py-6">Belum ada catatan.</p>';
    a.slice(0, 60).forEach(function (l) { var d = document.createElement('div'); d.className = 'audit-card w-full rounded-xl bg-surface-container-lowest p-space-sm shadow-sm flex flex-col gap-1'; d.innerHTML = '<div class="flex items-center justify-between gap-2"><span class="font-label-sm px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold uppercase break-all">' + esc(String(l.aksi || '-').replace(/_/g, ' ')) + '</span><span class="font-body-sm text-on-surface-variant shrink-0">' + esc(l.waktu || '') + '</span></div><div class="font-body-md text-on-surface"><b>' + esc(l.aktor || '-') + '</b> (' + esc(l.peran || '-') + ')' + (l.target ? ' → ' + esc(l.target) : '') + '</div>' + (l.detail ? '<div class="font-body-sm text-on-surface-variant break-words">' + esc(l.detail) + '</div>' : ''); list.appendChild(d); });
  }
  draw(lg); var t = null; si.oninput = function () { clearTimeout(t); t = setTimeout(async function () { var rr = await api('riwayatLog', T, si.value); if (rr) draw(rr); }, 350); };
}
