// hud.js — the heads-up display and the screens: timer, score, combo, coins,
// stars, day and target, title, how-to, day-complete, and game-over screens.
// Fresh from the spec.
'use strict';

function drawHUD(ctx) {
  // Top bar.
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(0, 0, 1280, 64);
  // Score + combo, top left.
  text(ctx, 'SKOR ' + G.score, 24, 22, 24, '#ffe9c4');
  if (G.combo >= 1) {
    text(ctx, 'KOMBO x' + comboMultiplier().toFixed(1) + '  (' + G.combo + ' beruntun)', 24, 48, 15, '#ffd94a');
  } else {
    text(ctx, 'KOMBO x1.0', 24, 48, 15, '#cbb98d');
  }
  // Big day timer, top centre, with a progress ring.
  const t = Math.max(0, Math.ceil(G.timeLeft));
  const mm = Math.floor(t / 60);
  const ss = String(t % 60).padStart(2, '0');
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(640, 32, 34, -Math.PI / 2, -Math.PI / 2 + (G.timeLeft / 120) * Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = t <= 10 && Math.floor(G.time * 2) % 2 === 0 ? '#ff6b4a' : '#ffffff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mm + ':' + ss, 640, 34);
  // Day + target sit right of the timer so the ring never crosses the text.
  text(ctx, 'Hari ' + G.day + ' — sajikan ' + G.servedToday + ' dari ' + G.target, 700, 34, 17, '#ffe9c4');
  // Coins + reputation stars, top right.
  text(ctx, '🪙 ' + G.coins + ' koin', 1256, 22, 22, '#ffd94a', 'right');
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < Math.floor(G.rep) ? '★' : (i < G.rep ? '⯨' : '☆');
  text(ctx, stars, 1256, 48, 20, '#ffd94a', 'right');
}

function drawTitle(ctx) {
  // Painted warung scene: dusk sky, warung, wok, flame, hanging lamp.
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, '#3a1f3d');
  sky.addColorStop(0.55, '#c96f3f');
  sky.addColorStop(1, '#7a4a26');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.arc(1080, 130, 46, 0, Math.PI * 2); ctx.fill();
  // Warung roof + counter.
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath(); ctx.moveTo(240, 260); ctx.lineTo(1040, 260); ctx.lineTo(980, 340); ctx.lineTo(300, 340); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(280, 340, 720, 200);
  ctx.fillStyle = '#8a5a28';
  ctx.fillRect(280, 340, 720, 26);
  // Wok + flame on the counter.
  drawFlame(ctx, 560, 420, 160, G.time);
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath(); ctx.ellipse(640, 400, 110, 30, 0, 0, Math.PI * 2); ctx.fill();
  drawSteam(ctx, 640, 380, G.time, 4);
  // Hanging lamps.
  for (const lx of [420, 640, 860]) {
    ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 260); ctx.lineTo(lx, 300); ctx.stroke();
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath(); ctx.arc(lx, 314, 14, 0, Math.PI * 2); ctx.fill();
  }
  // Title.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  rr(ctx, 290, 96, 700, 130, 16); ctx.fill();
  text(ctx, 'KUALI EMAS', 640, 148, 72, '#ffd94a', 'center');
  text(ctx, 'Masak. Sajikan. Jangan sampai gosong.', 640, 200, 22, '#ffe9c4', 'center');
  // Buttons.
  drawButton(ctx, titleButtons().play, 'MAIN');
  drawButton(ctx, titleButtons().howto, 'CARA MEMASAK');
  drawButton(ctx, titleButtons().sound, AudioSys.muted ? 'SUARA: MATI' : 'SUARA: NYALA');
  text(ctx, 'Warung kecil di waktu senja — lima hari menuju Kuali Emas.', 640, 700, 14, '#ffe9c4', 'center');
}

function drawButton(ctx, r, label) {
  ctx.fillStyle = '#d98a2b';
  rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 3;
  rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.stroke();
  text(ctx, label, r.x + r.w / 2, r.y + r.h / 2 + 1, 24, '#fff6dd', 'center');
}

function titleButtons() {
  return {
    play: { x: 490, y: 470, w: 300, h: 56 },
    howto: { x: 490, y: 540, w: 300, h: 56 },
    sound: { x: 490, y: 610, w: 300, h: 48 },
  };
}

function drawHowto(ctx) {
  ctx.fillStyle = 'rgba(20,10,4,0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#fbf7ec';
  rr(ctx, 190, 60, 900, 600, 16); ctx.fill();
  text(ctx, 'CARA MEMASAK', 640, 100, 36, '#2b1a0e', 'center');
  const lines = [
    '1. AMBIL bahan dari meja bawah (klik, atau tombol 1–5).',
    '2. CINCANG di talenan — klik dua kali sampai terpotong.',
    '3. MASAK di wajan — masukkan bahan sesuai tiket, tunggu matang.',
    '4. HIASI di piring — taruh pelengkap sesuai resep.',
    '5. SAJIKAN di jendela saji (klik jendela, atau Spasi).',
    '',
    'Awas: makanan gosong kalau kelamaan di wajan — buang ke sampah.',
    'Pesanan yang kesabarannya habis akan pergi dan reputasi turun.',
  ];
  lines.forEach((l, i) => text(ctx, l, 230, 150 + i * 30, 18, '#2b1a0e'));
  text(ctx, 'RESEP', 230, 430, 22, '#2b1a0e');
  RECIPE_LIST.forEach((r, i) => {
    const locked = r.unlockDay > G.day;
    const y = 462 + i * 44;
    ctx.fillStyle = locked ? '#cbb98d' : r.color;
    ctx.beginPath(); ctx.arc(246, y, 12, 0, Math.PI * 2); ctx.fill();
    text(ctx, r.name + ' — ' + r.base + ' poin' + (locked ? '  (buka Hari ' + r.unlockDay + ')' : ''), 268, y, 17, locked ? '#8a7a5a' : '#2b1a0e');
    text(ctx, r.steps.map((s) => s.label).join(' → '), 268, y + 20, 13, locked ? '#a89878' : '#6b4a22');
  });
  text(ctx, 'Tombol: 1–5 ambil bahan • Spasi sajikan • Esc jeda / bantuan', 640, 630, 15, '#6b4a22', 'center');
  drawButton(ctx, { x: 540, y: 580, w: 200, h: 44 }, 'TUTUP');
}

function drawPause(ctx) {
  ctx.fillStyle = 'rgba(20,10,4,0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  text(ctx, 'JEDA', 640, 260, 56, '#ffd94a', 'center');
  drawButton(ctx, { x: 490, y: 330, w: 300, h: 56 }, 'LANJUT');
  drawButton(ctx, { x: 490, y: 400, w: 300, h: 56 }, 'CARA MEMASAK');
  drawButton(ctx, { x: 490, y: 470, w: 300, h: 48 }, AudioSys.muted ? 'SUARA: MATI' : 'SUARA: NYALA');
}

function drawDayComplete(ctx) {
  ctx.fillStyle = 'rgba(20,10,4,0.75)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#fbf7ec';
  rr(ctx, 340, 150, 600, 400, 16); ctx.fill();
  text(ctx, 'HARI ' + G.day + ' SELESAI!', 640, 210, 40, '#2e7d32', 'center');
  text(ctx, 'Pesanan disajikan: ' + G.servedToday + ' dari ' + G.target, 640, 290, 22, '#2b1a0e', 'center');
  text(ctx, 'Koin hari ini: ' + G.dayCoins, 640, 330, 22, '#2b1a0e', 'center');
  text(ctx, 'Kombo terbaik: x' + Math.min(3, 1 + 0.5 * G.bestCombo).toFixed(1) + ' (' + G.bestCombo + ' beruntun)', 640, 370, 22, '#2b1a0e', 'center');
  text(ctx, 'Reputasi: ' + G.rep.toFixed(1) + ' dari 5 bintang', 640, 410, 22, '#2b1a0e', 'center');
  text(ctx, 'Skor total: ' + G.score, 640, 450, 22, '#2b1a0e', 'center');
  drawButton(ctx, { x: 490, y: 480, w: 300, h: 56 }, 'HARI BERIKUTNYA');
}

function drawGameOver(ctx) {
  ctx.fillStyle = 'rgba(20,10,4,0.78)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = '#fbf7ec';
  rr(ctx, 290, 140, 700, 420, 16); ctx.fill();
  if (G.overReason === 'win') {
    text(ctx, 'KUALI EMAS!', 640, 210, 48, '#d98a2b', 'center');
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath(); ctx.ellipse(640, 300, 90, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b26e00';
    text(ctx, '★', 640, 300, 40, '#b26e00', 'center');
    text(ctx, 'You earned the Golden Wok!', 640, 350, 22, '#2b1a0e', 'center');
    text(ctx, 'Skor total: ' + G.score + '   •   Koin: ' + G.coins, 640, 395, 22, '#2b1a0e', 'center');
    text(ctx, 'Warungmu kini legendaris di seluruh kampung.', 640, 430, 18, '#6b4a22', 'center');
    drawButton(ctx, { x: 490, y: 470, w: 300, h: 56 }, 'MAIN LAGI');
  } else {
    const reason = G.overReason === 'rep' ? 'Reputasi warung habis (0 bintang).'
      : G.overReason === 'expired' ? 'Tiga pesanan kedaluwarsa dalam satu hari.'
      : 'Target hari ini tidak tercapai.';
    text(ctx, 'WARUNG TUTUP', 640, 210, 44, '#a31212', 'center');
    text(ctx, reason, 640, 280, 22, '#2b1a0e', 'center');
    text(ctx, 'Mencapai Hari ' + G.day + '  •  Skor: ' + G.score + '  •  Koin: ' + G.coins, 640, 330, 20, '#2b1a0e', 'center');
    text(ctx, 'Coba lagi — pelanggan masih menunggu.', 640, 370, 18, '#6b4a22', 'center');
    drawButton(ctx, { x: 420, y: 430, w: 200, h: 56 }, 'ULANG HARI');
    drawButton(ctx, { x: 660, y: 430, w: 200, h: 56 }, 'MAIN LAGI');
  }
}

// Buttons per screen, for input.js: {id, rect}.
function screenButtons() {
  if (G.showHowto) return [{ id: 'closeHowto', rect: { x: 540, y: 580, w: 200, h: 44 } }];
  if (G.screen === 'title') {
    const b = titleButtons();
    return [
      { id: 'play', rect: b.play },
      { id: 'howto', rect: b.howto },
      { id: 'sound', rect: b.sound },
    ];
  }
  if (G.screen === 'play' && G.paused) {
    return [
      { id: 'resume', rect: { x: 490, y: 330, w: 300, h: 56 } },
      { id: 'howto', rect: { x: 490, y: 400, w: 300, h: 56 } },
      { id: 'sound', rect: { x: 490, y: 470, w: 300, h: 48 } },
    ];
  }
  if (G.screen === 'daycomplete') return [{ id: 'nextDay', rect: { x: 490, y: 480, w: 300, h: 56 } }];
  if (G.screen === 'gameover') {
    if (G.overReason === 'win') return [{ id: 'again', rect: { x: 490, y: 470, w: 300, h: 56 } }];
    return [
      { id: 'retry', rect: { x: 420, y: 430, w: 200, h: 56 } },
      { id: 'again', rect: { x: 660, y: 430, w: 200, h: 56 } },
    ];
  }
  return [];
}
