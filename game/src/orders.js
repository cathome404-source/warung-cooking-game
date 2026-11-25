// orders.js — the order board: spawning tickets, patience timers, expiry,
// matching a finished plate to its ticket, and serving (score / coins / combo / rep).
// Fresh from the spec.
'use strict';

let nextOrderId = 1;

function newOrder(recipeId, day) {
  const max = patienceSeconds(day);
  return {
    id: nextOrderId++,
    recipeId,
    patience: max,
    maxPatience: max,
    step: 0,            // index into RECIPES[recipeId].steps
    prepped: [],        // chopped ingredient ids ready in prep bowls
    wok: { items: [], cooking: false, progress: 0, duration: 0, ready: false, burnt: false },
    plate: { items: [] },
    done: false,        // all steps finished, plate waiting at the serving window
    flash: 0,           // red-flash timer after a wrong ingredient
    born: 0,
  };
}

function currentStep(order) {
  const r = RECIPES[order.recipeId];
  return order.step < r.steps.length ? r.steps[order.step] : null;
}

function activeOrder() {
  if (!G.orders.length) return null;
  const found = G.orders.find((o) => o.id === G.activeId);
  return found || G.orders[0];
}

function spawnOrder() {
  const pool = unlockedRecipes(G.day);
  const recipe = pool[Math.floor(G.rng() * pool.length)];
  const order = newOrder(recipe.id, G.day);
  order.born = G.time;
  G.orders.push(order);
  if (G.activeId === null) G.activeId = order.id;
  AudioSys.bell();
  return order;
}

function comboMultiplier() {
  // 1st serve x1, 2nd x1.5, 3rd x2, 4th x2.5, 5th+ x3 (cap).
  return Math.min(3, 1 + 0.5 * G.combo);
}

function breakCombo() {
  G.combo = 0;
}

function serveOrder(order) {
  const r = RECIPES[order.recipeId];
  const mult = comboMultiplier();
  const gained = Math.round(r.base * mult);
  G.score += gained;
  const tip = order.patience / order.maxPatience > 0.75 ? 10 : order.patience / order.maxPatience > 0.5 ? 5 : 0;
  const coins = Math.floor(r.base / 10) + tip;
  G.coins += coins;
  G.dayCoins += coins;
  G.combo += 1;
  if (G.combo > G.bestCombo) G.bestCombo = G.combo;
  G.servedToday += 1;
  G.totalServed += 1;
  G.rep = Math.min(5, G.rep + 0.1);
  G.orders = G.orders.filter((o) => o.id !== order.id);
  if (G.activeId === order.id) G.activeId = G.orders.length ? G.orders[0].id : null;
  G.ding = 1.2; // serve-ding effect timer (rendered as a golden burst at the window)
  AudioSys.ding();
  addBurst(1150, 380, '#ffd94a', 14);
  return { gained, mult, coins, tip };
}

function expireOrder(order) {
  G.orders = G.orders.filter((o) => o.id !== order.id);
  if (G.activeId === order.id) G.activeId = G.orders.length ? G.orders[0].id : null;
  G.expiredToday += 1;
  G.rep = Math.max(0, G.rep - 1);
  breakCombo();
  AudioSys.thud();
  if (G.rep <= 0) endRun('rep');
  else if (G.expiredToday >= 3) endRun('expired');
}

function updateOrders(dt) {
  for (const order of [...G.orders]) {
    order.patience -= dt;
    if (order.flash > 0) order.flash -= dt;
    if (order.patience <= 0) expireOrder(order);
  }
  // Spawn pacing.
  if (G.orders.length < 4) {
    G.spawnIn -= dt;
    if (G.spawnIn <= 0) {
      spawnOrder();
      G.spawnIn = spawnInterval(G.day);
    }
  }
}

function endRun(reason) {
  if (G.screen !== 'play') return;
  AudioSys.sizzleStop();
  G.screen = 'gameover';
  G.overReason = reason;
}

function endDay() {
  AudioSys.sizzleStop();
  if (G.servedToday >= G.target) {
    AudioSys.chime();
    if (G.day >= 5) {
      G.screen = 'gameover';
      G.overReason = 'win';
    } else {
      G.screen = 'daycomplete';
    }
  } else {
    G.screen = 'gameover';
    G.overReason = 'target';
  }
}

function startDay(day) {
  G.day = day;
  G.timeLeft = 120;
  G.servedToday = 0;
  G.expiredToday = 0;
  G.dayCoins = 0;
  G.orders = [];
  G.activeId = null;
  G.hand = null;
  G.board = null;
  G.spawnIn = 9;
  G.paused = false;
  G.showHowto = false;
  G.screen = 'play';
  spawnOrder();
}

function resetRun() {
  G.score = 0;
  G.coins = 0;
  G.combo = 0;
  G.bestCombo = 0;
  G.rep = 5;
  G.totalServed = 0;
  G.overReason = '';
  startDay(1);
}
