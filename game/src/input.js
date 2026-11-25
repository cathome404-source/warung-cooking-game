// input.js — mouse and keyboard: picking, clicking stations, number keys for
// counter slots, Space to serve, Escape to pause. Fresh from the spec.
'use strict';

function canvasPos(evt) {
  const rect = G.canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (1280 / rect.width),
    y: (evt.clientY - rect.top) * (720 / rect.height),
  };
}

function handleButton(id) {
  AudioSys.ensure();
  if (id === 'play') { resetRun(); }
  else if (id === 'howto') { G.showHowto = true; }
  else if (id === 'closeHowto') { G.showHowto = false; }
  else if (id === 'sound') { AudioSys.toggleMute(); }
  else if (id === 'resume') { G.paused = false; }
  else if (id === 'nextDay') { startDay(G.day + 1); }
  else if (id === 'retry') { startDay(G.day); }
  else if (id === 'again') { resetRun(); }
}

function handleClick(x, y) {
  AudioSys.ensure();
  G.mouse = { x, y };
  // Screen buttons first.
  for (const b of screenButtons()) {
    if (pointIn(b.rect, x, y)) { handleButton(b.id); return; }
  }
  if (G.screen !== 'play' || G.paused || G.showHowto) return;
  const hit = stationAt(x, y);
  if (!hit) return;
  if (hit.startsWith('ticket:')) {
    const order = G.orders[parseInt(hit.split(':')[1], 10)];
    if (order) { G.activeId = order.id; AudioSys.pick(); }
    return;
  }
  if (hit.startsWith('tray:')) { clickTray(parseInt(hit.split(':')[1], 10)); return; }
  if (hit === 'cutting') { clickCutting(); return; }
  if (hit === 'wok') { clickWok(); return; }
  if (hit === 'plate') { clickPlate(); return; }
  if (hit === 'window') { clickWindow(); return; }
  if (hit === 'bin') { clickBin(); return; }
}

function handleKey(e) {
  AudioSys.ensure();
  if (e.key === 'Escape') {
    if (G.showHowto) { G.showHowto = false; return; }
    if (G.screen === 'play') G.paused = !G.paused;
    return;
  }
  if (G.screen !== 'play' || G.paused || G.showHowto) return;
  if (e.key === ' ') {
    e.preventDefault();
    clickWindow(); // Space serves the leftmost ready plate.
    return;
  }
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 5) clickTray(n - 1);
}

function bindInput() {
  G.canvas.addEventListener('click', (evt) => {
    const p = canvasPos(evt);
    handleClick(p.x, p.y);
  });
  G.canvas.addEventListener('mousemove', (evt) => {
    G.mouse = canvasPos(evt);
  });
  window.addEventListener('keydown', handleKey);
}
