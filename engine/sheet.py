"""Render 12 evenly spaced stills from an episode and tile them into one contact sheet for visual QA.
Usage: python3 sheet.py episode.json out.png
"""
import glob, json, os, subprocess, sys, tempfile
from PIL import Image

ep_path, out = sys.argv[1], sys.argv[2]
D = json.load(open(ep_path))['duration']
times = [round(0.4 + i * (D - 0.8) / 11, 2) for i in range(12)]
tmp = tempfile.mkdtemp()
here = os.path.dirname(os.path.abspath(__file__))
subprocess.run(['node', os.path.join(here, 'render.js'), ep_path, '--stills', tmp + ':' + ','.join(map(str, times))], check=True)
ims = [Image.open(f).resize((270, 480)) for f in sorted(glob.glob(tmp + '/*.png'))]
sheet = Image.new('RGB', (270 * 6, 480 * 2), 'white')
for i, im in enumerate(ims):
    sheet.paste(im, ((i % 6) * 270, (i // 6) * 480))
sheet.save(out)
print('ok', out, times)
