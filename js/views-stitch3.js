/* views-stitch3.js - pengikat desktop layar Stitch tahap 3 (prof, quiz, exp, unit, log, sec, rst, notif, crm, mig).
   Markup Stitch tetap; hanya teks/atribut diganti dengan data nyata. Panel dan angka fiktif dibuang. */
function findHas(root, sub, sel) { var els = root.querySelectorAll('*'), best = null; for (var i = 0; i < els.length; i++) { if (plain(els[i]).indexOf(sub) >= 0) best = els[i]; } return best && sel ? best.closest(sel) : best; }
function tileOf(m, label) { var l = find(m, label); return l ? up(l, 2) : null; }
V.prof = async function () {
  var peserta = U.role === 'peserta';
  var res = await apiMany([['daftarUnit'], ['statusPermintaanSaya', T], peserta ? ['myStatus', T] : ['daftarUnit']]), un = res[0] || [], rq = res[1], st = res[2];
  var m = MS(TPL.prof), rl = U.role === 'peserta' ? 'PESERTA' : U.role === 'trainer' ? 'TRAINER' : 'ADMIN';
  S(m, 'SR', ini(U.nama_ktp)); S(m, 'PESERTA - ICU', rl + (U.unit_kerja ? ' - ' + U.unit_kerja : ''));
  var kv = find(m, 'K3 Terverifikasi'); if (kv && !(st && (st.state === 'ok' || st.state === 'soon'))) gone(kv);
  S(m, 'Ns. Siti Rahmawati, S.Kep', U.nama_ktp); S(m, 'Perawat Pelaksana ICU • SHLC Lippo Cikarang', (U.unit_kerja || '-') + ' • SHLC Lippo Cikarang');
  S(m, 'SHLC-2021-0842', U.nik || '-', null); S(m, '+62 812-9845-1120', normWa(U.no_wa) || '-'); S(m, 'siti.rahmawati@siloam...', U.email || '-');
  gone(tileOf(m, 'Zonasi K3 Evakuasi'));
  /* kartu sertifikat: hanya untuk peserta, isi dari status sebenarnya */
  var ct = tileOf(m, 'Sertifikat K3 Kebakaran');
  if (!peserta || !st) gone(ct && ct.parentElement.children.length === 2 ? ct : null);
  else if (ct) {
    var txt = st.state === 'belum' ? 'Belum lulus Post-test' : st.state === 'expired' ? 'Kedaluwarsa sejak ' + tglPendek(st.exp) : 'Aktif s/d ' + tglPendek(st.exp);
    S(ct, 'Aktif s/d 14 Nov 2027', txt); S(ct, 'Kondisi Prima • Siaga Tim Merah', st.state === 'soon' ? 'Segera ikuti refresher (sisa ' + st.sisa + ' hari)' : st.state === 'ok' ? 'Sertifikat berlaku' : st.state === 'expired' ? 'Wajib training ulang' : 'Ikuti training lalu Post-test');
  }
  var pdp = tileOf(m, 'Kepatuhan UU PDP No. 27/2022'); if (pdp) { S(pdp, 'Tervalidasi & Terenkripsi', 'Persetujuan data tercatat'); S(pdp, 'Konsensus Karyawan SHLC Aktif', 'UU PDP No. 27/2022'); S(pdp, 'Kepatuhan UU PDP No. 27/2022', 'Privasi Data'); }
  /* form data */
  S(m, 'Informasi identitas dinas terintegrasi SIMRS & HRIS Siloam Hospitals Lippo Cikarang', 'Data identitas Anda pada Super App Fire & Safety SHLC.'); gone(up(find(m, 'Terhubung HRIS'), 0));
  var f = $('profileForm'), ins = f.querySelectorAll('input'), nik = ins[0], tgl = ins[1];
  nik.value = U.nik || ''; nik.readOnly = true;
  tgl.type = 'date'; tgl.value = tglIso(U.tgl_lahir) || ''; tgl.readOnly = false; tgl.classList.remove('bg-slate-50', 'text-slate-600'); tgl.classList.add('bg-surface-container-lowest', 'text-on-surface'); tgl.id = 'p-tgl';
  var lk = find(m, 'Verifikasi KTP'); gone(lk); gone(find(m, 'Terkunci HR')); S(m, 'Unit Kerja Operasional (Tercatat 43 Unit Baku)', 'Unit Kerja' + (un.length ? ' (' + un.length + ' unit terdaftar)' : ''));
  gone(find(m, 'Tugas Pokok Evakuasi Kebakaran')); gone(find(m, 'Penentuan unit operasional mempengaruhi pembagian regu Helm Merah/Kuning saat simulasi Code Red.'));
  var sel = $('unitKerja'); sel.id = 'p-unit'; sel.innerHTML = '';
  var lst = un.slice(); if (U.unit_kerja && lst.indexOf(U.unit_kerja) < 0) lst.unshift(U.unit_kerja);
  lst.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n; if (n === U.unit_kerja) o.selected = true; sel.appendChild(o); });
  S(m, 'Nomor WhatsApp Siaga Darurat (Fire Alarm Broadcast)', 'Nomor WhatsApp'); S(m, 'Nomor aktif terdaftar pada bot telegram & WhatsApp Komite K3 SHLC untuk sinyal darurat simulasi.', 'Dipakai untuk pengingat jadwal dan masa berlaku sertifikat.');
  var wa = $('waInput'); wa.id = 'p-wa'; wa.value = normWa(U.no_wa).replace(/^\+62/, ''); wa.setAttribute('inputmode', 'numeric'); wa.placeholder = '81234567890';
  S(m, 'Email Resmi Siloam', 'Email Google (untuk login)'); var em = $('siloamEmail'); em.id = 'p-email'; em.value = U.email || ''; em.readOnly = true; em.classList.add('bg-slate-50', 'text-slate-600');
  gone(up($('altEmail'), 2)); up($('p-email'), 2).classList.add('sm:col-span-2');
  var svb = find(m, 'Simpan Perubahan Data', 'button'); svb.type = 'button'; svb.onclick = function () { f.requestSubmit ? f.requestSubmit() : saveProf3(); }; f.onsubmit = function (e) { e.preventDefault(); saveProf3(); };
  /* keamanan sandi: login memakai Google, jadi panel sandi dihapus */
  gone(up(find(m, 'Keamanan Akun & Sandi'), 2));
  /* privasi */
  S(m, 'Perlindungan & Portabilitas Data Pribadi Tenaga Medis SHLC', 'Unduh salinan data Anda atau ajukan penghapusan akun');
  S(m, 'Unduh seluruh arsip sertifikat K3, log kehadiran simulasi kebakaran berkala, catatan drill Code Red, dan riwayat skor kuis Anda dalam format terbuka.', 'Unduh data akun, riwayat kehadiran, skor kuis, dan sertifikat Anda dalam format Excel.');
  S(m, 'Unduh Data Pribadi Saya (Excel / PDF)', 'Unduh Data Saya (Excel)'); btn(m, 'Unduh Data Pribadi Saya (Excel / PDF)', function () { dlB64('unduhDataSaya'); }); btn(m, 'Unduh Data Saya (Excel)', function () { dlB64('unduhDataSaya'); });
  var chip = find(m, 'Nol Permohonan Aktif'); if (chip) setTxt(chip, rq && rq.status === 'menunggu' ? 'Permohonan diproses admin' : rq && rq.status === 'ditolak' ? 'Permohonan ditolak' : 'Tidak ada permohonan');
  S(m, 'Alasan Resmi Pengajuan De-identifikasi', 'Alasan pengajuan (opsional)'); var ta = $('deleteReason'); ta.id = 'dr-a'; ta.value = ''; ta.placeholder = 'Tuliskan alasan pengajuan Anda'; ta.maxLength = 300;
  S(m, 'Konfirmasi: Pengajuan ini akan diteruskan ke DPO (Data Protection Officer) RS Siloam & Komite K3 untuk diverifikasi sebelum data dihapus dalam kurun 3x24 jam.', 'Konfirmasi: pengajuan akan ditinjau admin. Data tertentu dapat tetap disimpan sesuai ketentuan rumah sakit.');
  var da = $('dangerZoneAction'), box = $('deleteConfirmationBox');
  if (rq && rq.status === 'menunggu') { da.innerHTML = '<div class="p-3 rounded-xl bg-amber-50 text-amber-950 font-body-sm text-body-sm">Permintaan penghapusan data Anda sedang diproses admin.</div>'; ta.disabled = true; }
  else {
    if (rq && rq.status === 'ditolak') { var nt = document.createElement('p'); nt.className = 'font-body-sm text-body-sm text-on-surface-variant'; nt.textContent = 'Permintaan terakhir ditolak: ' + (rq.catatan || '-'); da.parentNode.insertBefore(nt, da); }
    btn(da, 'Ajukan Penghapusan & De-identifikasi Akun', function () { hid(da); box.classList.remove('hidden'); });
    btn(box, 'Batal', function () { box.classList.add('hidden'); da.classList.remove('hidden'); });
    btn(box, 'Kirim Permohonan Resmi', function () { ajukanHapus(); });
  }
  gone(up(find(m, 'Enkripsi End-to-End SHLC Cloud'), 3));
};
async function saveProf3() {
  var r = await api('updateProfile', T, { nama_ktp: U.nama_ktp, tgl_lahir: val('p-tgl'), unit_kerja: val('p-unit'), no_wa: normWa('+62' + String(val('p-wa')).replace(/\D/g, '').replace(/^0+/, '')), email: U.email });
  if (!r) return; U = r; save('shlc_u', JSON.stringify(U)); setWho(); toast('Profil berhasil diperbarui.');
  var s = $('saveStatus'); if (s) { s.classList.remove('hidden'); s.classList.add('flex'); setTimeout(function () { s.classList.add('hidden'); s.classList.remove('flex'); }, 3000); }
}

/* ===== KUIS (peserta) ===== */
var QZ = null, quizTick = null;
V.quiz = async function () {
  if (quizPoll) { clearInterval(quizPoll); quizPoll = null; } if (quizTick) { clearInterval(quizTick); quizTick = null; }
  var s = await api('quizStatus', T); if (!s) return;
  Q = null; QZ = null;
  var m = MS(TPL.quiz), hasPre = s.pre !== null && s.pre !== undefined, terbuka = !!s.postBuka;
  /* header + timer */
  var tm = up(find(m, 'Tersisa'), 3), tut = s.postTutup ? new Date(String(s.postTutup).replace(' ', 'T') + '+07:00') : null;
  if (terbuka && tut && !isNaN(tut) && !s.lulus) {
    S(m, 'Sesi Dibuka s/d 17.00 WIB', 'Post-test ditutup ' + jamAny(s.postTutup));
    var te = $('quiz-timer'), tick = function () { if (!$('quiz-timer')) { clearInterval(quizTick); quizTick = null; return; } var d = Math.max(0, Math.floor((tut - new Date()) / 1000)); $('quiz-timer').textContent = ('0' + Math.floor(d / 3600)).slice(-2) + ':' + ('0' + Math.floor(d % 3600 / 60)).slice(-2) + ':' + ('0' + d % 60).slice(-2); };
    tick(); quizTick = setInterval(tick, 1000);
  } else gone(tm);
  /* tiga langkah */
  var cards = m.querySelectorAll('section')[1].querySelectorAll(':scope > div > div'), st3 = !s.hadir || !hasPre ? 'lock' : s.lulus ? 'done' : terbuka ? 'now' : 'lock';
  function stepCard(c, state, ttl, txt, icon) {
    var chip = c.querySelector('.mt-0\\.5 span'); if (chip) setTxt(chip, txt);
    if (state !== 'done' && state !== 'now') c.classList.add('opacity-60');
    if (state === 'lock') { var ic = c.querySelector('.material-symbols-outlined'); if (ic) ic.textContent = 'lock'; }
  }
  stepCard(cards[0], s.hadir ? 'done' : 'now', '', s.hadir ? 'Sudah tercatat hadir' : (s.terdaftar ? 'Menunggu dicatat trainer' : 'Belum terdaftar'));
  stepCard(cards[1], !s.hadir ? 'lock' : hasPre ? 'done' : 'now', '', hasPre ? 'Skor: ' + s.pre + '/100 (Tercatat)' : 'Wajib, hanya 1x');
  stepCard(cards[2], st3, '', s.lulus ? 'Lulus (terbaik ' + s.best + ')' : terbuka ? (s.post ? s.post + 'x percobaan, terbaik ' + s.best : 'Lulus jika nilai ≥ 80') : 'Menunggu trainer membuka Post-test');
  /* konten utama */
  var art = m.querySelector('article'), content = art.children[0], footer = art.children[1];
  var labels = content.querySelectorAll('label'), tplUn = labels[0].cloneNode(true), tplSel = labels[1].cloneNode(true), optBox = labels[0].parentElement;
  gone(content.querySelector('.mb-6.relative.rounded-2xl'));                                     // banner kasus ICU fiktif
  gone(up(find(content, 'Kebakaran Kelas C (Elektrikal) - ICU'), 0));
  S(content, 'Pertanyaan Skenario:', 'Pertanyaan:');
  var pnl = document.createElement('div'); pnl.id = 'q-panel'; pnl.className = 'flex flex-col items-center text-center gap-4 py-10 px-4';
  art.insertBefore(pnl, content); hid(content); hid(footer);
  function panel(icon, ttl, txt, actions) {
    pnl.innerHTML = '<div class="w-16 h-16 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center"><span class="material-symbols-outlined text-[32px]">' + icon + '</span></div>' +
      '<h2 class="font-headline-sm text-headline-sm text-on-surface">' + esc(ttl) + '</h2><p class="font-body-md text-on-surface-variant max-w-md">' + esc(txt) + '</p><div class="flex gap-3 flex-wrap justify-center" id="q-act"></div>';
    (actions || []).forEach(function (a) { var b = document.createElement('button'); b.type = 'button'; b.className = a.sec ? 'px-5 py-3 rounded-xl bg-surface-container text-on-surface font-title-md text-sm' : 'px-6 py-3 rounded-xl bg-secondary-container text-white font-title-md text-sm shadow-sm'; b.textContent = a.t; b.onclick = a.f; $('q-act').appendChild(b); });
  }
  var reload = { t: 'Muat Ulang', sec: true, f: function () { V.quiz(); } };
  if (!s.aktif) panel('event_busy', 'Belum ada jadwal training aktif', 'Kuis tersedia setelah trainer mempublikasikan jadwal.', [reload]);
  else if (!s.terdaftar) panel('how_to_reg', 'Anda belum terdaftar', 'Daftar pada jadwal aktif lewat menu Beranda terlebih dahulu.', [reload]);
  else if (!s.hadir) panel('qr_code_scanner', 'Kehadiran belum dicatat', 'Minta trainer menandai hadir (scan QR atau kode absensi), lalu tekan Muat Ulang.', [reload]);
  else if (!hasPre) panel('assignment_turned_in', 'Pre-Test', 'Wajib dikerjakan satu kali sebelum Post-test.', [{ t: 'Mulai Pre-test', f: function () { startQ3('pretest'); } }]);
  else if (!s.lulus && !terbuka) {
    panel('hourglass_top', 'Menunggu Post-test dibuka', 'Post-test dibuka oleh trainer. Halaman memeriksa otomatis setiap 20 detik.', [reload]);
    quizPoll = setInterval(function () { if (!$('q-panel')) { clearInterval(quizPoll); quizPoll = null; return; } if (document.hidden) return; api('quizStatus', T).then(function (z) { if (z && z.postBuka && $('q-panel')) V.quiz(); }); }, 20000);
  } else if (!s.lulus) panel('play_circle', 'Post-Test', 'Lulus jika nilai minimal 80. Percobaan ke-' + ((s.post || 0) + 1) + '.', [{ t: 'Mulai Post-test', f: function () { startQ3('posttest'); } }]);
  else panel('workspace_premium', 'Anda sudah lulus', 'Sertifikat tersedia di menu Beranda.', []);
  /* kolom kanan */
  gone(up(find(m, 'Pedoman Evakuasi Pasien ICU Selama Kode Merah (Code Red)'), 2));
  var grid = m.querySelector('.grid.grid-cols-5'), nb = grid.children, K = { a: nb[0].className, f: nb[2].className, c: nb[6].className, e: nb[7].className };
  var navCard = up(grid, 1), sub = find(m, 'Kirim Jawaban Akhir (Kunci Soal)', 'button'), hint = sub.nextElementSibling, subOn = labels[0].closest('article').querySelector('button.w-full, button:last-child') && null;
  var bNext = find(m, 'Simpan & Lanjutkan', 'button'), bPrev = find(m, 'Soal Sebelumnya', 'button'), bFlag = find(m, 'Tandai Ragu', 'button'), subCls = sub.className, onCls = bNext.className;
  hid(navCard);
  /* riwayat nilai */
  var rh = find(m, 'Riwayat Post-Test'); if (rh) setTxt(rh, 'Riwayat Nilai'); gone(find(m, 'Maks 3x Sesi'));
  var rows = up(find(m, 'Percobaan Pertama'), 3), rbox = rows.parentElement;
  var rt = rbox.children[1].cloneNode(true); while (rbox.firstChild) rbox.removeChild(rbox.firstChild);
  function rowH(circ, ttl, sb, sc, chip) { var n = rt.cloneNode(true), sp = n.querySelectorAll('span'); n.querySelector('.w-8').textContent = circ; sp[0].textContent = ttl; sp[1].textContent = sb; sp[2].textContent = sc; sp[3].textContent = chip; rbox.appendChild(n); }
  rowH('Pre', 'Pre-Test', hasPre ? 'Dikerjakan 1x' : 'Belum dikerjakan', hasPre ? 'Skor: ' + s.pre : '-', hasPre ? 'Tercatat' : 'Belum');
  rowH('Post', 'Post-Test', s.post ? s.post + ' percobaan' : 'Belum dikerjakan', s.post ? 'Terbaik: ' + s.best : '-', s.lulus ? 'Lulus' : s.post ? 'Belum Lulus' : 'Belum');
  S(m, 'Nilai kelulusan diambil dari skor tertinggi. Peserta yang lulus berhak mengunduh sertifikat digital mandatori Fire Safety KARS 2025.', 'Nilai kelulusan diambil dari skor tertinggi. Peserta yang lulus berhak mengunduh sertifikat digital Fire Safety.');
  S(m, 'SOP SHLC', 'Panduan');
  /* alur pengerjaan */
  var qn = find(content, 'Soal #07'), qd = find(content, 'dari 25 Soal'), bar = content.querySelector('.h-2.rounded-full > div'), qh = content.querySelector('h2'), chipT = find(content, 'Post-Test Evaluasi (Sesi Aktif)');
  var navT = find(m, 'Navigasi 25 Soal'), navC = find(m, '7 / 25');
  function paint() {
    var z = QZ, n = z.soal.length, cur = z.soal[z.i], dn = 0;
    z.soal.forEach(function (x) { if (z.ans[x.id]) dn++; });
    setTxt(qn, 'Soal #' + (z.i + 1)); setTxt(qd, 'dari ' + n + ' Soal'); bar.style.width = Math.round(dn / n * 100) + '%'; qh.textContent = cur.pertanyaan;
    optBox.innerHTML = '';
    cur.pilihan.forEach(function (p, k) {
      var L = 'ABCD'.charAt(k), sel = z.ans[cur.id] === L, e = (sel ? tplSel : tplUn).cloneNode(true);
      var inp = e.querySelector('input'); if (inp) { inp.type = 'radio'; inp.name = 'q' + cur.id; inp.value = L; inp.checked = sel; }
      var pe = e.querySelector('p'); pe.textContent = p; if (!sel) e.querySelector('div').textContent = L;
      e.onclick = function (ev) { ev.preventDefault(); z.ans[cur.id] = L; paint(); };
      optBox.appendChild(e);
    });
    setTxt(navT, 'Navigasi ' + n + ' Soal'); setTxt(navC, dn + ' / ' + n);
    grid.innerHTML = '';
    z.soal.forEach(function (x, ix) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = ('0' + (ix + 1)).slice(-2);
      b.className = ix === z.i ? K.c : z.flag[x.id] ? K.f : z.ans[x.id] ? K.a : K.e; b.onclick = function () { z.i = ix; paint(); }; grid.appendChild(b);
    });
    var all = dn === n; sub.disabled = !all; sub.className = all ? subCls.replace('bg-surface-container text-on-surface-variant cursor-not-allowed', 'bg-secondary-container text-white shadow-sm') : subCls;
    setTxt(hint, all ? 'Semua soal terjawab. Kirim untuk dinilai.' : 'Tombol terbuka setelah seluruh ' + n + ' soal terjawab (' + (n - dn) + ' tersisa).');
    bPrev.disabled = z.i === 0; bPrev.classList.toggle('opacity-40', z.i === 0);
    var last = z.i === n - 1; var nt = bNext.querySelector('span') || bNext; setTxt(nt, last ? 'Selesai' : 'Simpan & Lanjutkan');
    setTxt(bFlag.querySelector('span:last-child'), z.flag[cur.id] ? 'Hapus Tanda' : 'Tandai Ragu');
  }
  bPrev.onclick = function () { if (QZ.i > 0) { QZ.i--; paint(); } };
  bNext.onclick = function () { if (QZ.i < QZ.soal.length - 1) { QZ.i++; paint(); } else sub.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  bFlag.onclick = function () { var id = QZ.soal[QZ.i].id; QZ.flag[id] = !QZ.flag[id]; paint(); };
  sub.onclick = async function () {
    if (sub.disabled) return; sub.disabled = true;
    var r = await api('submitQuiz', T, QZ.j, QZ.ans); if (!r) { paint(); return; }
    hid(content); hid(footer); hid(navCard); pnl.classList.remove('hidden');
    var lulus = r.status === 'Lulus', ex = '';
    if (lulus) { var ms = await api('myStatus', T); if (ms && ms.exp) ex = ' Sertifikasi berlaku sampai ' + ms.exp + '.'; }
    panel(lulus ? 'workspace_premium' : 'replay', 'Nilai: ' + r.nilai, (lulus ? 'Selamat, Anda dinyatakan LULUS.' + ex : (QZ0 === 'pretest' ? 'Pre-test tercatat.' : 'Nilai belum mencapai 80. Anda dapat mengulang Post-test.')) + ' Percobaan ke-' + r.percobaan + '.', [{ t: 'Kembali ke Kuis', f: function () { V.quiz(); } }]);
  };
  var QZ0 = '';
  window.startQ3 = async function (j) {
    var r = await api('startQuiz', T, j); if (!r) { V.quiz(); return; }
    QZ0 = j; Q = { j: j, soal: r.soal }; QZ = { j: j, soal: r.soal, i: 0, ans: {}, flag: {} };
    setTxt(chipT, j === 'pretest' ? 'Pre-Test Tanggap Darurat' : 'Post-Test Evaluasi (percobaan ke-' + r.percobaan + ')');
    hid(pnl); content.classList.remove('hidden'); footer.classList.remove('hidden'); navCard.classList.remove('hidden'); paint();
    content.scrollIntoView({ block: 'start' });
  };
};

/* ===== MASA BERLAKU (trainer/admin) ===== */
function hariSelisih(s) { var d = pd(s); return isNaN(d) ? 0 : Math.round((new Date() - d) / 864e5); }
V.exp = async function () {
  var r = await api('expiryOverview', T) || { expired: [], soon: [] }; expRows = [];
  r.expired.forEach(function (x) { x.status = 'Kedaluwarsa'; expRows.push(x); }); r.soon.forEach(function (x) { x.status = 'Segera berakhir'; expRows.push(x); });
  var m = MS(TPL.exp);
  gone(up(find(m, 'SOP W-16 & W-22'), 0)); S(m, 'Kepatuhan standar proteksi kebakaran, evakuasi pasien kritis, dan kredensial Code Red bagi seluruh nakes dan staf penunjang RS Siloam Lippo Cikarang.', 'Peserta yang sertifikatnya sudah atau segera berakhir. Masa berlaku dihitung dari kelulusan Post-test terakhir + 1 tahun.');
  btn(m, 'Unduh Laporan (.xlsx)', function () { dlXlsx('expiry'); }); gone($('btn-blast-all'));
  /* filter */
  var units = {}; expRows.forEach(function (x) { if (x.unit) units[x.unit] = 1; });
  var sel = m.querySelector('select'); sel.innerHTML = '<option value="">Semua Unit Kerja (' + Object.keys(units).length + ')</option>' + Object.keys(units).sort().map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
  gone(up(find(m, 'Tampilan:'), 1)); gone(findHas(m, 'Sinkronisasi SIP/STR & K3RS', 'div.flex.items-center'));
  /* statistik */
  var stats = m.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4'), sc = stats.children;
  S(sc[0], '19', r.expired.length); S(sc[0], '1.8% Total Staf', 'Wajib training ulang'); gone(find(sc[0], 'Blokir Tim Leader')); S(sc[0], 'Kritis / Segera', 'Kedaluwarsa');
  S(sc[1], '48', r.soon.length); S(sc[1], '4.5% Total Staf', 'Segera berakhir'); gone(find(sc[1], 'Auto Reminder Aktif'));
  gone(sc[3]); gone(sc[2]); stats.className = stats.className.replace('lg:grid-cols-4', 'lg:grid-cols-2');
  /* daftar */
  var cardsEl = m.querySelectorAll('.w-full.bg-surface-container-lowest.rounded-2xl'), cE = cardsEl[0], cS = cardsEl[1];
  S(cE, 'Wajib Retraining - Sertifikat Kedaluwarsa', 'Wajib Training Ulang'); setTxt(find(cE, '19 Karyawan'), r.expired.length + ' Peserta'); S(cE, 'Staf dengan status Non-Active Fire Marshal harus menyelesaikan ujian ulang.', 'Sertifikat sudah lewat satu tahun sejak kelulusan terakhir. Kirim pengingat agar peserta mendaftar training berikutnya.');
  S(cS, 'Peringatan Dini - Segera Berakhir ≤ 30 Hari', 'Segera Berakhir (30 Hari)'); setTxt(find(cS, '48 Karyawan'), r.soon.length + ' Peserta');
  [cE, cS].forEach(function (c) {
    var soonList = c === cS, pc = soonList ? c.querySelector('#expiring-list > div') : c.querySelector('.person-card'), host = pc.parentNode, tpl = pc.cloneNode(true);
    [].slice.call(host.children).forEach(gone);
    var rowsAll = c === cE ? r.expired : r.soon, soon = c === cS;
    c._tpl = tpl; c._host = host; c._rows = rowsAll; c._soon = soon;
  });
  /* hapus elemen fiktif/tidak terhubung pada kartu daftar */
  var ca = $('check-all-expired'); if (ca) gone(ca.closest('div.flex.items-center.gap-2.bg-surface-container-low') || up(ca, 3));
  gone(find(cE, 'Kirim Blast WhatsApp Darurat', 'button')); gone($('toggle-empty-view')); gone(findHas(cS, 'Protokol Dispatch Otomatis Terjadwal', '.rounded-xl'));
  gone(findHas(cS, 'Google Apps Script Scheduler v4.2', '.rounded-xl')); S(cS, 'Preventif kedaluwarsa sertifikat sebelum jadwal rotasi akreditasi dan supervisi KARS.', 'Sertifikat yang berakhir dalam 30 hari ke depan.');
  var man = find(cE, 'Mandat Akreditasi JCI FMS.11 & KARS Standar MFK:'); if (man) gone(up(man, 2));
  [cE, cS].forEach(function (c) { var pg = find(c, 'Menampilkan'); var foot = pg && up(pg, 1); if (foot && foot.parentElement === c) gone(foot); else { var p2 = c.querySelector('.mt-6.pt-4'); gone(p2); } });
  function render() {
    var q = norm(($('search-input').value || '')).toLowerCase(), un = sel.value;
    [cE, cS].forEach(function (c) {
      var host = c._host, n = 0; host.innerHTML = '';
      c._rows.forEach(function (x) {
        if (un && x.unit !== un) return; if (q && (x.nama + ' ' + x.nik + ' ' + x.unit).toLowerCase().indexOf(q) < 0) return; n++;
        var e = c._tpl.cloneNode(true), soon = c._soon, ck = e.querySelector('input[type=checkbox]'); gone(ck);
        setTxt(e.querySelector('.w-12'), ini(x.nama)); var nm = e.querySelector('span.font-title-md'); setTxt(nm, x.nama);
        var s2 = nm.nextElementSibling, s3 = s2 && s2.nextElementSibling; setTxt(s2, 'NIK: ' + (x.nik || '-')); setTxt(s3, soon ? 'Sisa ' + x.sisa + ' Hari' : 'Lewat ' + (typeof x.sisa === 'number' ? Math.abs(x.sisa) : Math.max(0, hariSelisih(x.exp))) + ' Hari');
        var ln = e.querySelector('div.flex.items-center.gap-2.text-body-sm') || up(s3, 1).nextElementSibling;
        if (ln) ln.innerHTML = '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">apartment</span>' + esc(x.unit || '-') + '</span><span>•</span><span class="' + (soon ? 'text-secondary' : 'text-error') + ' font-semibold">' + (soon ? 'Berakhir: ' : 'Expired: ') + esc(x.exp) + '</span><span>•</span><span class="text-on-surface-variant">Lulus terakhir: ' + esc(x.lulus) + '</span>';
        var bw = e.querySelector('.btn-wa'), be = e.querySelector('.btn-email'); gone(e.querySelector('.btn-register'));
        if (waNum(x.wa)) bw.onclick = function () { window.open(wa(x, soon), '_blank'); }; else { bw.disabled = true; bw.classList.add('opacity-50'); setTxt(bw.querySelector('span:last-child'), 'No. WA tidak valid'); }
        be.setAttribute('data-e', x.email || ''); be.onclick = function () { kirimEmail(be); };
        host.appendChild(e);
      });
      if (!n) host.innerHTML = '<p class="font-body-md text-on-surface-variant py-6 text-center">' + (c._rows.length ? 'Tidak ada hasil untuk filter ini.' : (c._soon ? 'Tidak ada yang berakhir dalam 30 hari.' : 'Tidak ada peserta yang kedaluwarsa.')) + '</p>';
    });
  }
  $('search-input').oninput = render; sel.onchange = render; render();
};

/* ===== UNIT KERJA (admin) ===== */
V.unit = async function () {
  var res = await apiMany([['unitAdmin', T], ['reportData', T]]), u = res[0], rp = res[1]; if (!u) return; unitData = u;
  var pu = {}; ((rp && rp.perUnit) || []).forEach(function (x) { pu[x.unit] = x; });
  var names = u.units.map(function (z) { return z.unit; });
  var m = MS(TPL.unit);
  m.firstElementChild.classList.add('px-6', 'lg:px-8');
  S(m, 'Standarisasi Departemen & Zonasi Proteksi', 'Master Unit Kerja'); S(m, 'Master 43 Unit Kerja Rumah Sakit', 'Master ' + u.units.length + ' Unit Kerja'); gone(up(find(m, 'SHLC-REG-V3.8'), 0));
  S(m, 'Katalog baku 43 unit kerja Siloam Hospitals Lippo Cikarang, klasifikasi zonasi bahaya kebakaran KARS, dan monitoring rasio kepatuhan sertifikasi evakuasi per ruangan.', u.aktif ? 'Peserta wajib memilih unit dari daftar ini saat mendaftar dan mengubah profil. Rasio sertifikasi dihitung dari jumlah karyawan yang Anda isi.' : 'Belum ada unit baku, jadi peserta masih mengisi unit secara bebas. Setelah unit pertama ditambahkan, isian bebas diganti pilihan dari daftar.');
  gone($('btn-sync'));
  btn(m, 'Unduh Struktur Unit (.csv)', function () {
    var csv = 'Unit;Pengguna;Karyawan\r\n' + u.units.map(function (z) { return [z.unit, z.dipakai, z.karyawan === '' ? '' : z.karyawan].map(function (v) { v = String(v == null ? '' : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';'); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'unit-kerja.csv'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  btn(m, 'Tambah Unit Baru', function () { var i = $('input-nama-unit'); i.scrollIntoView({ behavior: 'smooth', block: 'center' }); i.focus(); });
  /* statistik */
  var sg = m.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4').children, tot = 0, ak = 0, pakai = 0;
  u.units.forEach(function (z) { var p = pu[z.unit]; if (z.dipakai > 0) pakai++; if (p && z.karyawan) { tot += +z.karyawan; ak += +p.aktif; } });
  function stat(c, lab, val, sub) { var p = c.querySelectorAll('p'); setTxt(p[0], lab); setTxt(p[1], val); var sp = p[1].querySelector('span'); if (sp) { if (sub) sp.textContent = sub; else gone(sp); } }
  stat(sg[0], 'Total Unit Baku', u.units.length, 'Unit'); stat(sg[1], 'Unit Terpakai', pakai, 'Unit'); stat(sg[2], 'Rerata Sertifikasi Aktif', tot ? Math.round(ak / tot * 100) + '%' : '-', ''); stat(sg[3], 'Perlu Dipetakan', u.lain.length, 'Isian');
  /* form tambah */
  S(m, 'Pendaftaran ruang baru ke inventaris K3RS', 'Tambah atau perbarui unit baku'); var form = $('form-tambah-unit');
  gone(up($('select-zonasi'), 2)); gone(up($('input-lantai'), 1)); gone(up($('input-pic'), 2));
  var tl = findHas(m, 'Target Personel', 'label'); if (tl) tl.textContent = 'Jumlah Karyawan (opsional)'; var tg = $('input-target-staf'); tg.id = 'un-k'; tg.required = false; tg.type = 'text'; tg.removeAttribute('min'); tg.removeAttribute('max'); tg.className = tg.className + ' appearance-none'; tg.placeholder = 'Untuk persentase di Laporan'; tg.setAttribute('inputmode', 'numeric'); var gr = up(tg, 2); gr.className = 'flex flex-col gap-1.5';
  var nm = $('input-nama-unit'); nm.id = 'un-n'; nm.required = true; nm.placeholder = 'Contoh: Hemodialisa'; nm.maxLength = 80; var star = tg.parentElement.querySelector('.text-error') || up(tg, 1).querySelector('.text-error'); if (star) gone(star);
  S(m, '+ Simpan Unit Kerja', 'Simpan Unit Kerja'); form.onsubmit = function (e) { e.preventDefault(); unitSimpan(); };
  /* pemetaan isian lama */
  var ml = $('migration-list'), warn = ml.previousElementSibling, ok = $('all-mapped-notice'), tpl = ml.children[0].cloneNode(true); ml.innerHTML = '';
  S(m, 'Perhatian Migrasi SIMRS', 'Perlu Dipetakan'); S(m, 'Ditemukan data lama yang belum terikat master 43 unit standar K3RS. Segera lakukan penyesuaian pemetaan.', 'Isian unit lama yang belum ada di daftar baku. Pilih unit tujuan agar laporan per unit akurat.');
  if (!u.lain.length) { hid(warn); ok.classList.remove('hidden'); ok.classList.add('flex'); S(m, 'Sinkronisasi master data SIMRS & K3RS berada pada status konsisten 100%.', 'Semua pengguna sudah memakai unit dari daftar baku.'); }
  else if (!u.aktif) ml.innerHTML = '<p class="font-body-sm text-on-surface-variant">Tambahkan unit baku terlebih dahulu.</p>';
  else u.lain.forEach(function (z, i) {
    var n = tpl.cloneNode(true), sp = n.querySelectorAll('span'), se = n.querySelector('select'), bt = n.querySelector('button'); n.removeAttribute('id');
    setTxt(n.querySelector('.truncate'), z.nilai); setTxt(n.querySelector('.rounded-full.px-2'), z.jumlah + ' pengguna'); se.id = 'pm-' + i; se.innerHTML = names.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
    bt.onclick = function () { unitPetakan(i); }; ml.appendChild(n);
  });
  /* tabel */
  gone($('filter-tabs-container')); var pgf = findHas(m, 'Menampilkan', 'div.flex'); if (pgf) gone(pgf); var kb = findHas(m, 'Ambang Batas Kepatuhan Standar KARS MFK 7.2'); if (kb) gone(kb.closest('div.flex.items-center.justify-between') || up(kb, 3)); $('search-unit-input').placeholder = 'Cari unit kerja...'; gone($('clear-search-btn'));
  var tbl = $('table-units'); tbl.parentElement.classList.add('overflow-x-auto'); up(tbl, 3).classList.add('min-w-0'); var tb = $('unit-table-body'), rowT = tb.children[0].cloneNode(true), ths = m.querySelectorAll('#table-units th');
  gone(ths[1]); gone(ths[4]); setTxt(ths[0], 'Nama Unit'); setTxt(ths[2], 'Karyawan'); setTxt(ths[3], 'Tersertifikasi'); setTxt(ths[5], 'Status (≥ 80%)'); gone(rowT.children[1]); gone(rowT.children[3]); var wb = rowT.querySelector('.w-32'); if (wb) wb.className = wb.className.replace('w-32', 'w-24');
  function render() {
    var q = norm($('search-unit-input').value).toLowerCase(); tb.innerHTML = ''; var n = 0;
    u.units.forEach(function (z, ix) {
      if (q && z.unit.toLowerCase().indexOf(q) < 0) return; n++;
      var p = pu[z.unit] || { aktif: 0, soon: 0, expired: 0, akun: z.dipakai }, den = +z.karyawan > 0 ? +z.karyawan : (+p.akun || 0), pc = den ? Math.min(100, Math.round(p.aktif / den * 100)) : 0, r = rowT.cloneNode(true), td = r.children;
      r.removeAttribute('data-zone'); td[0].querySelector('.material-symbols-outlined').textContent = 'apartment'; setTxt(td[0].querySelector('span.font-bold'), z.unit); setTxt(td[0].querySelector('span.text-\\[12px\\]'), 'Dipakai ' + z.dipakai + ' pengguna');
      td[1].textContent = z.karyawan === '' ? '-' : z.karyawan;
      var sp = td[2].querySelectorAll('span'); sp[0].textContent = den ? pc + '%' : '-'; sp[1].textContent = den ? p.aktif + '/' + den : 'belum ada data'; td[2].querySelector('.h-full').style.width = pc + '%';
            var chip = td[3].querySelector('span'), ic = chip.querySelector('.material-symbols-outlined'); setTxt(chip, !den ? 'Belum ada data' : pc >= 80 ? 'Memenuhi' : '< 80%'); if (ic) ic.textContent = !den ? 'help' : pc >= 80 ? 'check_circle' : 'warning';
      var bs = td[4].querySelectorAll('button'); setTxt(bs[0], 'Ubah'); setTxt(bs[1], 'Hapus');
      bs[0].onclick = async function () { var nn = window.prompt('Nama baru untuk unit "' + z.unit + '"', z.unit); if (nn === null) return; var rr = await api('gantiNamaUnit', T, z.unit, nn); if (rr) { toast(rr); V.unit(); } };
      if (z.dipakai) { bs[1].disabled = true; bs[1].classList.add('opacity-40'); bs[1].title = 'Masih dipakai'; } else bs[1].onclick = function () {
        var b = bs[1]; if (!b.dataset.arm) { b.dataset.arm = '1'; b.textContent = 'Klik lagi untuk yakin'; setTimeout(function () { if (b.dataset.arm) { delete b.dataset.arm; b.textContent = 'Hapus'; } }, 4000); return; }
        api('hapusUnit', T, z.unit).then(function (rr) { if (rr) { toast(rr); V.unit(); } });
      };
      tb.appendChild(r);
    });
    if (!n) tb.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-on-surface-variant">' + (u.units.length ? 'Tidak ada hasil.' : 'Belum ada unit baku.') + '</td></tr>';
  }
  $('search-unit-input').oninput = render; render();
};

/* ===== LOG & CADANGAN (admin) ===== */
V.log = async function () {
  var res = await apiMany([['statusCadangan', T], ['riwayatLog', T, '']]), c = res[0] || {}, lg = res[1] || [];
  var m = MS(TPL.log); m.firstElementChild.classList.add('px-6', 'lg:px-8');
  gone(up(find(m, 'REAL-TIME TELEMETRY'), 0)); gone($('checksum-btn')); gone($('checksum-toast'));
  S(m, 'Log Audit Sistem & Integritas Basis Data', 'Log Audit & Cadangan Data'); S(m, 'Unduh Log Audit Lengkap (.csv)', 'Unduh Log Audit (Excel)');
  btn(m, 'Unduh Log Audit (Excel)', function () { dlB64('exportLog'); });
  var run = function (b) { return function () { cadangNow(b || this); }; };
  var bTop = find(m, 'Cadangkan Data Sekarang (+)', 'button'); if (bTop) { setTxt(find(bTop, 'Cadangkan Data Sekarang (+)'), 'Cadangkan Data Sekarang'); bTop.onclick = function () { cadangNow(bTop); }; }
  var bc = m.querySelector('.relative.overflow-hidden.rounded-2xl');
  S(bc, 'Status Cadangan Data Otomatis', 'Cadangan Data'); var chip = findHas(bc, 'Salinan Terjadwal'); if (chip) setTxt(chip, (c.simpan || 14) + ' Salinan Terjadwal');
  S(bc, 'Siklus backup atomik menggunakan Google Apps Script (GAS) Trigger terdistribusi ke Google Drive K3RS Archive.', 'Salinan seluruh data dibuat otomatis tiap malam (setelah pasangTrigger() dijalankan) dan disimpan di folder Drive "Cadangan SHLC".');
  var bs = find(bc, 'Cadangkan Data Sekarang (Snapshot Manual)', 'button'); if (bs) { bs.onclick = function () { cadangNow(bs); }; if (c.url) { var a = bs.cloneNode(true); a.onclick = function () { window.open(c.url, '_blank'); }; setTxt(find(a, 'Cadangkan Data Sekarang (Snapshot Manual)'), 'Buka Folder Drive'); a.className = a.className.replace(/bg-\S+/g, '') + ' bg-white/10 text-white'; bs.parentNode.insertBefore(a, bs.nextSibling); } }
  var grid = bc.querySelector('.grid'), bx = grid.children;
  var v0 = bx[0].querySelector('.font-headline-md'); v0.textContent = c.terakhir || 'Belum ada'; var s0 = bx[0].querySelector('span.mt-1'); if (s0) s0.innerHTML = '<span class="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span> Otomatis tiap malam';
  var v1 = bx[1].querySelector('.font-headline-md'); v1.textContent = (c.simpan || 14) + ' Salinan'; var l1 = findHas(bx[1], 'Hari Rolling'); if (l1) l1.textContent = 'tersimpan'; var s1 = bx[1].querySelector('span.mt-1'); if (s1) s1.innerHTML = 'Folder Drive "Cadangan SHLC"';
  gone(bx[2]); grid.className = grid.className.replace('md:grid-cols-3', 'md:grid-cols-2');
  var dbRow = findHas(bc, 'SS_SHLC_K3_PROD_2026', 'div.flex.flex-wrap.items-center.justify-between'); gone(dbRow);
  /* tabel log */
  var q = $('audit-search'); q.placeholder = 'Cari pelaku, aksi, atau target'; var dr = findHas(m, 'Rentang:', 'div.flex.items-center.gap-2'); gone(dr); gone($('role-filters') && up($('role-filters'), 2));
  var tb = $('audit-table-body'), tplR = tb.children[0].cloneNode(true), tbl = tb.parentElement, ths = tbl.querySelectorAll('th');
  setTxt(ths[ths.length - 1], ''); gone(ths[ths.length - 1]); setTxt(ths[1], 'Aktor'); setTxt(ths[5], 'Detail'); setTxt(ths[0], 'Waktu (WIB)');
  var fo = findHas(m, 'Menampilkan'); if (fo) { var ff = fo.closest('div.flex'); if (ff && !ff.contains(tbl)) gone(ff); }
  function draw(a) {
    tb.innerHTML = '';
    if (!a.length) { tb.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-on-surface-variant">Belum ada catatan.</td></tr>'; return; }
    a.forEach(function (l) {
      var r = tplR.cloneNode(true), td = r.children; gone(td[6]);
      td[0].querySelector('span:last-child').textContent = l.waktu || '';
      var s1 = td[1].querySelectorAll('span'); s1[0].textContent = l.aktor || '-'; gone(s1[1]);
      setTxt(td[2].querySelector('span'), l.peran || '-'); setTxt(td[3].querySelector('span'), String(l.aksi || '-').toUpperCase());
      var s4 = td[4].querySelectorAll('span'); s4[0].textContent = l.target || '-'; gone(s4[1]);
      var p = td[5].querySelector('p'); p.textContent = l.detail || ''; p.title = l.detail || ''; tb.appendChild(r);
    });
  }
  draw(lg); var t = null; q.oninput = function () { clearTimeout(t); t = setTimeout(async function () { var r = await api('riwayatLog', T, q.value); if (r) draw(r); }, 350); };
};

/* ===== KEAMANAN (admin) ===== */
function secFormHtml(c, lc, ic) {
  var ban = c.googleAktif ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950';
  return '<div class="p-3 rounded-xl font-body-sm text-body-sm ' + ban + '">' + (c.googleAktif ? 'Login Google aktif.' : 'Login Google belum aktif. Isi Client ID lalu simpan.') + '</div>' +
    '<label class="' + lc + '">Google OAuth Client ID (tipe Web application)</label><input id="g-cid" class="' + ic + '" placeholder="1234567890-abc.apps.googleusercontent.com" value="' + esc(c.googleClientId) + '">' +
    '<label class="' + lc + '">Batasi domain email Google (opsional)</label><input id="g-dom" class="' + ic + '" placeholder="siloamhospitals.com" value="' + esc(c.domain) + '">' +
    '<label class="' + lc + '">Alamat frontend (GitHub Pages), dipakai pada QR dan tautan email</label><input id="g-fe" class="' + ic + '" placeholder="https://akun.github.io/nama-repo" value="' + esc(c.frontendUrl) + '">' +
    '<div class="flex gap-3 flex-wrap pt-1"><button type="button" id="g-save" class="px-6 py-2.5 rounded-lg bg-secondary text-white font-label-md text-label-md">Simpan Login Google</button><button type="button" id="g-reload" class="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md">Muat Ulang</button></div>' +
    '<hr class="border-surface-container my-1"><h3 class="font-title-md text-title-md text-on-surface">Wajibkan Google untuk Trainer dan Admin</h3><p class="font-body-sm text-body-sm text-on-surface-variant">Bila aktif, akun trainer dan admin tidak bisa masuk dengan sandi (kecuali akses darurat). Pastikan semua staf di bawah sudah dapat masuk dengan Google.</p>' +
    '<label class="flex items-center gap-2 font-body-md"><input type="checkbox" id="g-wajib" ' + (c.wajibStaf ? 'checked' : '') + '> Wajibkan login Google untuk trainer dan admin</label>' +
    '<label class="flex items-center gap-2 font-body-md"><input type="checkbox" id="g-konf"> Saya sudah memastikan semua trainer dan admin dapat masuk dengan Google</label>' +
    '<div><button type="button" id="g-pol" class="px-6 py-2.5 rounded-lg bg-on-surface text-white font-label-md text-label-md">Simpan Kebijakan</button></div>' +
    '<p class="font-body-sm text-body-sm text-on-surface-variant">Darurat bila terkunci: jalankan <b>matikanGoogleWajib()</b> dari editor Apps Script.</p>';
}

V.sec = async function () {
  var c = await api('keamananConfig', T); if (!c) return;
  var m = MS(TPL.sec); m.firstElementChild.classList.add('px-6', 'lg:px-8');
  S(m, 'SINKRONISASI KREDENSIAL REAL-TIME (SEC-SYNC-04)', c.googleAktif ? 'LOGIN GOOGLE AKTIF' : 'LOGIN GOOGLE BELUM AKTIF'); var iso = findHas(m, 'ISO 27001 & UU PDP TERVALIDASI'); if (iso) gone(iso.parentElement && plain(iso.parentElement).length < 60 ? iso.parentElement : iso);
  S(m, 'Keamanan Sistem & Tata Kelola Sesi K3', 'Keamanan & Akses Login'); S(m, 'Otoritas pembatasan hak akses berbasis peran (RBAC), siklus otentikasi token Apps Script, dan perlindungan identitas rekam medik/pelatihan nakes RS Siloam Lippo Cikarang.', 'Pengaturan login Google (OAuth) dan kebijakan akses untuk trainer dan admin. Rahasia sistem (sandi, secret sesi) disimpan di Script Properties dan tidak tampil di sini.');
  ['Audit Akses Komprehensif (.csv)', 'Terapkan Enkripsi Ulang', '+ Buat Aturan Keamanan Baru'].forEach(function (t) { var b = find(m, t, 'button'); if (b) gone(b); });
  gone(findHas(m, 'Status Sesi Aktif', 'div.grid'));
  var form = m.querySelector('form'), card = form.closest('.rounded-2xl') || up(form, 2), lab = form.querySelector('label'), inp = form.querySelector('input[placeholder], input:not(.sr-only)');
  var lc = lab ? lab.className : 'font-label-md text-label-md text-on-surface', ic = inp ? inp.className : 'w-full h-11 px-3 rounded-lg border';
  var gcol = card, grd = card.parentElement; while (grd && !/(^|\s)grid(\s|$)/.test(grd.className)) { gcol = grd; grd = grd.parentElement; }
  if (grd) { [].slice.call(grd.children).forEach(function (ch) { if (ch !== gcol) gone(ch); }); grd.className = 'flex flex-col gap-6'; gcol.className = 'flex flex-col gap-6 min-w-0'; }
  var ban = c.googleAktif ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950';
  S(card, 'Konfigurasi Kebijakan Sesi & Pembatasan Akses', 'Login Google dan Kebijakan Akses'); S(card, 'Aturan otentikasi sentral untuk aparatus keselamatan kerja, tim brigade kebakaran, dan staf keperawatan.', 'Peserta, trainer, dan admin masuk dengan akun Google yang emailnya terdaftar.'); var kb = findHas(card, 'Kebijakan Aktif'); if (kb) gone(kb.closest('div.flex.items-center') || kb);
  form.className = 'flex flex-col gap-4'; form.onsubmit = function (e) { e.preventDefault(); };
  form.innerHTML = secFormHtml(c, lc, ic);
  $('g-save').onclick = secSave; $('g-pol').onclick = secWajib; $('g-reload').onclick = function () { V.sec(); };
  /* sesi -> akun staf */
  var tbl = m.querySelector('table'), sc = tbl.closest('.rounded-2xl') || up(tbl, 3);
  S(sc, 'Daftar Sesi Berjalan & Deteksi Anomali', 'Akun Trainer dan Admin'); S(sc, 'Pemantauan real-time otentikasi aktif dan pencegahan penyalahgunaan akun staf klinis.', 'Akun yang punya akses pengelolaan. Email harus sama dengan akun Google yang dipakai masuk.'); var ch = findHas(sc, 'SESI TERMONITOR'); if (ch) setTxt(ch, c.staf.length + ' AKUN');
  var tr = tbl.querySelectorAll('thead th'); ['Nama', 'Peran', 'Username', 'Email'].forEach(function (t, i) { if (tr[i]) setTxt(tr[i], t); }); for (var k = 4; k < tr.length; k++) gone(tr[k]);
  var pf = findHas(sc, 'Menampilkan'); if (pf) { var pg2 = pf.closest('div.flex'); if (pg2 && !pg2.contains(tbl)) gone(pg2); }
  var tb = tbl.querySelector('tbody'); tb.innerHTML = c.staf.map(function (s) { return '<tr><td class="px-4 py-3 font-bold">' + esc(s.nama) + '</td><td class="px-4 py-3">' + esc(s.role) + '</td><td class="px-4 py-3 font-mono text-[13px]">' + esc(s.username) + '</td><td class="px-4 py-3">' + esc(s.email) + '</td></tr>'; }).join('') || '<tr><td colspan="4" class="py-6 text-center text-on-surface-variant">Belum ada akun.</td></tr>';
};

/* ===== helper kartu untuk layar bentuk formulir ===== */
var FC = { card: 'bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-4', lab: 'font-label-md text-label-md text-on-surface', inp: 'w-full min-h-[44px] px-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md', pri: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-white font-label-md text-label-md', sec: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md', dgr: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md' };
function fcard(parent, id, title, sub, html) { var d = document.createElement('div'); d.className = FC.card; if (id) d.id = id; d.innerHTML = '<div><h2 class="font-headline-sm text-headline-sm text-on-surface">' + esc(title) + '</h2>' + (sub ? '<p class="font-body-sm text-body-sm text-on-surface-variant">' + esc(sub) + '</p>' : '') + '</div>' + html; parent.appendChild(d); return d; }
function fchk(id, label, on) { return '<label class="flex items-center gap-2 font-body-md text-on-surface"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '> ' + esc(label) + '</label>'; }
function statCard(el, label, value, sub) { el.innerHTML = '<div class="flex flex-col gap-1"><span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">' + esc(label) + '</span><span class="font-numeric-stat text-numeric-stat text-on-surface">' + esc(String(value)) + '</span><span class="font-body-sm text-body-sm text-on-surface-variant">' + esc(sub || '') + '</span></div>'; }
function kosongkanSetelah(root, n) { while (root.children.length > n) root.removeChild(root.lastChild); }

/* ===== NOTIFIKASI (admin) ===== */
function notifCards(root, c, bl, un) {
  var optS = [10, 20, 50].map(function (x) { return '<option' + (x === c.batch ? ' selected' : '') + '>' + x + '</option>'; }).join('');
  fcard(root, 'n-cfg', 'WhatsApp (Fonnte) dan Email', 'Token tidak pernah dikirim ke browser. Kosongkan kolom token bila tidak ingin mengubahnya.',
    fchk('n-wa', 'Aktifkan notifikasi WhatsApp', c.waAktif) + '<label class="' + FC.lab + '">Token Fonnte' + (c.adaToken ? ' (tersimpan: ' + esc(c.tokenMask) + ')' : ' (belum diisi)') + '</label><input id="n-tok" type="password" autocomplete="off" class="' + FC.inp + '" placeholder="Tempel token dari fonnte.com">' +
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Ukuran batch</label><select id="n-batch" class="' + FC.inp + '">' + optS + '</select></div><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Jeda antarpesan (detik, mis. 5 atau 3-8)</label><input id="n-jeda" class="' + FC.inp + '" value="' + esc(c.jeda) + '"></div></div>' + fchk('n-em', 'Aktifkan notifikasi email', c.emailAktif));
  var mx = c.matriks.map(function (x) { return '<div class="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3"><b class="font-title-md text-on-surface">' + esc(x.label) + '</b><div class="flex gap-5 flex-wrap">' + fchk('mx-wa-' + x.kode, 'WhatsApp', x.wa) + fchk('mx-em-' + x.kode, 'Email', x.email) + '</div><label class="' + FC.lab + '">Pesan WhatsApp (gunakan {nama} dan {subjek})</label><textarea id="mx-ps-' + x.kode + '" rows="3" class="' + FC.inp + '">' + esc(x.pesan) + '</textarea></div>'; }).join('');
  fcard(root, 'n-mx', 'Kejadian dan Pesan', 'Pilih saluran dan isi pesan untuk tiap kejadian.', mx + '<div><button type="button" id="n-save" class="' + FC.pri + '">Simpan Pengaturan</button></div>');
  fcard(root, 'n-ujic', 'Uji Sambungan', 'Kirim satu pesan uji untuk memastikan token dan nomor benar.', '<label class="' + FC.lab + '">Nomor WhatsApp</label><input id="n-uji" class="' + FC.inp + '" placeholder="+6281234567890" inputmode="tel"><div><button type="button" id="n-test" class="' + FC.sec + '">Kirim Pesan Uji</button></div>');
  var rows = bl.map(function (b) {
    var pct = b.total ? Math.round((b.terkirim + b.gagal) / b.total * 100) : 0;
    return '<div class="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2"><div class="flex items-center justify-between gap-2 flex-wrap"><b class="font-title-md text-on-surface">' + esc(b.judul) + '</b><span class="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm uppercase">' + esc(b.status) + '</span></div><div class="font-body-sm text-on-surface-variant">' + esc(b.tanggal) + ' - ' + b.terkirim + ' terkirim, ' + b.gagal + ' gagal dari ' + b.total + '</div><div class="h-2 rounded-full bg-surface-container overflow-hidden"><div class="h-full bg-secondary" style="width:' + pct + '%"></div></div>' +
      (b.status === 'berjalan' ? '<div class="flex gap-2 flex-wrap pt-1"><button type="button" class="' + FC.sec + '" onclick="blastNext(\'' + b.bid + '\')">Kirim batch berikutnya</button><button type="button" class="' + FC.dgr + '" onclick="blastStop(\'' + b.bid + '\')">Hentikan</button></div>' : '') + '</div>';
  }).join('') || '<p class="font-body-md text-on-surface-variant">Belum ada blast.</p>';
  fcard(root, 'n-bl', 'Blast WhatsApp', 'Pesan massal ke kelompok peserta. Dikirim per batch sesuai pengaturan.',
    '<label class="' + FC.lab + '">Judul (internal)</label><input id="b-judul" class="' + FC.inp + '"><label class="' + FC.lab + '">Pesan (gunakan {nama} dan {unit})</label><textarea id="b-pesan" rows="4" class="' + FC.inp + '" placeholder="Halo {nama}, ..."></textarea>' +
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Sasaran</label><select id="b-sas" class="' + FC.inp + '"><option value="semua">Semua peserta</option><option value="aktif">Sertifikasi aktif</option><option value="soon">Segera berakhir</option><option value="expired">Kedaluwarsa</option><option value="belum">Belum bersertifikat</option><option value="jadwal">Terdaftar di jadwal aktif</option></select></div>' +
    '<div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Unit (opsional)</label><select id="b-unit" class="' + FC.inp + '"><option value="">Semua unit</option>' + un.map(function (u) { return '<option>' + esc(u) + '</option>'; }).join('') + '</select></div></div>' +
    '<div><button type="button" id="b-new" class="' + FC.pri + '">Buat Blast</button></div><h3 class="font-title-md text-on-surface pt-2">Riwayat Blast</h3>' + rows);
  $('n-save').onclick = notifSave; $('n-test').onclick = notifTest; $('b-new').onclick = blastNew;
  $('n-uji').onblur = function () { this.value = normWa(this.value); };
}
V.notif = async function () {
  var res = await apiMany([['notifConfig', T], ['blastList', T], ['daftarUnit']]), c = res[0], bl = res[1] || [], un = res[2] || []; if (!c) return;
  var m = MS(TPL.notif), root = m.firstElementChild; root.classList.add('px-6', 'lg:px-8');
  S(root, 'MANAJEMEN NOTIFIKASI & ANTREAN PESAN', 'NOTIFIKASI'); S(root, 'Pusat Notifikasi & Antrean Pesan K3', 'Pusat Notifikasi');
  var chip = findHas(root, 'GATEWAY WHATSAPP & WORKSPACE SMTP AKTIF'); if (chip) setTxt(chip, (c.waAktif ? 'WhatsApp aktif' : 'WhatsApp nonaktif') + ' - ' + (c.emailAktif ? 'Email aktif' : 'Email nonaktif'));
  S(root, 'Monitoring otomatisasi blast pengingat masa berlaku sertifikat (H-30, H-7, H+1), antrean pesan darurat Code Red, kuota MailApp harian, dan template pesan dinas resmi Siloam Lippo Cikarang.', 'Atur pengiriman WhatsApp (Fonnte) dan email, isi pesan untuk tiap kejadian, dan kirim blast ke kelompok peserta.');
  var b1 = find(root, 'Proses Antrean Sekarang', 'button'), b2 = find(root, 'Uji Gateway WhatsApp', 'button'), b3 = find(root, '+ Susun Pesan / Blast Baru', 'button');
  b1.onclick = async function () { var r = await api('prosesAntreanManual', T); if (r) { toast(typeof r === 'string' ? r : 'Antrean diproses.'); V.notif(); } };
  b2.onclick = function () { $('n-uji').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('n-uji').focus(); };
  setTxt(find(b3, '+ Susun Pesan / Blast Baru'), 'Susun Blast Baru'); b3.onclick = function () { $('b-judul').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('b-judul').focus(); };
  var sg = root.children[1].children;
  statCard(sg[0], 'Antrean WhatsApp', c.antrean.menunggu + ' menunggu', c.antrean.terkirim + ' terkirim, ' + c.antrean.gagal + ' gagal');
  statCard(sg[1], 'Kuota Email Hari Ini', c.sisaEmail + ' sisa', c.emailAktif ? 'Email aktif' : 'Email nonaktif');
  statCard(sg[2], 'WhatsApp', c.waAktif ? 'Aktif' : 'Nonaktif', c.adaToken ? 'Token tersimpan (' + c.tokenMask + ')' : 'Token belum diisi');
  statCard(sg[3], 'Pengiriman', 'Batch ' + c.batch, 'Jeda ' + c.jeda + ' detik');
  kosongkanSetelah(root, 2);
  notifCards(root, c, bl, un);
};

/* ===== KONTAK / CRM (admin) ===== */
function crmCards(root, c) {
  fcard(root, 'k-card', 'Daftar Kontak', '', '<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><input id="k-q" class="' + FC.inp + '" placeholder="Cari nama, email, WA, unit"><select id="k-seg" class="' + FC.inp + '"><option value="">Semua segmen</option><option>Peserta</option><option>Staf</option><option>Lainnya</option></select></div><div id="k-list" class="flex flex-col gap-3"></div>');
  fcard(root, 'k-add', 'Tambah Kontak Manual', 'Untuk penerima di luar akun peserta dan staf.',
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Nama</label><input id="k-nama" class="' + FC.inp + '"></div><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Email</label><input id="k-email" type="email" class="' + FC.inp + '"></div><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">WhatsApp</label><input id="k-wa" class="' + FC.inp + '" placeholder="+62..." inputmode="tel"></div><div class="flex flex-col gap-1.5"><label class="' + FC.lab + '">Tag</label><input id="k-tag" class="' + FC.inp + '"></div></div><div><button type="button" id="k-save" class="' + FC.pri + '">Simpan Kontak</button></div>');
  $('k-sync').onclick = crmSync; $('k-det').onclick = crmDetect; $('k-xls').onclick = function () { dlB64('crmExport'); }; $('k-save').onclick = crmAdd; $('k-wa').onblur = function () { this.value = normWa(this.value); };
  $('k-q').oninput = crmFind; $('k-seg').onchange = crmFind;
  window.crmRender = function (a) {
    $('k-list').innerHTML = a.length ? a.map(function (k) {
      return '<div class="p-4 rounded-xl bg-surface-container-low flex items-center gap-4 flex-wrap"><div class="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold shrink-0">' + esc(ini(k.nama)) + '</div><div class="flex-1 min-w-[200px]"><div class="flex items-center gap-2 flex-wrap"><b class="font-title-md text-on-surface">' + esc(k.nama) + '</b><span class="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm">' + esc(k.segmen) + '</span>' + (k.statusWa ? '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm ' + (k.statusWa === 'Terdaftar' ? 'bg-emerald-100 text-emerald-900' : 'bg-error-container text-on-error-container') + '">WA ' + esc(k.statusWa) + '</span>' : '') + '</div><div class="font-body-sm text-on-surface-variant">' + esc(k.wa || '-') + ' - ' + esc(k.email || '-') + (k.unit ? ' - ' + esc(k.unit) : '') + '</div></div>' +
        '<button type="button" class="' + (k.optOut ? FC.sec : FC.dgr) + '" onclick="crmOpt(\'' + k.kid + '\',' + (!k.optOut) + ')">' + (k.optOut ? 'Aktifkan lagi blast' : 'Opt-out blast') + '</button></div>';
    }).join('') : '<p class="font-body-md text-on-surface-variant">Tidak ada kontak. Tekan "Sinkron dari Akun".</p>';
  };
  crmRender(c.items);
}
V.crm = async function () {
  var c = await api('crmList', T, '', ''); if (!c) return;
  var m = MS(TPL.crm), root = m.firstElementChild; root.classList.add('px-6', 'lg:px-8');
  S(root, 'K3RS EMERGENCY & DIRECTORY', 'K3RS DIRECTORY'); S(root, 'KONTAK SIAGA DARURAT', 'KONTAK');
  S(root, 'Direktori Tanggap Darurat & Kontak Siaga K3RS', 'Kontak'); gone(findHas(root, 'SISTEM SIAGA AKTIF 24/7', 'span.bg-secondary'));
  var dp = root.querySelector('p.font-body-md'); if (dp) dp.textContent = 'Daftar kontak untuk blast WhatsApp dan email: peserta, staf, dan kontak manual. Kontak yang opt-out tidak menerima blast.';
  var bar = root.children[0].lastElementChild; bar.innerHTML = '<button type="button" id="k-sync" class="' + FC.sec + '">Sinkron dari Akun</button><button type="button" id="k-det" class="' + FC.sec + '">Deteksi Nomor WA</button><button type="button" id="k-xls" class="' + FC.pri + '">Unduh Excel</button>';
  var sg = root.children[1].children;
  statCard(sg[0], 'Total Kontak', c.total, 'Peserta, staf, dan manual'); statCard(sg[1], 'WhatsApp Terdaftar', c.terdaftarWa, 'Hasil deteksi nomor'); statCard(sg[2], 'Opt-out', c.optOut, 'Tidak menerima blast'); gone(sg[3]); root.children[1].className = root.children[1].className.replace('xl:grid-cols-4', 'xl:grid-cols-3');
  kosongkanSetelah(root, 2);
  crmCards(root, c);
};

/* ===== MIGRASI (admin) ===== */
function migCards(root, i, nm) {
  fcard(root, 'm-a', 'Impor dari Aplikasi Lama', 'Spreadsheet lama hanya dibaca, tidak diubah.',
    i.catatan.map(function (c) { return '<p class="font-body-sm text-body-sm text-on-surface-variant">- ' + esc(c) + '</p>'; }).join('') +
    '<label class="' + FC.lab + '">URL atau ID spreadsheet lama</label><input id="m-src" class="' + FC.inp + '" placeholder="https://docs.google.com/spreadsheets/d/...">' +
    '<div class="flex gap-3 flex-wrap">' + i.sheets.map(function (s) { return '<label class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low font-body-md"><input type="checkbox" class="m-sh" value="' + s + '"' + (s === 'scores' || s === 'evaluations' ? '' : ' checked') + '> ' + esc(nm[s] || s) + '</label>'; }).join('') + '</div>' +
    fchk('m-timpa', 'Timpa jadwal dan soal yang sudah ada (jangan dicentang bila ragu)', false) + fchk('m-adm', 'Sertakan akun admin lama', false) +
    '<div class="flex gap-3 flex-wrap"><button type="button" id="m-scan" class="' + FC.sec + '">Pindai (tanpa menulis)</button><button type="button" id="m-run" class="' + FC.pri + '">Jalankan Impor</button></div><div id="m-out"></div>');
  fcard(root, 'm-b', 'Impor Karyawan dari CSV', 'Kolom: ' + i.csvKolom + '. Pemisah koma atau titik koma. Email wajib akun Google (Gmail) karena login memakai Google.',
    '<input type="file" id="m-csvf" accept=".csv,text/csv" class="' + FC.inp + ' py-2"><textarea id="m-csv" rows="6" class="' + FC.inp + '" placeholder="nama;nik;tgl_lahir;unit;wa;email"></textarea>' +
    '<div class="flex gap-3 flex-wrap"><button type="button" id="m-cscan" class="' + FC.sec + '">Pindai CSV</button><button type="button" id="m-cimp" class="' + FC.pri + '">Impor CSV</button></div><div id="m-cout"></div>');
  $('m-scan').onclick = function () { migRun(true); }; $('m-run').onclick = function () { migRun(false); }; $('m-cscan').onclick = function () { migCsv(true); }; $('m-cimp').onclick = function () { migCsv(false); }; $('m-csvf').onchange = function () { migFile(this); };
}
V.mig = async function () {
  var i = await api('importInfo', T); if (!i) return;
  var nm = { units: 'Unit kerja', users: 'Akun pengguna', schedules: 'Jadwal', registrations: 'Registrasi', scores: 'Nilai', certificates: 'Sertifikat', questions: 'Bank soal', evaluations: 'Evaluasi' };
  var m = MS(TPL.mig), root = m.firstElementChild; root.classList.add('px-6', 'lg:px-8');
  S(root, 'MIGRASI DATA & SINKRONISASI BASIS DATA', 'MIGRASI DATA'); S(root, 'Migrasi Data Karyawan & Sinkronisasi SIMRS', 'Migrasi Data'); gone(findHas(root, 'GOOGLE SHEETS ARCHITECTURE', 'span.inline-flex'));
  var bar = root.children[0].lastElementChild; bar.innerHTML = '<button type="button" id="m-tpl" class="' + FC.sec + '">Unduh Templat CSV</button>';
  $('m-tpl').onclick = function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + String(i.csvKolom).replace(/,\s*/g, ';') + '\r\n'], { type: 'text/csv' })); a.download = 'templat-karyawan.csv'; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); };
  kosongkanSetelah(root, 1);
  migCards(root, i, nm);
};
