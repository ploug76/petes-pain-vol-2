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
