# Kidszoo studio — instructions for Claude

This repo is the production system for the **Kidszoo** YouTube channel (@Kidszoo-f8m, channel id `UC9Xdhe1mHcLqcLVzcpvBHhw`): original "Big Bro & Little Bro" cartoon Shorts for young children. The automation project name is "Zeroti Aautomation".

Read `CHARACTER_BIBLE.md` (look and personality, never break it), `RUNBOOK.md` (engine and episode JSON reference, safety rules, slate) and `PRODUCTION_LOG.md` (what already exists) before making anything.

## Hard rules
- Publish only to Kidszoo, through Metricool brand `blogId` **7694204** (its YouTube is `UC9Xdhe1mHcLqcLVzcpvBHhw`). If `getBrandSettings` doesn't show that YouTube id, stop and report.
- Never publish a video that failed `qa.py` or looks wrong on its contact sheet. Skipping a slot is fine; a bad video is not.
- Never claim something was published without evidence (the Metricool post id, then a YouTube video id once live).
- Don't regenerate or re-post an episode already in `PRODUCTION_LOG.md` or in Metricool `getScheduledPosts`.
- No paid generation (vidIQ video/music/voice, Lovable, etc.) without the owner's OK. The engine renders everything for free.
- Children's content: kind, safe, non-scary, no dangerous imitable stunts, no brands or real people, original everything. `madeForKids: true` always.

## Environment facts (cloud session)
- Tools present: ffmpeg, python3 with numpy/scipy/PIL, node with global `playwright` (Chromium preinstalled — never run `playwright install`).
- The shell can't reach raw.githubusercontent.com. To check that a pushed video is publicly downloadable, call `vidiq_video_upload` with its raw URL (free). `status: ready` means the link works.
- Public video URL pattern: `https://raw.githubusercontent.com/Zeroti-sudo/kidszoo-studio/main/videos/<id>.mp4`
- Before pushing from a shallow clone: `git fetch origin main && git rebase origin/main`.

## Daily run (2 Shorts/day, auto-publish, slots 10:00 and 16:00 Asia/Calcutta)
1. Read the three docs. Call Metricool `getScheduledPosts` (blogId 7694204, tz Asia/Calcutta, today to +2 days). Work out which of today's 10:00 / 16:00 slots are still free and in the future (if the run is late and a slot has passed, use 19:00 instead; never schedule in the past). If no slots are free, go to step 8.
2. For each free slot, write a NEW episode `episodes/epNNN_<slug>.json` (next number after the log) from an unused slate idea or a fresh idea that follows the story formula. Copy the structure of `episodes/ep003_last_cupcake.json`. 18–25 s, hook caption by 0.2 s, 7–10 captions, a celebration ending and a short positive caption. Write `youtube.title` (≤ 70 chars, with "Big Bro"/"Little Bro" and #shorts, one emoji max), a description and tags.
3. If the story needs a prop that doesn't exist, add it to `PROPS` in `engine/engine.js` in the same style (thick #141414 outlines, flat bible colours). Don't touch `CAST` or `kidSVG` looks.
4. `bash engine/build.sh episodes/<file>.json`. It must print `"pass": true`. Then **Read `out/<id>/<id>_sheet.png` and actually check it**: the brothers on model, nothing cut off, props visible, captions readable and not covering faces, the story readable from the 12 frames. Fix the JSON and rebuild if needed (at most 3 attempts per episode; then drop it and log why).
5. Copy `out/<id>/<id>.mp4` to `videos/<id>.mp4`. Commit the episode JSON, video, log row and any engine change. Push to main.
6. Check the URL with `vidiq_video_upload` (must be `ready`). Then Metricool `createScheduledPost` for that slot: `providers:[{"network":"youtube"}]`, `media:[raw URL]`, `text` = description, `youtubeData: {title, type:"short", privacy:"public", tags, category:"FILM_ANIMATION", madeForKids:true, isAiGeneratedContent:false}`, autoPublish true, publicationDate in Asia/Calcutta.
7. Record the Metricool post id and slot in `PRODUCTION_LOG.md`, add the concept to "Used concepts", commit and push.
8. Verify earlier posts: for log rows still marked `pending` whose slot has passed, check Metricool (no longer in `getScheduledPosts`) and the channel's recent Shorts (`vidiq_channel_videos`, 5 credits, at most once per run) to fill in the YouTube id. If a post failed, note it in the log and tell the owner.
9. Housekeeping: delete `videos/*.mp4` files older than 7 days whose posts are confirmed live (Metricool keeps its own copy).
10. Sundays only: `vidiq_channel_stats` (5 credits) plus views on the last 7 days' Shorts. Write 3 short lessons under "## Learnings" in `RUNBOOK.md` (best hook, best theme, weakest episode). Only use real numbers.
11. End with a short summary for the owner: what was scheduled (titles and times), anything skipped or failed, and links to the Metricool planner.
