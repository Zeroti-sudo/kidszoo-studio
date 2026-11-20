# Kidszoo studio — instructions for Claude

This repo is the production system for the **Kidszoo** YouTube channel (@Kidszoo-f8m, channel id `UC9Xdhe1mHcLqcLVzcpvBHhw`): original "Big Bro & Little Bro" cartoon Shorts for young children. The automation project name is "Zeroti Aautomation".

Read `CHARACTER_BIBLE.md` (look and personality, never break it), `RUNBOOK.md` (engine and episode JSON reference, safety rules, slate) and `PRODUCTION_LOG.md` (what already exists) before making anything.

## Hard rules
- Publish only to Kidszoo (YouTube `UC9Xdhe1mHcLqcLVzcpvBHhw`), through **vidIQ social posting** (owner decision, 18 Nov 2026: Metricool's Free plan only publishes 20 posts per calendar month). `vidiq_social_account_list` (platform YOUTUBE) must show that `platformAccountId` with `canPublish: true`; if not, stop and report. vidIQ lists the channel's old name "ZenAi" / @zenai100; the id is what counts. Metricool brand 7694204 is no longer used for publishing.
- **Daily auto-publish (owner decision, 20 Nov 2026, live chat: "Publish, don't wait for approval, do daily publish").** The scheduled daily run publishes each Short itself with `vidiq_social_post_publish`, scheduled for its slot, once it has passed `qa.py` *and* the contact-sheet review. No per-day owner approval is needed. Anything that fails a check is skipped, never published.
- "Made for kids": vidIQ has no per-video setting, so uploads follow the channel's default audience. The owner confirmed on 18 Nov 2026 that it is set to "Yes, made for kids" in YouTube Studio. If anything suggests it changed, stop and ask.
- Never publish a video that failed `qa.py` or looks wrong on its contact sheet. Skipping a slot is fine; a bad video is not.
- Never claim something was published without evidence (the vidIQ postId and the YouTube video id from `vidiq_social_post_status`).
- Don't regenerate or re-post an episode already in `PRODUCTION_LOG.md` or in `vidiq_social_post_list` (statuses scheduled, draft, completed).
- No paid generation (vidIQ video/music/voice, Lovable, etc.) without the owner's OK. The engine renders everything for free.
- Children's content: kind, safe, non-scary, no dangerous imitable stunts, no brands or real people, original everything. Always made for kids (see above).

## Environment facts (cloud session)
- Tools present: ffmpeg, python3 with numpy/scipy/PIL, node with global `playwright` (Chromium preinstalled — never run `playwright install`).
- The shell can't reach raw.githubusercontent.com. To check that a pushed video is publicly downloadable, call `vidiq_video_upload` with its raw URL (free). `status: ready` means the link works.
- Public video URL pattern: `https://raw.githubusercontent.com/Zeroti-sudo/kidszoo-studio/main/videos/<id>.mp4`
- Before pushing from a shallow clone: `git fetch origin main && git rebase origin/main`.

## Daily run (6 Shorts/day, slots 09:00, 11:00, 13:00, 15:00, 17:00 and 19:00 Asia/Calcutta; auto-published)
Owner decision, 21 Nov 2026: "need more videos and views". Raised from 4 to 6 a day, with the topic mix steered toward what the channel's numbers show gets watched. The channel name stays as the owner has it.

### Topic mix for each day's 6 (from real views as of 21 Nov 2026)
- Top Shorts: Hiccups 148, Pillow Fort 122, Freeze Dance 118, Who's TALLER 93, Birthday Surprise 91, Lost Sock 83, Paper Plane 71, Brushing Race 70. Weakest: Hide and Seek 4, Giant Bubble 8, Magic Word 9, Try the Broccoli 10, Copycat 10, Catch the Ball 12.
- Every day: **2 funny-body or mishap gags** (hiccups, sneezes, yawns, ticklish, sock on the head, silly mix-ups), **1 dance or move-along**, **1 build/make**, **1 surprise reveal or brother contest** (who's taller/faster/louder, a present, a box), **1 free choice** (a learning theme such as counting, colours or shapes is fine).
- Don't make manners or food lessons the main theme. If a lesson is needed, wrap it inside a big physical gag.
- **Sequels to hits are encouraged**: at most 1 a day, of a Short in the top list above, with new gags and a new title (e.g. "Freeze Dance 2", "The Sneezes" after "The Hiccups"). Never re-post an old video.
- Titles: lead with the funniest or most surprising word right after "Big Bro & Little Bro". Keep one emoji and #shorts.
- Update the top/weakest lists from the Sunday numbers each week.
1. Read the three docs. Call `vidiq_social_post_list` (platforms YOUTUBE, from today 00:00 to +2 days, Asia/Calcutta offset +05:30) and `vidiq_social_account_list`. Work out which of today's 09:00 / 11:00 / 13:00 / 15:00 / 17:00 / 19:00 slots are still free and in the future (if the run is late and a slot has passed, move that Short to the next free time at least 1 hour ahead, no later than 21:30; never schedule in the past). If no slots are free, go to step 8.
2. For each free slot (up to 6), write a NEW episode `episodes/epNNN_<slug>.json` (next number after the log) from an unused slate idea or a fresh idea that follows the story formula. The episodes of a day must all have different themes and follow the topic mix above. Copy the structure of `episodes/ep003_last_cupcake.json`. 18–25 s, hook caption by 0.2 s, 7–10 captions, a celebration ending and a short positive caption. Write `youtube.title` (≤ 70 chars, with "Big Bro"/"Little Bro" and #shorts, one emoji max), a description and tags.
3. If the story needs a prop that doesn't exist, add it to `PROPS` in `engine/engine.js` in the same style (thick #141414 outlines, flat bible colours). Don't touch `CAST` or `kidSVG` looks.
4. `bash engine/build.sh episodes/<file>.json`. It must print `"pass": true`. Then **Read `out/<id>/<id>_sheet.png` and actually check it**: the brothers on model, nothing cut off, props visible, captions readable and not covering faces, the story readable from the 12 frames. Fix the JSON and rebuild if needed (at most 3 attempts per episode; then drop it and log why).
5. Copy `out/<id>/<id>.mp4` to `videos/<id>.mp4`. Commit the episode JSON, video, log row and any engine change. Push to main.
6. `vidiq_video_upload` with the raw URL (must be `ready`; keep the `uploadId`). Then `vidiq_social_post_draft_create`: `media:[{type:"video", id:<uploadId>}]`, `text` = description, one destination `{platform:"YOUTUBE", platformAccountId:"UC9Xdhe1mHcLqcLVzcpvBHhw", title, privacyStatus:"public", categoryId:1 (Film & Animation), tags, publishAt:"<date>T<slot>:00+05:30"}`. The draft must come back `ready: true` (if not, fix it with `vidiq_social_post_draft_update`, or skip the slot).
7. Publish: right before publishing, call `vidiq_social_post_draft_update` with the postId and `publishAt` (the slot, still in the future; move it per step 1 if it has passed). `vidiq_social_post_draft_get` does not show the planned time, so always set it this way, and use the revision this update returns. Then `vidiq_social_post_publish` with postId and that revision, then `vidiq_social_post_status` (wait ~10 s between checks) until `completed`. The video uploads private and YouTube makes it public at `publishAt`. Log the YouTube id from `postUrl`, the postId and the slot in `PRODUCTION_LOG.md`, add the concepts to "Used concepts", commit and push. A failed publish, a vidIQ or YouTube posting limit, or YouTube "verification required" goes to the owner (PushNotification); if a limit is hit, stop publishing for the day.
8. Verify earlier posts: for log rows whose slot has passed, check `vidiq_social_post_status` and the channel's recent Shorts (`vidiq_channel_videos`, 5 credits, at most once per run) to confirm they are live. If a post failed, note it in the log and tell the owner.
9. Housekeeping: delete `videos/*.mp4` files older than 7 days whose posts are confirmed live (YouTube has the video).
10. Sundays only: `vidiq_channel_stats` (5 credits) plus views on the last 7 days' Shorts. Write 3 short lessons under "## Learnings" in `RUNBOOK.md` (best hook, best theme, weakest episode). Only use real numbers.
11. End with a short summary for the owner: what was published (titles, slots, YouTube ids) and anything skipped or failed. Push-notify only when something failed, was skipped or needs the owner.
