// main.js — bootstrap and the game loop: starts the canvas, owns the frame loop,
// and hands each frame to update and render. Fresh from the spec.
'use strict';

// Deterministic RNG (mulberry32) so ?shot= scenes render the same twice.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const G = {
  canvas: null,
  ctx: null,
  screen: 'title', // title | play | daycomplete | gameover
  paused: false,
  showHowto: false,
  day: 1,
  timeLeft: 120,
  servedToday: 0,
  target: 4,
  score: 0,
  coins: 0,
  dayCoins: 0,
  combo: 0,
  bestCombo: 0,
  rep: 5,
  expiredToday: 0,
  totalServed: 0,
  overReason: '',
  orders: [],
  activeId: null,
  hand: null,
  board: null,
  spawnIn: 9,
  mouse: null,
  time: 0,
  particles: [],
  ding: 0,
  rng: mulberry32(20261125),
  shot: null,
  lastTickSecond: -1,
};

function setupShot(shot) {
  G.shot = shot;
  G.rng = mulberry32(shot === 'cook' ? 7 : shot === 'serve' ? 21 : 42);
  G.screen = 'play';
  G.day = shot === 'serve' ? 2 : 1;
  G.target = dayTarget(G.day);
  G.timeLeft = shot === 'cover' ? 87 : shot === 'serve' ? 41 : 96;
  G.servedToday = shot === 'serve' ? 5 : shot === 'cover' ? 2 : 1;
  G.score = shot === 'serve' ? 650 : shot === 'cover' ? 250 : 100;
  G.coins = shot === 'serve' ? 78 : 30;
  G.combo = shot === 'serve' ? 2 : shot === 'cover' ? 1 : 0;
  G.bestCombo = G.combo;
  G.rep = 5;
  G.orders = [];
  G.particles = [];
  if (shot === 'title') { G.screen = 'title'; return; }

  const mk = (recipeId, patienceFrac, step, extra) => {
    const o = newOrder(recipeId, G.day);
    o.patience = o.maxPatience * patienceFrac;
    o.step = step;
    Object.assign(o, extra || {});
    G.orders.push(o);
    return o;
  };
  if (shot === 'cover') {
    // Two readable tickets; one dish mid-assembly on the plating counter
    // (garnish half placed); a finished plate waiting at the serving window.
    const a = mk('nasi', 0.62, 4, { plate: { items: [{ id: 'egg', chopped: false }] }, wok: { items: [], cooking: false, progress: 0, duration: 0, ready: false, burnt: false } });
    a.prepped = [];
    const b = mk('nasi', 0.8, 0, {});
    b.done = true; // finished plate at the window
    b.step = 5;
    G.activeId = a.id;
    G.hand = { id: 'kecap', chopped: false };
    G.mouse = { x: 920, y: 380 };
  } else if (shot === 'cook') {
    // Chopping in progress at the board (pieces flying) + wok sizzling, ring half full.
    const a = mk('nasi', 0.7, 1, { prepped: ['shallot'] });
    a.wok = { items: [{ id: 'egg', chopped: false }], cooking: true, progress: 2.5, duration: 5, ready: false, burnt: false };
    mk('soto', 0.55, 0, {});
    G.activeId = a.id;
    G.board = { ing: 'chilli', clicks: 1 };
    addPieces('chilli');
    addPieces('chilli');
    G.hand = null;
    G.mouse = { x: 260, y: 380 };
  } else if (shot === 'serve') {
    // Finished plate at the window, serve ding visible, combo x2, target nearly met.
    const a = mk('soto', 0.6, 4, {});
    a.done = true;
    mk('nasi', 0.45, 2, { prepped: ['shallot'] });
    G.activeId = a.id;
    G.ding = 2.0;
    addBurst(1150, 380, '#ffd94a', 10);
    G.mouse = { x: 1150, y: 380 };
  }
}

function update(dt) {
  G.time += dt;
  if (G.ding > 0) G.ding -= dt;
  updateParticles(dt);
  if (G.screen !== 'play' || G.paused || G.showHowto) return;
  G.timeLeft -= dt;
  const sec = Math.ceil(G.timeLeft);
  if (G.timeLeft <= 10 && sec !== G.lastTickSecond && G.timeLeft > 0) {
    G.lastTickSecond = sec;
    AudioSys.tick();
  }
  if (G.timeLeft <= 0) {
    G.timeLeft = 0;
    endDay();
    return;
  }
  for (const o of G.orders) updateWok(o, dt);
  updateOrders(dt);
}

function render() {
  const ctx = G.ctx;
  ctx.clearRect(0, 0, 1280, 720);
  if (G.screen === 'title') {
    drawTitle(ctx);
  } else {
    drawWorld(ctx);
    drawHUD(ctx);
    if (G.screen === 'daycomplete') drawDayComplete(ctx);
    else if (G.screen === 'gameover') drawGameOver(ctx);
    else if (G.paused) drawPause(ctx);
  }
  if (G.showHowto) drawHowto(ctx);
}

let lastT = 0;
function loop(ts) {
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function boot() {
  G.canvas = document.getElementById('game');
  G.ctx = G.canvas.getContext('2d');
  bindInput();
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) setupShot(shot);
  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', boot);
