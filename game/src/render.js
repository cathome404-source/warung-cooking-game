// render.js — all drawing: kitchen, stations, ingredients, dishes in every state,
// steam, flame, and the ticket art. Fresh from the spec.
'use strict';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align, weight) {
  ctx.fillStyle = color || '#2b1a0e';
  ctx.font = (weight || 'bold') + ' ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function drawIngredient(ctx, x, y, r, id, chopped) {
  const ing = INGREDIENTS[id];
  if (!ing) return;
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = ing.dark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (chopped) {
    // Cut marks: ingredient split into pieces.
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 0.2);
    ctx.lineTo(x + r * 0.7, y + r * 0.1);
    ctx.moveTo(x - r * 0.2, y - r * 0.7);
    ctx.lineTo(x + r * 0.1, y + r * 0.7);
    ctx.stroke();
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.arc(x - r * 0.4, y - r * 0.35, r * 0.16, 0, Math.PI * 2);
    ctx.arc(x + r * 0.4, y + r * 0.35, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDishIcon(ctx, x, y, s, recipeId) {
  // Small picture of the finished dish, drawn from the recipe's colours.
  ctx.save();
  ctx.translate(x, y);
  if (recipeId === 'nasi') {
    ctx.fillStyle = '#f5ead0';
    ctx.beginPath(); ctx.ellipse(0, 4, s, s * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c531';
    ctx.beginPath(); ctx.arc(-s * 0.3, -2, s * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e02020';
    ctx.fillRect(s * 0.3, -s * 0.5, s * 0.28, s * 0.9);
    ctx.fillStyle = '#4a2c14';
    ctx.beginPath(); ctx.moveTo(-s * 0.8, s * 0.35); ctx.quadraticCurveTo(0, s * 0.7, s * 0.8, s * 0.3); ctx.lineTo(s * 0.8, s * 0.55); ctx.quadraticCurveTo(0, s * 0.95, -s * 0.8, s * 0.6); ctx.closePath(); ctx.fill();
  } else if (recipeId === 'soto') {
    ctx.fillStyle = '#e8b93c';
    ctx.beginPath(); ctx.ellipse(0, 2, s, s * 0.66, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5ead0';
    ctx.beginPath(); ctx.arc(0, -2, s * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c531';
    ctx.beginPath(); ctx.arc(0, -2, s * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8f0c8';
    ctx.fillRect(-s * 0.7, s * 0.35, s * 1.4, s * 0.16);
  } else {
    ctx.fillStyle = '#c89a5a';
    ctx.beginPath(); ctx.ellipse(0, 3, s, s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a4a22';
    ctx.fillRect(-s * 0.75, -s * 0.55, s * 0.18, s * 1.1);
    ctx.fillRect(-s * 0.1, -s * 0.55, s * 0.18, s * 1.1);
    ctx.fillRect(s * 0.55, -s * 0.55, s * 0.18, s * 1.1);
    ctx.fillStyle = '#7ed321';
    ctx.beginPath(); ctx.arc(s * 0.75, -s * 0.5, s * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFlame(ctx, x, y, w, t) {
  for (let i = 0; i < 5; i++) {
    const fx = x + (i / 4) * w;
    const h = 26 + Math.sin(t * 9 + i * 1.7) * 8 + Math.sin(t * 23 + i) * 4;
    const grad = ctx.createLinearGradient(0, y, 0, y - h);
    grad.addColorStop(0, '#ff7a00');
    grad.addColorStop(0.6, '#ffb400');
    grad.addColorStop(1, '#ffe14a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(fx - 13, y);
    ctx.quadraticCurveTo(fx - 10, y - h * 0.7, fx, y - h);
    ctx.quadraticCurveTo(fx + 10, y - h * 0.7, fx + 13, y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSteam(ctx, x, y, t, n) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.45 + i / n) % 1;
    const sx = x + Math.sin(ph * 9 + i * 2.1) * 10;
    const sy = y - ph * 46;
    ctx.globalAlpha = 0.55 * (1 - ph);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 8, sy - 8, sx - 2, sy - 16);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTicket(ctx, order, rect, isActive) {
  const r = RECIPES[order.recipeId];
  const step = currentStep(order);
  ctx.save();
  if (order.flash > 0 && Math.floor(G.time * 12) % 2 === 0) {
    ctx.fillStyle = '#e04040';
  } else {
    ctx.fillStyle = isActive ? '#fff6dd' : '#f3e6c8';
  }
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.fill();
  ctx.lineWidth = isActive ? 4 : 2;
  ctx.strokeStyle = isActive ? '#d98a2b' : '#8a6a42';
  ctx.stroke();
  drawDishIcon(ctx, rect.x + 30, rect.y + 30, 20, order.recipeId);
  text(ctx, r.name, rect.x + 58, rect.y + 20, 21, '#2b1a0e');
  text(ctx, step ? step.label : 'Siap disajikan!', rect.x + 58, rect.y + 46, 13, '#6b4a22');
  // Step dots.
  for (let i = 0; i < r.steps.length; i++) {
    ctx.fillStyle = i < order.step ? '#3f9e4d' : i === order.step ? '#d98a2b' : '#cbb98d';
    ctx.beginPath();
    ctx.arc(rect.x + 62 + i * 20, rect.y + 68, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Patience bar.
  const frac = Math.max(0, order.patience / order.maxPatience);
  ctx.fillStyle = '#d8c49a';
  rr(ctx, rect.x + 12, rect.y + rect.h - 18, rect.w - 24, 10, 5);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#3f9e4d' : frac > 0.25 ? '#e8960c' : '#e02020';
  rr(ctx, rect.x + 12, rect.y + rect.h - 18, (rect.w - 24) * frac, 10, 5);
  ctx.fill();
  if (order.done) {
    text(ctx, 'SIAP!', rect.x + rect.w - 16, rect.y + 22, 16, '#2e7d32', 'right');
  }
  ctx.restore();
}

function drawWorld(ctx) {
  const t = G.time;
  // Wall + floor.
  const wall = ctx.createLinearGradient(0, 0, 0, 600);
  wall.addColorStop(0, '#c96f3f');
  wall.addColorStop(1, '#a8542c');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1280, 600);
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(0, 596, 1280, 124);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 8; i++) ctx.fillRect(0, 612 + i * 14, 1280, 2);
  // Banana-leaf awning.
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#2e7d32' : '#43a047';
    ctx.beginPath();
    ctx.moveTo(i * 160, 0);
    ctx.lineTo(i * 160 + 160, 0);
    ctx.lineTo(i * 160 + 140, 44);
    ctx.lineTo(i * 160 + 20, 44);
    ctx.closePath();
    ctx.fill();
  }
  // Hanging lamp.
  ctx.strokeStyle = '#3a2412';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(640, 44); ctx.lineTo(640, 84); ctx.stroke();
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.arc(640, 100, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,217,74,0.18)';
  ctx.beginPath(); ctx.arc(640, 100, 60 + Math.sin(t * 2) * 4, 0, Math.PI * 2); ctx.fill();
  // Warung sign.
  ctx.fillStyle = '#3a2412';
  rr(ctx, 30, 200, 210, 44, 8); ctx.fill();
  text(ctx, 'WARUNG KUALI EMAS', 135, 223, 17, '#ffd94a', 'center');

  // Order board.
  ctx.fillStyle = '#5d3a1a';
  rr(ctx, LAYOUT.board.x - 6, LAYOUT.board.y - 6, LAYOUT.board.w + 12, LAYOUT.board.h + 12, 10);
  ctx.fill();
  G.orders.forEach((o, i) => drawTicket(ctx, o, ticketRect(i), activeOrder() && o.id === activeOrder().id));
  if (!G.orders.length) text(ctx, 'Menunggu pesanan…', 640, LAYOUT.board.y + 55, 20, '#f3e6c8', 'center');

  const order = activeOrder();

  // Prep bowls.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  rr(ctx, LAYOUT.prep.x, LAYOUT.prep.y, LAYOUT.prep.w, LAYOUT.prep.h, 8); ctx.fill();
  text(ctx, 'Siap masak:', LAYOUT.prep.x + 12, LAYOUT.prep.y + 16, 13, '#ffe9c4');
  (order ? order.prepped : []).forEach((id, i) => {
    drawIngredient(ctx, LAYOUT.prep.x + 110 + i * 52, LAYOUT.prep.y + 36, 18, id, true);
  });

  // Cutting board.
  ctx.fillStyle = '#8a5a28';
  rr(ctx, LAYOUT.cutting.x, LAYOUT.cutting.y, LAYOUT.cutting.w, LAYOUT.cutting.h, 10); ctx.fill();
  ctx.fillStyle = '#b07a3e';
  rr(ctx, LAYOUT.cutting.x + 10, LAYOUT.cutting.y + 10, LAYOUT.cutting.w - 20, LAYOUT.cutting.h - 20, 8); ctx.fill();
  // Knife.
  ctx.fillStyle = '#cfd6dd';
  ctx.save();
  ctx.translate(LAYOUT.cutting.x + LAYOUT.cutting.w - 34, LAYOUT.cutting.y + 40);
  ctx.rotate(0.5);
  ctx.fillRect(-8, -34, 16, 68);
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(-8, 34, 16, 22);
  ctx.restore();
  if (G.board) {
    drawIngredient(ctx, LAYOUT.cutting.x + 130, LAYOUT.cutting.y + 90, 34, G.board.ing, G.board.clicks >= 1);
    text(ctx, 'Cincang! (' + G.board.clicks + '/2)', LAYOUT.cutting.x + 130, LAYOUT.cutting.y + 148, 15, '#3a2412', 'center');
  } else if (order) {
    const st = currentStep(order);
    if (st && st.station === 'board') text(ctx, 'Talenan — klik dengan bahan', LAYOUT.cutting.x + 150, LAYOUT.cutting.y + 90, 15, '#5d3a1a', 'center');
  }
  // Chopping pieces (particles).
  drawParticles(ctx);

  // Wok + stove.
  ctx.fillStyle = '#4a2c14';
  rr(ctx, LAYOUT.wok.x, LAYOUT.wok.y + 110, LAYOUT.wok.w, 80, 10); ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath(); ctx.ellipse(LAYOUT.wok.x + 140, LAYOUT.wok.y + 96, 120, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3d3d3d';
  ctx.beginPath(); ctx.ellipse(LAYOUT.wok.x + 140, LAYOUT.wok.y + 88, 104, 26, 0, 0, Math.PI * 2); ctx.fill();
  // Flame licking from under the wok's left and right edges (drawn after the
  // wok so it stays visible).
  drawFlame(ctx, LAYOUT.wok.x + 6, LAYOUT.wok.y + 116, 62, t);
  drawFlame(ctx, LAYOUT.wok.x + LAYOUT.wok.w - 68, LAYOUT.wok.y + 116, 62, t);
  if (order) {
    const wok = order.wok;
    if (wok.items.length) {
      if (wok.burnt) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.ellipse(LAYOUT.wok.x + 140, LAYOUT.wok.y + 88, 84, 18, 0, 0, Math.PI * 2); ctx.fill();
        text(ctx, 'GOSONG! Buang ke tempat sampah', LAYOUT.wok.x + 140, LAYOUT.wok.y + 46, 15, '#ffd94a', 'center');
        drawSteam(ctx, LAYOUT.wok.x + 140, LAYOUT.wok.y + 70, t, 3);
      } else {
        wok.items.forEach((it, i) => drawIngredient(ctx, LAYOUT.wok.x + 100 + i * 36, LAYOUT.wok.y + 86, 15, it.id, it.chopped));
        if (wok.cooking) {
          drawSteam(ctx, LAYOUT.wok.x + 140, LAYOUT.wok.y + 60, t, 4);
          // Cooking progress ring around the wok.
          ctx.strokeStyle = '#ffd94a';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(LAYOUT.wok.x + 140, LAYOUT.wok.y + 88, 128, -Math.PI / 2, -Math.PI / 2 + (wok.progress / wok.duration) * Math.PI * 2);
          ctx.stroke();
        }
        if (wok.ready) text(ctx, 'Matang! Pindah ke piring →', LAYOUT.wok.x + 140, LAYOUT.wok.y + 46, 15, '#ffd94a', 'center');
      }
    } else if (currentStep(order) && currentStep(order).station === 'wok') {
      text(ctx, 'Wajan — klik dengan bahan', LAYOUT.wok.x + 140, LAYOUT.wok.y + 46, 15, '#ffe9c4', 'center');
    }
  }

  // Plating counter.
  ctx.fillStyle = '#e8ddc4';
  rr(ctx, LAYOUT.plate.x, LAYOUT.plate.y, LAYOUT.plate.w, LAYOUT.plate.h, 10); ctx.fill();
  ctx.fillStyle = '#fbf7ec';
  ctx.beginPath(); ctx.ellipse(LAYOUT.plate.x + 90, LAYOUT.plate.y + 84, 72, 44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cbb98d';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(LAYOUT.plate.x + 90, LAYOUT.plate.y + 84, 72, 44, 0, 0, Math.PI * 2); ctx.stroke();
  if (order) {
    order.plate.items.forEach((it, i) => drawIngredient(ctx, LAYOUT.plate.x + 52 + i * 34, LAYOUT.plate.y + 84, 13, it.id, it.chopped));
    if (order.plate.items.length) drawSteam(ctx, LAYOUT.plate.x + 90, LAYOUT.plate.y + 50, t, 2);
    const st = currentStep(order);
    if (st && st.station === 'plate') text(ctx, 'Piring — hias di sini', LAYOUT.plate.x + 90, LAYOUT.plate.y + 140, 14, '#5d3a1a', 'center');
  }

  // Serving window.
  const glow = 0.25 + 0.1 * Math.sin(t * 3);
  ctx.fillStyle = 'rgba(255,190,80,' + glow + ')';
  rr(ctx, LAYOUT.window.x - 8, LAYOUT.window.y - 8, LAYOUT.window.w + 16, LAYOUT.window.h + 16, 12); ctx.fill();
  ctx.fillStyle = '#7a4a26';
  rr(ctx, LAYOUT.window.x, LAYOUT.window.y, LAYOUT.window.w, LAYOUT.window.h, 10); ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  rr(ctx, LAYOUT.window.x + 12, LAYOUT.window.y + 12, LAYOUT.window.w - 24, LAYOUT.window.h - 24, 8); ctx.fill();
  // Customer silhouette.
  ctx.fillStyle = '#8a5a28';
  ctx.beginPath(); ctx.arc(LAYOUT.window.x + 110, LAYOUT.window.y + 78, 30, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(LAYOUT.window.x + 110, LAYOUT.window.y + 168, 62, 52, 0, 0, Math.PI * 2); ctx.fill();
  // Finished plates waiting — drawn in front of the customer so they read.
  G.orders.filter((o) => o.done).forEach((o, i) => {
    const px = LAYOUT.window.x + 44 + i * 66;
    const py = LAYOUT.window.y + LAYOUT.window.h - 30;
    ctx.fillStyle = '#fbf7ec';
    ctx.beginPath(); ctx.ellipse(px, py, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
    drawDishIcon(ctx, px, py - 6, 16, o.recipeId);
  });
  if (G.ding > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, G.ding);
    ctx.strokeStyle = '#ffd94a';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(LAYOUT.window.x + 110, LAYOUT.window.y + 130, 44 + i * 16 + (1.2 - G.ding) * 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    text(ctx, 'DING!', LAYOUT.window.x + 110, LAYOUT.window.y + 30, 20, '#b26e00', 'center');
    ctx.restore();
  }
  text(ctx, 'Jendela Saji', LAYOUT.window.x + 110, LAYOUT.window.y + LAYOUT.window.h + 14, 13, '#ffe9c4', 'center');

  // Ingredient counter.
  ctx.fillStyle = '#5d3a1a';
  rr(ctx, LAYOUT.counter.x - 6, LAYOUT.counter.y - 6, LAYOUT.counter.w + 12, LAYOUT.counter.h + 12, 10); ctx.fill();
  COUNTER_ORDER.forEach((id, i) => {
    const tr = trayRect(i);
    const ing = INGREDIENTS[id];
    ctx.fillStyle = '#e8ddc4';
    rr(ctx, tr.x, tr.y, tr.w, tr.h, 8); ctx.fill();
    drawIngredient(ctx, tr.x + tr.w / 2, tr.y + 34, 20, id, false);
    text(ctx, ing.name, tr.x + tr.w / 2, tr.y + tr.h - 16, 12, '#2b1a0e', 'center');
    if (i < 5) text(ctx, String(i + 1), tr.x + 10, tr.y + 12, 11, '#8a6a42');
  });

  // Bin.
  ctx.fillStyle = '#3d3d3d';
  rr(ctx, LAYOUT.bin.x, LAYOUT.bin.y, LAYOUT.bin.w, LAYOUT.bin.h, 10); ctx.fill();
  ctx.fillStyle = '#555';
  rr(ctx, LAYOUT.bin.x + 12, LAYOUT.bin.y + 10, LAYOUT.bin.w - 24, LAYOUT.bin.h - 34, 8); ctx.fill();
  text(ctx, '🗑 SAMPAH', LAYOUT.bin.x + LAYOUT.bin.w / 2, LAYOUT.bin.y + LAYOUT.bin.h - 12, 13, '#f3e6c8', 'center');

  // Current step hint bar.
  if (order) {
    const st = currentStep(order);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    rr(ctx, 420, 516, 440, 34, 17); ctx.fill();
    text(ctx, st ? '▶ ' + st.label : 'Sajikan di jendela!', 640, 534, 16, '#ffe9c4', 'center');
  }

  // Hand at the cursor.
  if (G.hand && G.mouse) {
    drawIngredient(ctx, G.mouse.x, G.mouse.y - 26, 22, G.hand.id, G.hand.chopped);
    // Dark pill behind the hand label so it stays readable over light plates.
    const label = INGREDIENTS[G.hand.id].name;
    ctx.font = 'bold 13px system-ui, sans-serif';
    const w = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(20,10,4,0.75)';
    rr(ctx, G.mouse.x - w / 2 - 6, G.mouse.y - 62, w + 12, 20, 10); ctx.fill();
    text(ctx, label, G.mouse.x, G.mouse.y - 52, 13, '#fff', 'center');
  }
}

function drawParticles(ctx) {
  for (const p of G.particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillRect(p.x - 3, p.y - 3, 7, 7);
  }
  ctx.globalAlpha = 1;
}

function addPieces(ingId) {
  const ing = INGREDIENTS[ingId];
  for (let i = 0; i < 8; i++) {
    G.particles.push({
      x: LAYOUT.cutting.x + 130 + (G.rng() - 0.5) * 60,
      y: LAYOUT.cutting.y + 90 + (G.rng() - 0.5) * 30,
      vx: (G.rng() - 0.5) * 160, vy: -40 - G.rng() * 90,
      life: 0.6, max: 0.6, color: ing.color,
    });
  }
}

function addBurst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = G.rng() * Math.PI * 2;
    G.particles.push({
      x, y, vx: Math.cos(a) * (60 + G.rng() * 140), vy: Math.sin(a) * (60 + G.rng() * 140),
      life: 0.8, max: 0.8, color,
    });
  }
}

function addSmoke(x, y) {
  for (let i = 0; i < 10; i++) {
    G.particles.push({
      x: x + (G.rng() - 0.5) * 80, y: y + (G.rng() - 0.5) * 20,
      vx: (G.rng() - 0.5) * 20, vy: -30 - G.rng() * 40,
      life: 1.2, max: 1.2, color: '#666',
    });
  }
}

function updateParticles(dt) {
  for (const p of G.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
  }
  G.particles = G.particles.filter((p) => p.life > 0);
}
