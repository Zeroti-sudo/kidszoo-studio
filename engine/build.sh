#!/usr/bin/env bash
# Build one Kidszoo Short from an episode script:  ./build.sh ../episodes/ep003_last_cupcake.json
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
EP="$(realpath "$1")"
ID="$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['id'])" "$EP")"
OUT="$HERE/../out/$ID"; mkdir -p "$OUT"
echo "== render video";  node "$HERE/render.js" "$EP" "$OUT/video.mp4"
echo "== render audio";  python3 "$HERE/audio.py" "$EP" "$OUT/audio.wav"
echo "== mux + loudness"
ffmpeg -y -loglevel error -i "$OUT/video.mp4" -i "$OUT/audio.wav" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$OUT/$ID.mp4"
ffmpeg -y -loglevel error -ss 12.3 -i "$OUT/$ID.mp4" -frames:v 1 -q:v 3 "$OUT/${ID}_thumb.jpg"
echo "== QA";            python3 "$HERE/qa.py" "$OUT/$ID.mp4" "$EP" | tee "$OUT/qa.json"
