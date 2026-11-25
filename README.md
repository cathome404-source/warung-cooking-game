# warung-cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/cathome404-source/warung-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/cathome404-source/warung-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Kuali Emas (The Golden Wok): an Indonesian warung cooking game — pick, chop, wok, plate, serve. Three recipes (nasi goreng, soto ayam, sate ayam), orders on the board, combo scoring, and 5 days of service.

## Run it

```sh
cd game && python3 -m http.server 8080
```

Open http://localhost:8080 in desktop Chrome and play with keyboard + mouse. No network, no build step.

`main.ts` hands the game in: `MAKEFUN_OUTPUT_DIR=out node main.ts` copies `game/` and `screenshots/` to the output dir and writes `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=gwk13taj&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
