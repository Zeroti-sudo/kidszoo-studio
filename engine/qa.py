"""Automated technical QA for a finished Kidszoo Short. Exit code 1 on any failure.
Usage: python3 qa.py final.mp4 episode.json
"""
import json, re, subprocess, sys

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def main(mp4, ep_path):
    ep = json.load(open(ep_path))
    info = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', mp4]).stdout)
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    a = [s for s in info['streams'] if s['codec_type'] == 'audio']
    dur = float(info['format']['duration'])
    num, den = map(int, v['r_frame_rate'].split('/'))
    loud = run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', loud)[-1])
    TP = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', loud)[-1])
    yt = ep.get('youtube', {})
    checks = [
        ('container mp4/h264', v['codec_name'] == 'h264'),
        ('resolution 1080x1920', (v['width'], v['height']) == (1080, 1920)),
        ('frame rate 30', abs(num / den - 30) < 0.01),
        ('duration 15-60s', 15 <= dur <= 60),
        ('duration matches script', abs(dur - ep['duration']) < 0.5),
        ('audio track present (aac)', len(a) == 1 and a[0]['codec_name'] == 'aac'),
        ('loudness -16..-12 LUFS', -16 <= I <= -12),
        ('true peak <= -1 dBTP', TP <= -1.0),
        ('title 1-100 chars', 0 < len(yt.get('title', '')) <= 100),
        ('description present', len(yt.get('description', '')) > 40),
        ('madeForKids set', yt.get('madeForKids') is True),
        ('captions cover video', max(c['t1'] for c in ep['captions']) >= ep['duration'] - 3),
        ('hook caption in first 2s', min(c['t0'] for c in ep['captions']) <= 2.0),
    ]
    report = {'file': mp4, 'duration': round(dur, 2), 'lufs': I, 'true_peak': TP,
              'checks': {k: bool(ok) for k, ok in checks}}
    report['pass'] = all(report['checks'].values())
    print(json.dumps(report, indent=1))
    sys.exit(0 if report['pass'] else 1)

if __name__ == '__main__':
    main(*sys.argv[1:3])
