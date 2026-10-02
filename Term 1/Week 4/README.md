# Term 1 - Week 4: Strings, Text & Files

---

## 1. Homework & workshop assignments -> [`homework/`](homework/)

**What was the assignment?**
_TODO: describe this week's Strings, Text & Files workshop/homework._

**What did I hand in?**
_TODO: list the files in `homework/` (notebook exports, screenshots, scripts)._

**What did I find difficult, and how did I solve it?**
_TODO_

### Checklist
- [ ] My workshop / homework files are in `homework/`
- [ ] Everything runs without errors, or I explained what does not and why

---


## 2. Hackathon prototype -> [`hackathon/`](hackathon/)

**Project title:** The Pause

**My pair partner:** Jesse Schwarz

**Tool we had to use:** ComfyUI

**SDG we had to address:** SDG 13 Climate Action

**What problem does it solve, and for whom?**
Most people remember the COVID-19 lockdowns only through the deaths and the personal restrictions. Very few know that in spring 2020 nature in Europe briefly recovered: emptier roads, clearer skies, and animals moving into spaces humans had left (Tucker et al., 2023, *Science*; Fiske et al., 2024, the "Anthropause"). Our user is a young adult in a European city, say a 20-year-old student who spent lockdown at home looking out of the window, and who now sees 2030 climate targets as abstract numbers. The film shows them that they already *saw* a version of a lower-emission city with their own eyes, and asks why we went back.

**What did you build?**
A 35-second AI-generated short film in eight shots, made entirely with a text-to-video workflow in ComfyUI. It moves from a busy pre-lockdown street, to the empty lockdown street, clear skies and wildlife on the roads, to traffic flooding back, and then imagines the same street in 2030 if the pause had become a transition. It ends on a split screen of both futures fading to black with the question *"What if the pause had become a transition?"* and *"2030 is four years away."* A viewer can watch it on YouTube in under a minute.

**Link to the live thing (if any):**
https://youtu.be/VAcPg8OOOgk

**How do I run it?**
- **Watch:** open the YouTube link above.
- **Regenerate the shots:**
  1. Install Comfy Desktop (ComfyUI v0.38.1) and open the workflow `video_minimax_h3_t2v` from `hackathon/` (MiniMax H3 text-to-video).
  2. Use the fixed settings for every final shot: 16:9, 1.0 megapixels (1344x768), `turbo_mode` false, 24 fps.
  3. For each shot, copy the prompt, `duration`, `noise_seed` and `filename_prefix` from the shot list `hackathon/the_pause_prompts.md` and queue it. Outputs land in `the_pause/final/`.
  4. Put the eight clips in order in a video editor and add the two text cards over the black end of shot 08.

**Who did what?**
_TODO: honest split between Sam and Jesse (e.g. research and sources, writing the shot list and prompts, rendering in ComfyUI, editing and text cards, upload, slides)._

**Ethical reflection - what are the risks of your tool? Who could it harm?**
The biggest risk is that our film looks like real documentary footage but none of it is real. We deliberately prompted for a "realistic live-action documentary look", so if a clip is cut out and shared without context, someone could take an AI-generated deer on an empty road as evidence of something that never happened, which feeds exactly the kind of "nature is healing" fake videos that went viral in 2020. That is why the YouTube description must say clearly that every shot is AI-generated. The story also simplifies: the lockdown effects on nature were real but mixed and temporary (Tucker et al. found some animals moved more, others less), and the "pause" came from a crisis that cost lives and jobs, so we have to be careful not to make lockdowns look like a desirable climate policy. Our ending asks what a *transition* would look like, not for another lockdown. Finally, generating video is not free for the planet: every draft and final render used a lot of GPU power, and the model was trained on footage whose creators did not consent, which is an uncomfortable trade-off for a film about climate action.

### Checklist
- [ ] Prototype code (or export / workflow file) is in `hackathon/`
- [ ] This week's slides are in `hackathon/`
- [ ] The prototype actually runs, and I wrote down how to run it
- [ ] Ethical reflection written above

---

## 3. Presentation -> [`presentation/`](presentation/)

*Only fill this in for the week your group was selected to present. You need at least **one** of these across the whole term.*

- [ ] My group presented in this week
- [ ] Slides are in `presentation/`
- [ ] Proof of the live demo is in `presentation/` (recording, screenshots, or link)

**How did it go? What would I do differently next time?**
_TODO: only if we presented this week._

---

## 4. Reflection

**What is the most important thing I learned this week?**
That text-to-video models only give you a coherent film if you treat the prompts like a script. Every shot needed the same style line, the same street described in the same words, and a locked-off camera, otherwise the "same" street looked different in every clip. I also learned to work in two passes: fast turbo drafts first, then full-quality finals with fixed seeds. When the deer's legs glitched in the draft of shot 04, I fixed it by asking for a slower walk, one moving animal, a clear side profile and a new seed, instead of just re-rolling and hoping.

**Where does this connect to "AI for Good"?**
Generative AI made it possible for two students to visualise a future (the 2030 street) that does not exist yet, which is a powerful way to make SDG 13 targets feel concrete instead of abstract. But the same realism that makes it persuasive also makes it a misinformation risk, and it has its own energy cost. "AI for Good" here means being transparent that the footage is AI-generated and using it to ask an honest question, not to fake evidence.
