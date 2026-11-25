// recipes.js — the three recipes: ingredients, step sequences, scores, unlock days.
// Fresh from the spec. No file does another file's job.
'use strict';

const INGREDIENTS = {
  rice:     { name: 'Nasi',         color: '#f5ead0', dark: '#cbb98d' },
  egg:      { name: 'Telur',        color: '#f2c531', dark: '#c99a12' },
  shallot:  { name: 'Bawang Merah', color: '#c86a9b', dark: '#9c4a78' },
  chilli:   { name: 'Cabai',        color: '#e02020', dark: '#a31212' },
  kecap:    { name: 'Kecap Manis',  color: '#4a2c14', dark: '#2e1a0a' },
  chicken:  { name: 'Ayam',         color: '#f2b8a0', dark: '#d18a6a' },
  turmeric: { name: 'Kunyit',       color: '#e8960c', dark: '#b26e00' },
  sprouts:  { name: 'Tauge',        color: '#e8f0c8', dark: '#b5c48a' },
  peanut:   { name: 'Saus Kacang',  color: '#c89a5a', dark: '#9a7138' },
  lime:     { name: 'Jeruk Nipis',  color: '#7ed321', dark: '#55a010' },
};

// Counter order (tray slots, left to right). Keys 1-5 grab the first five slots.
const COUNTER_ORDER = ['rice', 'egg', 'shallot', 'chilli', 'kecap', 'chicken', 'turmeric', 'sprouts', 'peanut', 'lime'];

// A step: station 'board' | 'wok' | 'plate'; needs = [{id, chopped}] consumed in order;
// wok steps cook for `cook` seconds once every need is in the wok.
const RECIPES = {
  nasi: {
    id: 'nasi', name: 'Nasi Goreng', base: 100, unlockDay: 1,
    color: '#d98a2b',
    blurb: 'Nasi goreng telur, bawang, cabai, kecap.',
    steps: [
      { station: 'board', needs: [{ id: 'shallot', chopped: true }], label: 'Cincang bawang merah' },
      { station: 'board', needs: [{ id: 'chilli', chopped: true }], label: 'Cincang cabai' },
      { station: 'wok',   needs: [{ id: 'egg', chopped: false }], cook: 5, label: 'Goreng telur di wajan' },
      { station: 'wok',   needs: [{ id: 'rice', chopped: false }, { id: 'shallot', chopped: true }, { id: 'chilli', chopped: true }], cook: 6, label: 'Masukkan nasi + bawang + cabai, tumis' },
      { station: 'plate', needs: [{ id: 'kecap', chopped: false }], label: 'Siram kecap manis di piring' },
    ],
  },
  soto: {
    id: 'soto', name: 'Soto Ayam', base: 150, unlockDay: 2,
    color: '#e8b93c',
    blurb: 'Kuah kunyit hangat, ayam suwir, tauge.',
    steps: [
      { station: 'board', needs: [{ id: 'turmeric', chopped: true }], label: 'Cincang kunyit' },
      { station: 'wok',   needs: [{ id: 'chicken', chopped: false }], cook: 7, label: 'Rebus ayam di panci' },
      { station: 'wok',   needs: [{ id: 'sprouts', chopped: false }, { id: 'turmeric', chopped: true }], cook: 5, label: 'Masukkan tauge + kunyit ke kuah' },
      { station: 'plate', needs: [{ id: 'egg', chopped: false }, { id: 'shallot', chopped: false }], label: 'Taruh telur rebus + bawang goreng' },
    ],
  },
  sate: {
    id: 'sate', name: 'Sate Ayam', base: 200, unlockDay: 3,
    color: '#b4552d',
    blurb: 'Sate bakar arang, saus kacang, jeruk nipis.',
    steps: [
      { station: 'board', needs: [{ id: 'shallot', chopped: true }], label: 'Cincang bawang merah' },
      { station: 'board', needs: [{ id: 'chilli', chopped: true }], label: 'Cincang cabai' },
      { station: 'wok',   needs: [{ id: 'chicken', chopped: false }], cook: 7, label: 'Bakar sate di atas api' },
      { station: 'plate', needs: [{ id: 'peanut', chopped: false }], label: 'Oles saus kacang' },
      { station: 'plate', needs: [{ id: 'lime', chopped: false }, { id: 'shallot', chopped: false }], label: 'Peras jeruk nipis + tabur bawang' },
    ],
  },
};

const RECIPE_LIST = [RECIPES.nasi, RECIPES.soto, RECIPES.sate];

function unlockedRecipes(day) {
  return RECIPE_LIST.filter((r) => r.unlockDay <= day);
}

function dayTarget(day) {
  return [0, 4, 6, 8, 10, 12][day] || 4;
}

function spawnInterval(day) {
  return [0, 16, 14, 12, 10, 9][day] || 9;
}

function patienceSeconds(day) {
  return [0, 55, 50, 45, 40, 36][day] || 36;
}
