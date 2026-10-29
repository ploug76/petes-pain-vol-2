# Pete's Pain 2: Extreme Makeover — PROGRESS (started Oct 29 2026 8:55 AM PT)
Repo: ploug76/petes-pain-vol-2 (Pages). DO NOT touch ploug76/petes-pain.
Work dir: /workspace/petes-pain-vol-2 (repo = source, no build step). Scratch: /workspace/pp2-work (art/mk.py makes js/art.js heads from petes-pain-src drawn art).
Stack: canvas 2D + planck.js 1.5.1 (Box2D) real jointed ragdoll; WebAudio synth sfx+music; gamepad.js house style.
Vault pattern (like pink-taco-twins): robots.txt Disallow + noindex meta, no share/sample snippet, no public leaderboard. Add entry to peters-arcade/vault.json, cover gif in peters-arcade/covers (NOT precached in arcade sw), bump arcade sw.
Pain research: aim+power, in-flight drift, poses (hold L + face btn; hold 2s = multiplier), grab (face btn near object; grab moving things to be dragged; grab/throw fuse crates),
Ooch after first impact (4 nudges O-O-C-H diminishing, recharge), Super Ooch once/launch. Modes: PAINdemonium sandbox, Mime Toss (grab floating mime, hurl through glass, timed),
Spank the Monkey (-> Bonk the Raccoons), HORSE (match first object hit + beat score), Bowling w/ opponent booby traps, Fun With Explosives (crate pinball). Replay of each launch.
## Status
- 08:58 setup: planck.min.js, gamepad.js, art.js heads (84px) copied. Next: write js/game.js
- 09:40 first playable: js/core,phys,stages,modes,game,draw,ui all written; smoke test 0 errors portrait+landscape. Local git commit (not pushed yet; repo not created on GitHub yet).
  Next: full mode playtest script /workspace/pp2-work/qa.py, gamepad mock, tune, then create GH repo + Pages.
- 09:46 (resumed after box interruption) GH repo created (public); WIP pushed to `wip` branch. Fixes since: HUD relayout, call sizing/suppression, fragile->pier + gentler dmg, mime throwAssist, 2 substeps for ragdoll, real unlock thresholds, high-flight zoom-out. tour.py: 0 errors both orientations, fps 60.5, mock gamepad OK.
  Next: qa.py port/land + mime test, push main, enable Pages, cover gif, vault.json entry + arcade sw v92.
- 10:05 QA pass: qa.py all 9 modes to result, portrait+landscape, 0 errors, no NaN/runaway; ragdoll maxJ 0.05-0.43 m (was 0.56); mime throw-assist breaks pane; fragile delivers. Pushing main + enabling Pages.
- 10:20 LIVE: https://ploug76.github.io/petes-pain-vol-2/ (Pages from main, sw petes-pain-vol-2-v2 live). Live Playwright 412x915 + 915x412: 0 errors, sw registered.
  Arcade: peters-arcade ee26457 adds vault.json entry + covers/petes-pain-vol-2.gif (720x378, 16 frames), sw v92 (live). Vault list verified live; absent from ?sample=bhs; not on kellys-arcade. No lb (pink-taco pattern). DONE.
- 10:40 URGENT touch bug (Peter, S26 Ultra/Brave: "buttons don't work, can't start"). ROOT CAUSE: menuBtns is rebuilt every frame, and pointerup only fired a menu button's callback if the button under the finger was the *same object* as on pointerdown. A real finger tap lasts ~80-150 ms (several frames) so the objects never matched -> no menu button ever fired. QA used instant synthetic clicks (down+up in one frame) so it passed. In-game round buttons were 'instant' (fire on down) so only menus broke.
  FIX: match by button id on pointerup and call the fresh callback; keep pressed state across frames; ignore pointercancel; SND.unlock wrapped in try. Added keyboard menu nav (arrows/Tab/Enter/Space/Esc) and gamepad default focus on the primary button. core.js/ui.js ?v=2, sw v3.
  Verified locally: CDP real touch (130 ms holds) title->every mode->pause/resume->drag-launch->quit, locker/help/back, results again/modes, both orientations, 0 errors; keyboard + mock gamepad menus to launch.
- 10:58 LIVE verified (sw petes-pain-vol-2-v3, core.js?v=2 has fix): CDP touch flow all 9 modes x portrait/landscape, direct and with peters-arcade referrer (Vault opens game as a plain same-tab link), results/locker/help/back/pause/stage-select by touch, keyboard + mock pad menus; 0 errors. ploug76/petes-pain untouched (last push 07:38 AM PT, before this work).
