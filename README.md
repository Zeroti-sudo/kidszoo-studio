# kidszoo-studio

Production system for the **Kidszoo** YouTube channel: original *Big Bro & Little Bro* cartoon Shorts.

- `engine/`: SVG puppet animation engine, procedural music and sound effects, build pipeline and QA
- `episodes/`: one JSON script per Short
- `videos/`: finished Shorts (public links used for scheduling)
- `CHARACTER_BIBLE.md`, `RUNBOOK.md`, `PRODUCTION_LOG.md`, `CLAUDE.md`: how the series and the daily run work

Build one Short: `bash engine/build.sh episodes/ep003_last_cupcake.json` (needs ffmpeg, python3 + numpy/scipy/Pillow, node + playwright).
