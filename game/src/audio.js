// audio.js — all sound synthesized with WebAudio at runtime. No audio files, no network.
// Fresh from the spec.
'use strict';

const AudioSys = {
  ctx: null,
  muted: false,
  sizzle: null, // {src, gain} while food cooks

  ensure() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* audio unavailable: stay silent */ }
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.sizzleStop();
    return this.muted;
  },

  tone(freq, dur, type, vol, delay, slideTo) {
    if (this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    } catch (e) { /* ignore */ }
  },

  noiseBurst(dur, vol, freq) {
    if (this.muted || !this.ctx) return;
    try {
      const n = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq || 1200;
      const g = this.ctx.createGain();
      g.gain.value = vol || 0.2;
      src.connect(f).connect(g).connect(this.ctx.destination);
      src.start();
    } catch (e) { /* ignore */ }
  },

  chop() { // short dry wooden knock
    this.noiseBurst(0.07, 0.35, 900);
    this.tone(170, 0.07, 'triangle', 0.25);
  },
  ding() { // bright two-note serve ding
    this.tone(880, 0.18, 'sine', 0.2);
    this.tone(1318, 0.3, 'sine', 0.2, 0.09);
  },
  buzz() { // low error buzz
    this.tone(110, 0.28, 'sawtooth', 0.18, 0, 82);
  },
  thud() { // dull burnt thud
    this.tone(70, 0.22, 'sine', 0.3, 0, 45);
    this.noiseBurst(0.12, 0.15, 300);
  },
  tick() { this.tone(1050, 0.05, 'square', 0.08); },
  bell() { // soft new-order bell
    this.tone(660, 0.35, 'sine', 0.14);
    this.tone(990, 0.3, 'sine', 0.08, 0.05);
  },
  chime() { // short rising day-complete chime
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this.tone(f, 0.35, 'sine', 0.16, i * 0.11));
  },
  pick() { this.tone(520, 0.06, 'sine', 0.1); },

  sizzleStart() {
    if (this.muted || !this.ctx || this.sizzle) return;
    try {
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 4200;
      f.Q.value = 0.6;
      const g = this.ctx.createGain();
      g.gain.value = 0.045;
      src.connect(f).connect(g).connect(this.ctx.destination);
      src.start();
      this.sizzle = { src, gain: g };
    } catch (e) { /* ignore */ }
  },

  sizzleStop() {
    if (!this.sizzle) return;
    try {
      this.sizzle.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      const src = this.sizzle.src;
      setTimeout(() => { try { src.stop(); } catch (e) {} }, 300);
    } catch (e) {}
    this.sizzle = null;
  },
};
