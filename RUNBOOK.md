# Zeroti Aautomation — Kidszoo Production Runbook

Status as of 31 Oct 2026. Covers what has actually been built and tested, and what isn't connected yet.

## Status

| Stage | Status | How it works |
|---|---|---|
| Character bible | Done | `CHARACTER_BIBLE.md`, built from the two published Shorts |
| Script and storyboard | Done | Each episode is one JSON file (`episodes/*.json`): beats, keyframed acting, captions, effects, sound effects, metadata |
| Animation render | Done, tested | `engine/stage.html` + `engine.js` (SVG puppet rigs). `render.js` renders it frame by frame with headless Chromium into 1080×1920 30 fps H.264. About 60 s per 22 s Short |
| Music and sound effects | Done, tested | `engine/audio.py`. Original procedural music plus synthesized effects. No samples, so no licensing issues |
| Edit, mix, loudness | Done, tested | `build.sh`: mux, loudnorm to -14 LUFS / -1.5 dBTP, AAC 192k, faststart |
| Technical QA | Done, tested | `qa.py`: 13 automatic checks. A failing video is never queued |
| Visual QA | Done, run by Claude | Contact sheet of 12 stills per episode, checked against the bible before publishing |
| Publish to YouTube | Scheduling tested | MP4 committed to `videos/`, public raw GitHub URL, then Metricool brand 7694204 (linked to Kidszoo UC9Xdhe1mHcLqcLVzcpvBHhw) `createScheduledPost`. Metricool copies the file at scheduling time. First post: ep003, id 411632886, 31 Oct 16:00 IST |
| Daily scheduler | Set up | Claude scheduled task runs a fresh session daily at 04:23 IST and follows `CLAUDE.md` → 2 Shorts in the 10:00 and 16:00 IST slots |
| Repo size | Watch | Each Short is about 5 MB in git history (~300 MB/month). Delete old videos after they're live. Near 1 GB, ask the owner whether to move video hosting elsewhere |
| Analytics | Available | vidIQ `channel_stats` / `channel_videos` (5 credits each) and Metricool analytics |

## Why the brothers are rendered in code instead of with AI video
- The existing Kidszoo style is 2D cutout vector animation. A code rig draws exactly the same brothers in every frame. AI video models drift in faces and clothes from shot to shot.
- vidIQ video generation costs 20 credits per second of output. This account has 150 credits per month (free plan, renews 27 Nov). One 20-second AI Short would need about 400 credits; 3 a day would need about 45,000 a month. Rendering in code costs 0 credits.
- Mixing in AI clips later (e.g. an establishing shot) is still possible if the vidIQ plan is upgraded.

## Daily production loop (what the scheduled run does)
1. Read the bible, this runbook and `production-log.md`, and check Metricool `getScheduledPosts` so nothing is made or posted twice.
2. Pick 2–4 unused concepts from the slate. Rotate themes; no theme twice in a row.
3. Write each episode JSON with the story formula: hook (0–2 s) → challenge → funny escalation → warm or surprising payoff → celebration plus a short moral caption. 18–25 s.
4. `engine/build.sh episodes/<id>.json`. QA must pass, then review the 12-still contact sheet. If anything fails, fix the JSON and rebuild (at most 3 tries), otherwise skip that episode and log it.
5. Host the MP4, then Metricool `createScheduledPost`: network youtube, type short, `madeForKids: true`, category FILM_ANIMATION, slots in Asia/Calcutta.
6. Append every attempt to `production-log.md`: episode id, title, QA result, Metricool post id, planned time, and the YouTube video id once live.
7. Weekly: pull Kidszoo stats and adjust the theme rotation. Never invent numbers.

## Episode JSON cheat sheet
- `actors.<id>`: `{kind:"kid", who:"big"|"little", init:{...}, keys:[...]}` or `{kind:"prop", type:"table|cupcake|tray|bulb|question|wand|bubble|pillow|flag", ...}` (wand/pillow take `color`, bubble takes `r`).
- A key `{t, d, e, ...props}` starts at `t` and reaches its values after `d` seconds (default 0.35) with ease `e` (io, out, in, back, lin). Text values (`eyes`, `brows`, `mouth`, `attach`, `layer`) switch at `t`.
- Kid props: x, y (feet, default 1590), sc (big 1.1, little 0.78), armL/armR (0 = down, 165 = up, negative = across to the mouth), jump, hop (bouncing), run (leg swing), lean, tilt, sq (squash), look (-1/1), eyes (open|happy|wide|closed), brows (normal|up|worried|angry), mouth (grin|smile|O|bigO|sad|flat|wobble|chew).
- Props: `attach:"big:R"` plus `ab` 0→1 blends the prop into a hand; `layer` back|front.
- Camera keys: z (1.25 is the default framing), cx, cy (clamped to the set), shake.
- fx: burst (comic text), hearts, sparkle, confetti, lines. sfx: pop, pops, boing, whoosh, ding, idea, chime, sparkle, tada, sad, nom, crunch, clap, drumroll.
- Captions: `{t0,t1,text,size,y}`; `{word}` is highlighted yellow; `\n` breaks the line.

## Safety and compliance rules (every episode)
- Original characters, stories, music and effects only. No real children, voices or brands.
- No dangerous or imitable stunts, no scary content, no mean-spirited endings. Conflict between the brothers always resolves kindly.
- YouTube: `madeForKids: true`. Category Film & Animation. Honest titles with no clickbait claims. One or two emoji at most, plus #shorts.
- Animated, clearly non-realistic content doesn't need YouTube's altered or synthetic disclosure. Re-check if realistic AI footage is ever added.

## Episode slate (unused)
1. Balloon Tower — each brother stacks balloons; the tower floats away; they share the last balloon.
2. Who's Taller? — Little Bro stands on tiptoes, then a cushion; Big Bro kneels to make it a tie.
4. The Lost Sock — Little Bro hunts for his teal sock; it turns out he's wearing two on one foot.
5. Mango Mystery — one mango, two brothers; Mom cuts it into a flower.
6. Kite Day (window set) — the kite gets stuck and the brothers team up.
8. Brushing Race — tooth-brushing race with a "2 minutes" sparkle timer (healthy-habit moral).
9. Birthday Surprise — the brothers secretly make a card for Mom (uses the Mom puppet when ready).

## Learnings
(Filled in weekly from real channel numbers.)
