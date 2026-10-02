# The Pause — how we made it

A 35-second climate short film for SDG 13, generated shot by shot with a text-to-video workflow in ComfyUI.
Made by Sam and Jesse Schwarz for Hackathon 4 "Picture the Planet" (AI for Good minor).

▶️ **Watch it:** https://youtu.be/VAcPg8OOOgk

---

## 1. The idea

During the spring 2020 lockdowns, roads emptied, skies cleared and animals moved into spaces people had left (Tucker et al., 2023, *Science*; Fiske et al., 2024). Most people only remember COVID for the deaths and the restrictions. We wanted to show that pause, show how fast everything went back, and then ask: what if the pause had become a transition toward the 2030 climate goals?

The film follows one street through four states: **rush → stillness → restart → 2030**, with nature (sky, birds, deer) as the thread in between, and ends on a split screen where neither future wins.

| # | Shot | Time | What it shows |
|---|------|------|---------------|
| 01 | Rush | 0:00–0:04 | Busy old-town street, traffic, a plane overhead |
| 02 | Stillness | 0:04–0:08 | The same street, empty during lockdown |
| 03 | Outside | 0:08–0:12 | Crane-up over the rooftops to a park and clear sky |
| 04 | Roaming | 0:12–0:16 | A red deer crossing an empty country road |
| 05 | Clear sky | 0:16–0:20 | Parked planes, a sky without contrails |
| 06 | Restart | 0:20–0:25 | Time-lapse: traffic floods back, the deer runs off |
| 07 | 2030 | 0:25–0:29 | The street reimagined: trees, trams, bikes |
| 08 | Which one? | 0:29–0:35 | Split screen of both futures fading to black |

---

## 2. The workflow

We used Comfy Desktop (ComfyUI v0.38.1) with the **MiniMax H3 text-to-video** workflow (`video_minimax_h3_t2v.json`, in this folder). Every shot is one prompt in, one clip out. No stock footage and no other video tools.

![The full MiniMax H3 text-to-video workflow in ComfyUI](screenshots/00-workflow.png)

Settings were fixed for every final shot so the clips match:

| Setting | Value |
|---|---|
| Resolution | 16:9, 1.0 megapixels (1344x768) |
| Frame rate | 24 fps |
| `turbo_mode` | `true` for drafts, `false` for finals |
| `noise_seed` | fixed per shot (20200401–20200408), so results are reproducible |
| `filename_prefix` | `the_pause/draft/…` or `the_pause/final/shotNN` |

---

## 3. How we wrote the prompts

Text-to-video models forget everything between clips. To make eight separate generations feel like one film, every prompt has the same four blocks:

1. **Style line:** identical in every shot: *realistic live-action documentary look, cinematic, natural light, slight film grain, shot on 35mm.*
2. **Scene:** the street is described with the same words each time (four-storey brick and plaster facades, a tram line down the middle, cobbled pavement), so the model rebuilds the "same" place.
3. **Camera:** the street shots all use a *locked-off tripod wide shot at eye level*, so they line up for the split screen at the end.
4. **Audio:** what you should hear, always ending with *no music, no dialogue, no voices*.

The full prompts for all eight shots are in [`the_pause_prompts.md`](the_pause_prompts.md).

### The prompts in ComfyUI

**Shot 01 — Rush**
![Shot 01 prompt in ComfyUI](screenshots/shot01.png)

**Shot 02 — Stillness**
![Shot 02 prompt in ComfyUI](screenshots/shot02.png)

**Shot 03 — Outside**
![Shot 03 prompt in ComfyUI](screenshots/shot03.png)

**Shot 04 — Roaming**
![Shot 04 prompt in ComfyUI](screenshots/shot04.png)

**Shot 05 — Clear sky**
![Shot 05 prompt in ComfyUI](screenshots/shot05.png)

**Shot 06 — Restart**
![Shot 06 prompt in ComfyUI](screenshots/shot06.png)

**Shot 07 — 2030**
![Shot 07 prompt in ComfyUI](screenshots/shot07.png)

**Shot 08 — Which one?**
![Shot 08 prompt in ComfyUI](screenshots/shot08.png)

---

## 4. Drafts first, finals second

Full-quality renders are slow, so we worked in two passes:

1. **Draft pass:** every shot rendered with `turbo_mode` on (an 8-step turbo LoRA) into `the_pause/draft/`. Fast enough to watch the whole film and judge it as a sequence.
2. **Review:** we watched the drafts back to back and fixed what didn't work.
3. **Final pass:** the approved prompts re-rendered with `turbo_mode` off into `the_pause/final/`.

### What we fixed after the drafts

- **Shot 04, glitching deer legs.** With seed 20200404 the deer's legs blurred and merged while it walked. We rewrote the prompt: a *slower* walk, only *one* animal moving (the fox sits still), a clear *side profile*, a telephoto lens with the deer large in frame, and an explicit description of a correct four-legged gait. Then we switched to a new seed (20200414). The new version walks cleanly.
- **Shot 06, too short.** At 3 seconds the "restart" time-lapse felt rushed and the deer's exit was lost, so we lengthened it to 5 seconds. That brought the film to 35 seconds, still within the 25–35 s limit.

---

## 5. The edit

The eight final clips were placed in order in a video editor. Over the black end of shot 08 we added two text cards:

> *What if the pause had become a transition?*
> *2030 is four years away.*

Backup plan for shot 08: if the model hadn't produced a clean split screen, we would have composited the left half from shot 01 and the right half from shot 07 in the editor.

---

## 6. What we learned

- Consistency comes from **repeating the same words**, not from the model remembering.
- A **locked-off camera** is the easiest way to make separate clips feel like the same place.
- When something glitches, **simplify the motion** (slower, fewer moving things, a clear angle) before re-rolling seeds.
- **Turbo drafts** let you judge the film as a whole before spending hours on finals.

*All footage in this film is AI-generated. None of it is real archive footage.*

