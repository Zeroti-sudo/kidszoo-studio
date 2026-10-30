// Usage:
//   node render.js episode.json out.mp4            -> silent video, 1080x1920 @ fps
//   node render.js episode.json --stills dir t1,t2 -> PNG stills for QA
'use strict';
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [epPath, out, extra] = process.argv.slice(2);
  const ep = JSON.parse(fs.readFileSync(epPath, 'utf8'));
  const fps = ep.fps || 30;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + path.resolve(__dirname, 'stage.html'));
  await page.evaluate(e => window.loadEpisode(e), ep);
  await page.evaluate(() => document.fonts.ready);
  const svg = await page.$('#stage');

  if (out === '--stills') {
    const dir = extra.split(':')[0], times = extra.split(':')[1].split(',').map(Number);
    fs.mkdirSync(dir, { recursive: true });
    for (const t of times) {
      await page.evaluate(t => window.renderAt(t), t);
      await svg.screenshot({ path: path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`) });
    }
  } else {
    const N = Math.round(ep.duration * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < N; i++) {
      await page.evaluate(t => window.renderAt(t), i / fps);
      const buf = await svg.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) process.stderr.write(`frame ${i}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
    }
    ff.stdin.end();
    const code = await new Promise(r => ff.on('close', r));
    if (code !== 0) errors.push('ffmpeg exit ' + code);
  }
  await browser.close();
  if (errors.length) { console.error('RENDER ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('ok');
})();
