// stations.js — the stations: counter trays, cutting board, wok/stove, plating
// counter, serving window, and the bin; what each station accepts and returns.
// Fresh from the spec.
'use strict';

// Fixed 1280x720 layout.
const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 20, y: 72, w: 1240, h: 118 },      // order board (tickets live inside)
  prep: { x: 260, y: 216, w: 280, h: 64 },       // prep bowls above the cutting board
  cutting: { x: 110, y: 296, w: 300, h: 180 },   // cutting board
  wok: { x: 500, y: 296, w: 280, h: 190 },       // wok + stove
  plate: { x: 830, y: 316, w: 180, h: 160 },     // plating counter
  window: { x: 1040, y: 216, w: 220, h: 260 },   // serving window
  counter: { x: 20, y: 604, w: 1080, h: 100 },   // ingredient counter
  bin: { x: 1120, y: 604, w: 140, h: 100 },      // bin for burnt food
};

function trayRect(i) {
  const n = COUNTER_ORDER.length;
  const w = LAYOUT.counter.w / n;
  return { x: LAYOUT.counter.x + i * w + 3, y: LAYOUT.counter.y + 4, w: w - 6, h: LAYOUT.counter.h - 8 };
}

function ticketRect(i) {
  const w = 296, gap = 10;
  return { x: LAYOUT.board.x + 8 + i * (w + gap), y: LAYOUT.board.y + 8, w, h: LAYOUT.board.h - 16 };
}

function pointIn(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function stationAt(x, y) {
  if (pointIn(LAYOUT.bin, x, y)) return 'bin';
  if (pointIn(LAYOUT.window, x, y)) return 'window';
  if (pointIn(LAYOUT.plate, x, y)) return 'plate';
  if (pointIn(LAYOUT.wok, x, y)) return 'wok';
  if (pointIn(LAYOUT.cutting, x, y)) return 'cutting';
  if (pointIn(LAYOUT.prep, x, y)) return 'prep';
  for (let i = 0; i < COUNTER_ORDER.length; i++) {
    if (pointIn(trayRect(i), x, y)) return 'tray:' + i;
  }
  for (let i = 0; i < G.orders.length; i++) {
    if (pointIn(ticketRect(i), x, y)) return 'ticket:' + i;
  }
  return null;
}

function wrongIngredient(order) {
  if (!order) return;
  order.flash = 0.7;
  breakCombo();
  AudioSys.buzz();
}

function stepNeeds(step, have) {
  // Remaining needs of a step, given the items already added (`have` = array of {id, chopped}).
  return step.needs.filter((n) => !have.some((h) => h.id === n.id && h.chopped === n.chopped));
}

function handMatchesNeed(hand, need) {
  return hand && hand.id === need.id && hand.chopped === need.chopped;
}

// --- cutting board ---
function clickCutting() {
  const order = activeOrder();
  if (!order || order.done) return;
  const step = currentStep(order);
  // Finish chopping an item already on the board.
  if (G.board) {
    G.board.clicks += 1;
    AudioSys.chop();
    addPieces(G.board.ing);
    if (G.board.clicks >= 2) {
      order.prepped.push(G.board.ing);
      if (step && step.station === 'board') order.step += 1;
      G.board = null;
      maybeDishDone(order);
    }
    return;
  }
  if (!step || step.station !== 'board') return;
  if (!G.hand) return;
  // Board steps match the raw ingredient by id; the board itself does the chopping.
  const need = step.needs.find((n) => G.hand.id === n.id);
  if (!need) { wrongIngredient(order); return; }
  // Put the ingredient on the board and take the first chop.
  G.board = { ing: G.hand.id, clicks: 1 };
  G.hand = null;
  AudioSys.chop();
  addPieces(G.board.ing);
}

// --- wok / stove ---
function clickWok() {
  const order = activeOrder();
  if (!order || order.done) return;
  const step = currentStep(order);
  const wok = order.wok;
  if (wok.burnt) return; // must be binned first
  if (!step || step.station !== 'wok') return;
  if (wok.ready) return; // move it on at the plating counter
  // Add a needed ingredient from the hand, or from a prep bowl when the hand is empty.
  const remaining = stepNeeds(step, wok.items);
  if (remaining.length === 0) return;
  let used = null;
  if (G.hand) {
    const need = remaining.find((n) => handMatchesNeed(G.hand, n));
    if (!need) { wrongIngredient(order); return; }
    used = { id: G.hand.id, chopped: G.hand.chopped };
    G.hand = null;
  } else {
    const need = remaining.find((n) => n.chopped && order.prepped.includes(n.id));
    if (!need) return; // nothing to add; hint is drawn on screen
    order.prepped = order.prepped.filter((id) => id !== need.id);
    used = { id: need.id, chopped: true };
  }
  wok.items.push(used);
  AudioSys.pick();
  if (stepNeeds(step, wok.items).length === 0) {
    wok.cooking = true;
    wok.progress = 0;
    wok.duration = step.cook || 5;
    AudioSys.sizzleStart();
  }
}

function updateWok(order, dt) {
  const wok = order.wok;
  if (!wok.cooking || wok.ready || wok.burnt) return;
  wok.progress += dt;
  if (wok.progress >= wok.duration) {
    wok.ready = true;
    wok.cooking = false;
    AudioSys.sizzleStop();
    AudioSys.bell();
  } else if (wok.progress > wok.duration + 4) {
    // Burnt: left in the wok past its window.
    wok.burnt = true;
    wok.cooking = false;
    AudioSys.sizzleStop();
    AudioSys.thud();
    breakCombo();
    addSmoke(640, 340);
  }
}

// --- plating counter ---
function clickPlate() {
  const order = activeOrder();
  if (!order || order.done) return;
  // Move a finished wok cook onto the plate.
  if (order.wok.ready) {
    order.plate.items.push(...order.wok.items);
    order.wok.items = [];
    order.wok.ready = false;
    order.wok.progress = 0;
    order.step += 1;
    AudioSys.pick();
    maybeDishDone(order);
    return;
  }
  const step = currentStep(order);
  if (!step || step.station !== 'plate') return;
  const remaining = stepNeeds(step, order.plate.items);
  if (remaining.length === 0) return;
  let used = null;
  if (G.hand) {
    const need = remaining.find((n) => handMatchesNeed(G.hand, n));
    if (!need) { wrongIngredient(order); return; }
    used = { id: G.hand.id, chopped: G.hand.chopped };
    G.hand = null;
  } else {
    const need = remaining.find((n) => n.chopped && order.prepped.includes(n.id));
    if (!need) return;
    order.prepped = order.prepped.filter((id) => id !== need.id);
    used = { id: need.id, chopped: true };
  }
  order.plate.items.push(used);
  AudioSys.pick();
  if (stepNeeds(step, order.plate.items).length === 0) {
    order.step += 1;
    maybeDishDone(order);
  }
}

function maybeDishDone(order) {
  const r = RECIPES[order.recipeId];
  if (order.step >= r.steps.length) {
    order.done = true;
    order.prepped = [];
    AudioSys.ding();
  }
}

// --- serving window + bin ---
function clickWindow() {
  const done = G.orders.find((o) => o.done);
  if (done) serveOrder(done);
}

function clickBin() {
  const order = activeOrder();
  if (order && order.wok.burnt) {
    order.wok = { items: [], cooking: false, progress: 0, duration: 0, ready: false, burnt: false };
    G.rep = Math.max(0, G.rep - 0.5);
    breakCombo();
    AudioSys.thud();
    if (G.rep <= 0) endRun('rep');
  }
}

// --- counter tray ---
function clickTray(i) {
  const id = COUNTER_ORDER[i];
  if (!id) return;
  // Chopped form only exists via the board; trays always hand over the raw ingredient.
  G.hand = { id, chopped: false };
  AudioSys.pick();
}
