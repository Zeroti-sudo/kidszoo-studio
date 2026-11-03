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
- `actors.<id>`: `{kind:"kid", who:"big"|"little", init:{...}, keys:[...]}` or `{kind:"prop", type:"table|cupcake|tray|bulb|question|wand|bubble|pillow|flag|balloon|sock|toothbrush|hourglass|ball|block|toybox", ...}` (wand/pillow/balloon/sock/toothbrush take `color`, sock also `stripe`, bubble takes `r`, balloon takes `len` = string length; its origin is the string end, so attach it to a hand. Sock and toothbrush origins are the grip point; toothbrush head is 150 px up the handle). Ball: origin at the centre, `r` (default 48), `color`, `band`. Block: bottom-centre origin, `s` (edge, default 76), `color`, `letter`. Toybox: bottom-centre origin, 300×160; use two actors with `part:"back"` (layer back) and `part:"front"` (layer front) at the same x/y, and switch a dropped item to `layer:"back"` so it lands inside (see ep012). The arms are short: keep tosses between the brothers as high lobs and check that nothing crosses a face (ep011).
- A key `{t, d, e, ...props}` starts at `t` and reaches its values after `d` seconds (default 0.35) with ease `e` (io, out, in, back, lin). Text values (`eyes`, `brows`, `mouth`, `attach`, `layer`) switch at `t`.
- Kid props: x, y (feet, default 1590), sc (big 1.1, little 0.78), armL/armR (0 = down, 165 = up, negative = across to the mouth), jump, hop (bouncing), run (leg swing), lean, tilt, sq (squash), look (-1/1), eyes (open|happy|wide|closed), brows (normal|up|worried|angry), mouth (grin|smile|O|bigO|sad|flat|wobble|chew).
- Props: `attach:"big:R"` plus `ab` 0→1 blends the prop into a hand; `attach:"little:H"` pins it to the top of the head (hats, a sock on the head); `layer` back|front.
- Brushing pose: brush in the outer hand, arm `-124` (crossed to the mouth), brush `rot` ±90 with `ox` ±50 so the head sits on the mouth; oscillate the arm ±7° (see ep010).
- Camera keys: z (1.25 is the default framing), cx, cy (clamped to the set), shake.
- fx: burst (comic text), hearts, sparkle, confetti, lines. sfx: pop, pops, boing, whoosh, ding, idea, chime, sparkle, tada, sad, nom, crunch, clap, drumroll, scrub (brushing, takes `dur`).
- Captions: `{t0,t1,text,size,y}`; `{word}` is highlighted yellow; `\n` breaks the line.

## Safety and compliance rules (every episode)
- Original characters, stories, music and effects only. No real children, voices or brands.
- No dangerous or imitable stunts, no scary content, no mean-spirited endings. Conflict between the brothers always resolves kindly.
- YouTube: `madeForKids: true`. Category Film & Animation. Honest titles with no clickbait claims. One or two emoji at most, plus #shorts.
- Animated, clearly non-realistic content doesn't need YouTube's altered or synthetic disclosure. Re-check if realistic AI footage is ever added.

## Episode slate (unused)
1. ~~Balloon Tower~~ (made as ep007 Balloon Bop)
2. ~~Who's Taller?~~ (made as ep008)
4. ~~The Lost Sock~~ (made as ep009: the sock was on his head)
5. Mango Mystery — one mango, two brothers; Mom cuts it into a flower.
6. Kite Day (window set) — the kite gets stuck and the brothers team up.
8. ~~Brushing Race~~ (made as ep010)
9. Birthday Surprise — the brothers secretly make a card for Mom (uses the Mom puppet when ready).

## Learnings
(Filled in weekly from real channel numbers.)

### Week ending Sun 1 Nov 2026 (vidIQ, pulled 1 Nov ~04:40 IST)
Channel: 408 subscribers (0 gained this week), 4 Shorts live. Sample is tiny, so treat these as hunches, not rules.
- **Best hook:** ep004 Copycat Game ("COPYCAT game!" + both brothers cheering) had 3 views and 1 like after ~24 h, against 1 view and 0 likes for ep003 LAST Cupcake after ~18 h. A playful action hook did a little better than a food/conflict hook so far.
- **Best theme:** ep001 balloon pop leads with 16 views (4 days live), then ep002 hungry brothers with 6. Simple physical-comedy themes (popping, bouncing) are the early leader; keep Balloon Tower and bubble/pop payoffs in rotation.
- **Weakest episode:** ep003 LAST Cupcake, 1 view after ~18 h (16:00 slot). Too early to blame the theme; re-check next Sunday whether the 16:00 slot underperforms the 10:00 slot.
- Note: YouTube currently lists the channel topic as "Video game culture", which doesn't match the content. Consistent kids-cartoon titles and tags should correct it over time.
