# AGENTS.md — SkeleTeller

Kiroween 2026 entry — **Skeleton Crew**. Read this file first in every session on this project.

## Status
- **PIVOT DECIDED 2026-11-11:** this entry is now a skeleton for programmatically producing a demo of a project from **one storyboard spec → two outputs: a demo video and an interactive slide walkthrough**. The original proof apps (Tarotomb, PostMortem) are **retired** — do not revive them for this entry.
- **Output-2 clarification (2026-11-11):** the second output is **not an interactive demo of the target project itself** — it is a **slide walkthrough of the same storyboard, interactive like a storybook**: the viewer turns the pages/slides themselves, clicks hotspots/callouts to reveal the explanation, and moves at their own pace. The slides carry the project's captures and story; they do not run the project live.
- **Name DECIDED 2026-11-11: SkeleTeller** (skeleton + storyteller — it tells a project's story from its bones, the storyboard; replaces the Boneprint working title). Collision check run 2026-11-11: no exact "SkeleTeller" found in web / GitHub / Devpost searches. **Watch-out:** every search fuzzy-matches **Skeletor** (the Mattel character, plus existing Skeletor-named software — a UI build-tool ecosystem and skeleton-generator packages) — expect search confusion; trademark registers and domain availability NOT checked. The two apps are functional titles for now — Video Demo and Slide Walkthrough (proposed labels: SkeleTeller Reel / SkeleTeller Storybook — confirm before specs are written).
- Repo `lanly-dev/skeleteller` — **not yet created**. Do not create it, register anything, or request credits until given the go in this project's side chat.
- Deadline: **Fri Dec 4, 2026, 2:00 PM PT**. This is the biggest of the four entries and the long pole of the schedule — it starts first.

## What this is
A skeleton (boilerplate) for a repeatable demo-building procedure. The procedure: take a project (its README / description / screenshots or captures), let Kiro draft a **storyboard spec** — an ordered list of scenes with narration/caption text, visuals, and callouts — then run the procedure to **programmatically produce two tellings of that single storyboard**:
1. a rendered **demo video** (the story told *to* you), and
2. a hosted **interactive slide walkthrough** (the same story as a storybook you page through yourself).

The skeleton is two layers: (1) the procedure code — storyboard schema, scene/slide primitives, capture/asset step, render/build steps; and (2) the Kiro layer — spec templates, steering docs, and hooks that live in the skeleton's `/.kiro`, which is how the storyboard gets drafted from a new project. To demo a new project: copy the skeleton, write a storyboard spec, let Kiro fill the project-specific parts, run the procedure.

## Category fit + the one hard structural rule
Skeleton Crew: build a lean, clear skeleton code template and prove its versatility with two distinct applications. **The repo must contain 2 separate folders for the 2 separate applications.** Layout (fixed):
- `skeleton/` — the template itself (storyboard schema + scene/slide primitives + procedure + its `/.kiro` templates/steering/hooks).
- `apps/demo-video/` — App A: storyboard → rendered demo video.
- `apps/slide-walkthrough/` — App B: the same storyboard format → interactive, storybook-style slide walkthrough.
The entry's own repo-level `/.kiro` also exists at root per the general package rules.

Judges' test: the two apps must be genuinely different creatures on the same bones — one is *watch* (a rendered video), the other is *turn the pages yourself* (slides with storybook interactivity). Different format, interaction model, and output, sharing one storyboard format and the same scene primitives. Two rendered videos, or a reskin, fails the category.

## The two apps
**App A — Demo Video.** Takes a storyboard spec and programmatically renders it into a demo video (under 3 minutes): title → feature scenes with captures, zooms/callouts, caption/narration text → outro. Proves the skeleton's render pipeline.
**App B — Slide Walkthrough.** Takes the *same* storyboard spec and builds a hosted, storybook-style walkthrough: each scene becomes a page/slide with the same visual, callouts, and text. Interactivity is slide-level only — page/step navigation (next/back, progress, keyboard), clickable hotspots/callouts that reveal the explanation, optional page-flip feel. It does **not** embed or run the target project. Proves the skeleton's web/interaction side — and supplies the working app URL a video file alone might not.

## Hard rules (Kiroween)
- New project, built during the window, core implementation built by **Kiro, spec-first**: spec committed in `/.kiro` before implementation code. For this entry the spec-first discipline IS the product claim — the storyboard spec is itself a Kiro spec, and the git history is evidence; keep it clean and honest.
- `/.kiro` at repo root, never gitignored. MIT license at repo top.
- Other agents may plan / prototype / document; Kiro implements the core of the skeleton and of both apps. Any carried-over code gets a one-line Devpost disclosure.
- Kiro credit budget for this entry: **~1,300** of the shared 4,000 — the largest share, because Kiro depth is this entry's whole pitch.
- **No absolute paths (standing rule, 2026-11-07).** Nothing that leaves this machine — code, comments, specs, docs, commit messages, READMEs, screenshots, Devpost text — may contain an absolute local path (no `/home/<user>/...`, no `~/workspace/...`, no `C:\Users\...`). Reference files by repo-relative path only (e.g. `skeleton/src/...`, `/.kiro/specs/...`). The local directory layout is private and must never leak into the public repo or the submission.

## Kiroween 2026 — official compliance requirements (extracted from Devpost, 2026-11-11)

Sources: the hackathon overview, the Official Rules, and the Resources tab at kiroween.devpost.com. If anything in this file conflicts with the Official Rules, the Official Rules win. Rules may be amended during the window — re-verify before submitting.

### Dates (all Pacific Time)
- **Submission Period: Oct 30, 2026, 9:00 AM – Fri Dec 4, 2026, 2:00 PM.** No extensions; late submissions are not accepted.
- **Judging Period: Dec 16, 2026 – Jan 29, 2027.** The project must remain available **free of charge and without any restriction** for judge testing until the Judging Period ends; failure to provide access when requested may result in disqualification.
- Winners announced on or around Feb 3, 2027.

### Eligibility / entry shape
- Teams of at most 3. An individual may make multiple submissions, but each must be **unique and substantially different** from the entrant's others (not reskins or splits) — determined at Sponsor/Devpost discretion.
- One **main category** per submission; bonus prizes may stack on it. A project can win **one Overall OR one Category prize, plus any number of Bonus prizes**.
- All submission materials must be in English, or include an English translation.

### Project requirements (hard)
- A **working software application built using Kiro** (IDE, CLI, Web, and/or Kiro Crew). *"Insufficient use of Kiro will result in disqualification at the Judges' sole discretion."*
- **New projects only** — built during the Submission Period. Frameworks, libraries, and starter templates are allowed; **any other pre-existing code or work incorporated into the project must be disclosed** in the submission.
- **Functionality:** the project must be capable of being successfully installed and run consistently on the platform it is intended for, and must function as depicted in the video and text description.
- Third-party SDKs, APIs, and data may be used only when the entrant is authorized and complies with their terms/licenses.
- The submission must be the entrant's original work, solely owned, and must not violate any third party's IP or other rights.

### Repository requirements (hard)
- **Public GitHub repo** (NOT GitLab or BitBucket) containing **all** source code, assets, and instructions required for the project to be functional.
- An **open-source license file**, detectable and visible at the top of the repo page (About section).
- **`/.kiro` directory at the root of the project**, showing usage of specs, hooks, and steering. **Do NOT add the `/.kiro` directory or sub-folders to `.gitignore`, as this could disqualify the submission.**
- **Skeleton Crew only:** the repo must contain **2 separate repo folders for the 2 separate applications** (this entry's `apps/demo-video/` + `apps/slide-walkthrough/` layout satisfies this — keep them genuinely separate).

### Submission package (all items required)
- The category selected, plus any bonus prizes being claimed.
- **URL to the working app.** Any login credentials judges need go in the Devpost submission form (private, shown to judges only).
- **Text description** explaining the features and functionality of the project.
- **Demo video:** under **3 minutes** (judges are not required to watch beyond 3), uploaded to **YouTube and public**, showing the project working **on the device it was built for**, with **no third-party trademarks, copyrighted music, or other copyrighted material** unless the entrant has permission.
- **A write-up on how Kiro was used**, covering as applicable: Kiro IDE vs CLI vs Web vs Crew (and how they differed); custom agents; agent hooks (which workflows were automated and how they helped); spec-driven development (how specs were structured, and how it compared to vibe coding); steering docs; MCP; property-based testing; Kiro powers.

### How judging works (compliance → score)
- **Stage 1 is pass/fail:** the project reasonably fits the theme and reasonably applies the required tools.
- Judging **may use expert panels, peer review, and/or automated AI-driven analysis** of submissions — write the repo and `/.kiro` so a machine reader finds the evidence (real specs mapped to features, steering, hooks).
- **Stage 2:** five equally weighted criteria, **10 points each** — Potential Impact / Technological Implementation (how thoroughly, skillfully, and variously Kiro was used) / Design / Innovation / Presentation.

### Bonus prizes (exact requirements)
- **Bonus Blog Prize** — 2,000 Kiro credits, 100 winners, awarded to the **100 highest-scoring** qualifying submissions: a **public blog post about Kiro and the project on a third-party blog platform**, published **during the Submission Period**, that **mentions it is part of the Kiroween 2026 hackathon**; post URL added to the submission form.
- **Social Blitz Prize** — 3-month Kiro Pro+, 5 winners: a post on any social platform **during the Submission Period** that **starts with `#KiroweenHackathon26`**, shares your favorite thing about Kiro and how it changed how you approach development; URL added to the submission form. The Kiro team judges content quality — **original thoughts vs AI writing**, insights/learnings, and asset quality.
- **Best Demo** — $1,000, no extra steps: highest Presentation score among submissions in the **top 10% of overall scores**.
- **Best Student Project** — **NOT eligible for this entrant** (every team member must be a student). Do not claim it.
- **Best Startup / Best Ghost of Kiroween Past / Best Kiro Crew App** — claim only if their specific conditions are genuinely met (startup founder + LinkedIn + startup website / registered for Kiroween 2025 and verified / a separate public Kiro Crew app repo on GitHub).

### Credits
- The 4,000 free Kiro credits are a **one-time grant, one per entrant** (already obtained for these entries; ID verification via Didit was required). Request deadline Dec 1, 2026, 12:00 PM PT; **codes must be redeemed by Dec 4, 2026**; **redeemed credits expire Dec 31, 2026, 11:59 PM PT**.

### Code-level reminders for any agent working in this repo
- Never gitignore `/.kiro`; commit specs, steering, and hooks as the real work happens — they are judging evidence.
- Disclose any pre-existing or incorporated code in the submission text; keep third-party assets licensed and attributed in the repo.
- No unlicensed copyrighted material (music, trademarks, assets) in the shipped app or the demo video.
- The app must install and run on its intended platform exactly as the video and description depict — no vaporware features.
- Keep the project free and unrestricted for judges through Jan 29, 2027.

## Scope caps (these are what keep 3 deliverables shippable)
- Skeleton stays LEAN: the storyboard schema, **~5 fixed scene types** (title, feature/capture, callout/zoom, code-or-spec highlight, outro), the capture/asset step, one render step, one slide build step, and the Kiro layer. Anything only one output needs belongs in that app, not the skeleton.
- **No visual editor, no timeline UI.** The storyboard is a file (spec) you edit; Kiro drafts it, a human trims it. Building an editor kills this entry.
- Slide-walkthrough interactivity stays storybook-level: paging, hotspots/callouts, progress. No live embedding of the demoed project, no in-slide app simulation beyond the storyboard's own captures.
- Narration is captions / narration text (TTS optional if it comes free from the stack) — no voice pipeline work beyond that.
- No accounts, no project hosting, no saved history beyond local files. The input is one project + one storyboard per run.

## Acceptance checks
- [ ] One storyboard spec produces BOTH outputs (demo video + slide walkthrough) with no hand-editing of app code in between.
- [ ] Editing the storyboard (change a scene's text, reorder scenes) changes both outputs accordingly on a re-run.
- [ ] A demo for a sample project can be produced from `skeleton/` by following the skeleton README alone.
- [ ] Demo Video and Slide Walkthrough each run from their own folder, from the working URL(s) (walkthrough hosted; video app has a player/preview page), sharing visibly the same storyboard and scene primitives.
- [ ] Dogfood: the procedure produces a real demo for at least one other entry (e.g. Skinwalker or SpectreGram), and this entry's own submission video is produced by App A.

## Packaging checklist
- [ ] Public repo with the folder layout above + MIT license + `/.kiro`.
- [ ] Working URLs for BOTH apps.
- [ ] Demo video < 3 min, public YouTube — and it is itself App A's output: three clear acts: the skeleton + storyboard spec (~30s) → the rendered demo video playing (~60s) → the slide walkthrough being paged through (~60s).
- [ ] Devpost description + Kiro-usage write-up — for this entry the write-up is a scoring surface: specs, steering, hooks, and the draft-storyboard-from-a-project moment get named explicitly. Frame App B honestly as an interactive slide/storybook walkthrough, never as a live demo of the target project.
- [ ] Blog post (Bonus Blog prize) + one social post starting with `#KiroweenHackathon26`.

## Open decisions
1. App names final? (Skeleton name is DECIDED: SkeleTeller. Proposed app labels: SkeleTeller Reel / SkeleTeller Storybook — confirm before specs are written.)
2. Stack: render stack for the video app + one web stack for the slide app, sharing the single storyboard schema — confirm at spec time.
3. First dogfood project: this entry itself, or Skinwalker / SpectreGram first?

## How we work
Plan → Work → Assess → Compound. Lessons go into this file the moment they are earned; decisions update Open decisions the same session. Start order for the whole Kiroween board is THIS project first (longest pole); within it: skeleton (schema + scene primitives) → Demo Video (proves the render) → Slide Walkthrough (proves the second creature) → dogfood on a real project. The pre-pivot order (skeleton → PostMortem → Tarotomb) is superseded.
