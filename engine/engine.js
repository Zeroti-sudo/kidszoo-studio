// Kidszoo puppet engine — deterministic: renderAt(t) draws the exact frame for time t.
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const OL = '#141414';          // outline colour
const SW = 8;                  // outline width
const SKIN = '#B8734C', HAIR = '#1A1A1A', MOUTH = '#8B1E2D', TONGUE = '#E35D6A', BLUSH = '#F28B82';
const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const EASE = {
  lin: p => p,
  in: p => p * p * p,
  out: p => 1 - Math.pow(1 - p, 3),
  io: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  back: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  step: p => (p < 1 ? 0 : 1),
};
function rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------------------------------------------------------------- characters
const CAST = {
  big: { shirt: '#2970E6', collar: '#1E58BE', shorts: '#1B3A6B', trim: '#5C8FE6', shoe: '#D83838', band: null,
         stripes: true, star: false, hair: 'bowl', headScale: 1.0 },
  little: { shirt: '#F25C3B', collar: '#C9442A', shorts: '#2CA58D', trim: '#F5E050', shoe: '#2CA58D', band: '#FCD34D',
            stripes: false, star: true, hair: 'spiky', headScale: 1.16 },
};

function starPath(cx, cy, R, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}

function kidSVG(id, k) {
  const o = `stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
  const leg = (cx, side) => `
    <g id="${id}-leg${side}">
      <rect x="${cx - 17}" y="-152" width="34" height="100" rx="12" fill="${SKIN}" ${o}/>
      <rect x="${cx - 19}" y="-62" width="38" height="28" rx="8" fill="#FFFFFF" ${o}/>
      <path d="M${cx - 46},-8 Q${cx - 48},-44 ${cx},-44 Q${cx + 50},-44 ${cx + 52},-8 Z" fill="${k.shoe}" ${o}/>
      ${k.band ? `<rect x="${cx - 40}" y="-34" width="84" height="10" fill="${k.band}" stroke="${OL}" stroke-width="4"/>` : `<ellipse cx="${cx + (side === 'L' ? -30 : 30)}" cy="-18" rx="14" ry="9" fill="#FFFFFF" stroke="${OL}" stroke-width="4"/>`}
      <rect x="${cx - 52}" y="-14" width="106" height="16" rx="8" fill="#FFFFFF" ${o}/>
    </g>`;
  const arm = side => {
    const sx = side === 'L' ? -94 : 94;
    return `<g id="${id}-arm${side}" data-sx="${sx}">
      <rect x="${sx - 17}" y="-350" width="34" height="132" rx="17" fill="${SKIN}" ${o}/>
      <circle id="${id}-hand${side}" cx="${sx}" cy="-210" r="27" fill="${SKIN}" ${o}/>
      <path d="M${sx - 30},-392 Q${sx},-410 ${sx + 30},-392 L${sx + 28},-318 Q${sx},-308 ${sx - 28},-318 Z" fill="${k.shirt}" ${o}/>
    </g>`;
  };
  const shirtD = 'M-78,-402 Q-102,-402 -102,-372 L-98,-226 Q-98,-214 -86,-214 L86,-214 Q98,-214 98,-226 L102,-372 Q102,-402 78,-402 Z';
  const hair = k.hair === 'bowl'
    ? `<path d="M-140,-538 C-154,-708 154,-708 140,-538 Q141,-572 122,-590 Q72,-604 34,-588 Q-18,-612 -92,-596 Q-130,-588 -140,-538 Z" fill="${HAIR}" ${o}/>`
    : `<path d="M-38,-652 L-30,-712 L-6,-664 L14,-722 L28,-660 L50,-700 L52,-646 Z" fill="${HAIR}" ${o}/>
       <path d="M-140,-536 C-154,-704 154,-704 140,-536 Q138,-570 118,-586 L96,-604 L78,-584 L56,-608 L34,-586 L10,-610 L-14,-588 L-38,-608 L-62,-588 L-88,-606 Q-128,-588 -140,-536 Z" fill="${HAIR}" ${o}/>`;
  return `
  <g id="${id}">
    <g id="${id}-body">
      ${leg(-40, 'L')}${leg(40, 'R')}
      <g id="${id}-upper">
        <path d="M-94,-238 L94,-238 L102,-138 L8,-138 L0,-176 L-8,-138 L-102,-138 Z" fill="${k.shorts}" ${o}/>
        <path d="M-100,-160 L-6,-160 L-8,-138 L-102,-138 Z" fill="${k.trim}" stroke="${OL}" stroke-width="5"/>
        <path d="M100,-160 L6,-160 L8,-138 L102,-138 Z" fill="${k.trim}" stroke="${OL}" stroke-width="5"/>
        <rect x="-24" y="-424" width="48" height="34" fill="${SKIN}" ${o}/>
        <clipPath id="${id}-shirtclip"><path d="${shirtD}"/></clipPath>
        <path d="${shirtD}" fill="${k.shirt}"/>
        <g clip-path="url(#${id}-shirtclip)">
          ${k.stripes ? `<rect x="-110" y="-334" width="220" height="24" fill="#F6C343"/><rect x="-110" y="-306" width="220" height="14" fill="#FFFFFF"/>` : ''}
        </g>
        ${k.star ? `<path d="${starPath(0, -304, 50, 22)}" fill="#FCD34D" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>` : ''}
        <path d="${shirtD}" fill="none" ${o}/>
        <path d="M-36,-401 Q0,-372 36,-401" fill="none" stroke="${k.collar}" stroke-width="12" stroke-linecap="round"/>
        ${arm('L')}${arm('R')}
        <g id="${id}-head">
          <circle cx="-128" cy="-532" r="25" fill="${SKIN}" ${o}/>
          <circle cx="128" cy="-532" r="25" fill="${SKIN}" ${o}/>
          <ellipse cx="0" cy="-540" rx="134" ry="124" fill="${SKIN}" ${o}/>
          ${hair}
          <ellipse cx="-88" cy="-488" rx="21" ry="11" fill="${BLUSH}" opacity=".6"/>
          <ellipse cx="88" cy="-488" rx="21" ry="11" fill="${BLUSH}" opacity=".6"/>
          <g id="${id}-face"></g>
        </g>
      </g>
    </g>
  </g>`;
}

function eye(cx, cy, kind, look) {
  const st = `stroke="${OL}" stroke-width="9" stroke-linecap="round" fill="none"`;
  const lx = look * 7;
  switch (kind) {
    case 'happy': return `<path d="M${cx - 21},${cy + 7} Q${cx},${cy - 22} ${cx + 21},${cy + 7}" ${st}/>`;
    case 'closed': return `<path d="M${cx - 21},${cy} Q${cx},${cy + 11} ${cx + 21},${cy}" ${st}/>`;
    case 'wide': return `<ellipse cx="${cx}" cy="${cy}" rx="26" ry="32" fill="#fff" stroke="${OL}" stroke-width="6"/>
      <ellipse cx="${cx + lx}" cy="${cy + 2}" rx="13" ry="16" fill="${OL}"/><circle cx="${cx + lx + 5}" cy="${cy - 5}" r="5" fill="#fff"/>`;
    default: return `<ellipse cx="${cx + lx}" cy="${cy}" rx="19" ry="26" fill="${OL}"/><circle cx="${cx + lx + 6}" cy="${cy - 9}" r="7" fill="#fff"/>`;
  }
}
function brow(cx, by, kind, side) {
  const st = `stroke="${OL}" stroke-width="9" stroke-linecap="round" fill="none"`;
  const s = side; // -1 left eye, +1 right eye ; inner end is toward 0
  const inner = cx - s * 20, outer = cx + s * 20;
  switch (kind) {
    case 'up': return `<path d="M${outer},${by - 10} Q${cx},${by - 26} ${inner},${by - 10}" ${st}/>`;
    case 'worried': return `<path d="M${outer},${by + 4} L${inner},${by - 12}" ${st}/>`;
    case 'angry': return `<path d="M${outer},${by - 8} L${inner},${by + 8}" ${st}/>`;
    default: return `<path d="M${outer},${by + 2} Q${cx},${by - 8} ${inner},${by + 2}" ${st}/>`;
  }
}
function mouth(kind, t) {
  const st = `stroke="${OL}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === 'chew') kind = (Math.floor(t * 7) % 2) ? 'chewO' : 'chewC';
  switch (kind) {
    case 'smile': return `<path d="M-44,-494 Q0,-436 44,-494 Z" fill="${MOUTH}" ${st}/><path d="M-30,-490 L30,-490 L28,-480 L-28,-480 Z" fill="#fff"/><ellipse cx="0" cy="-462" rx="17" ry="7" fill="${TONGUE}"/>`;
    case 'O': return `<ellipse cx="0" cy="-470" rx="20" ry="25" fill="${MOUTH}" ${st}/>`;
    case 'bigO': return `<ellipse cx="0" cy="-468" rx="30" ry="38" fill="${MOUTH}" ${st}/><ellipse cx="0" cy="-448" rx="15" ry="8" fill="${TONGUE}"/>`;
    case 'sad': return `<path d="M-32,-458 Q0,-492 32,-458" fill="none" ${st}/>`;
    case 'flat': return `<path d="M-26,-474 L26,-474" fill="none" ${st}/>`;
    case 'wobble': return `<path d="M-32,-472 Q-20,-484 -8,-472 Q4,-460 16,-472 Q26,-482 34,-474" fill="none" ${st}/>`;
    case 'chewO': return `<ellipse cx="0" cy="-474" rx="24" ry="14" fill="${MOUTH}" ${st}/>`;
    case 'chewC': return `<path d="M-28,-480 Q-14,-466 0,-478 Q14,-466 28,-480" fill="none" ${st}/>`;
    default: return `<path d="M-40,-490 Q0,-452 40,-490" fill="none" ${st}/>`; // grin
  }
}

// ---------------------------------------------------------------- props
const PROPS = {
  table: () => `<g>
      <ellipse cx="0" cy="206" rx="86" ry="18" fill="#E07A5F" stroke="${OL}" stroke-width="${SW}"/>
      <rect x="-18" y="10" width="36" height="196" fill="#F2A07B" stroke="${OL}" stroke-width="${SW}"/>
      <ellipse cx="0" cy="14" rx="156" ry="34" fill="#E07A5F" stroke="${OL}" stroke-width="${SW}"/>
      <ellipse cx="0" cy="0" rx="156" ry="34" fill="#F7B38F" stroke="${OL}" stroke-width="${SW}"/></g>`,
  cupcake: (p) => {
    const clip = p.half ? `clip-path="url(#half${p.half})"` : '';
    return `<g ${clip}>
      <path d="M-58,-72 L58,-72 L42,0 L-42,0 Z" fill="#1EA7FD" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-30,-68 L-24,-4 M0,-68 L0,-4 M30,-68 L24,-4" stroke="#0E7CC4" stroke-width="6"/>
      <path d="M-66,-70 Q-78,-104 -46,-112 Q-56,-150 -14,-148 Q0,-182 26,-150 Q66,-152 52,-112 Q82,-104 66,-70 Q0,-58 -66,-70 Z" fill="#FF8FC7" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="-34" y="-104" width="14" height="6" rx="3" fill="#FFD13B" transform="rotate(-20 -27 -101)"/>
      <rect x="10" y="-128" width="14" height="6" rx="3" fill="#2CA58D" transform="rotate(25 17 -125)"/>
      <rect x="28" y="-94" width="14" height="6" rx="3" fill="#2B60DE" transform="rotate(-35 35 -91)"/>
      <rect x="-10" y="-90" width="14" height="6" rx="3" fill="#FF7828" transform="rotate(10 -3 -87)"/>
      ${p.half ? '' : `<path d="M4,-176 Q12,-198 26,-204" stroke="#2E7D32" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="2" cy="-164" r="17" fill="#E53935" stroke="${OL}" stroke-width="6"/><circle cx="-4" cy="-170" r="5" fill="#fff"/>`}
      </g>`;
  },
  tray: () => {
    let s = `<ellipse cx="0" cy="0" rx="190" ry="38" fill="#CFD8E3" stroke="${OL}" stroke-width="${SW}"/>
             <ellipse cx="0" cy="-6" rx="160" ry="26" fill="#E8EEF5"/>`;
    const spots = [[-110, -4], [0, -4], [110, -4], [-55, -40], [55, -40]].sort((a, b) => a[1] - b[1]);
    for (const [x, y] of spots) s += `<g transform="translate(${x},${y}) scale(.62)">${PROPS.cupcake({})}</g>`;
    return `<g>${s}</g>`;
  },
  bulb: () => `<g>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = (-150 + i * 20) * Math.PI / 180; return `<path d="M${(78 * Math.cos(a)).toFixed(1)},${(-40 + 78 * Math.sin(a)).toFixed(1)} L${(108 * Math.cos(a)).toFixed(1)},${(-40 + 108 * Math.sin(a)).toFixed(1)}" stroke="#FFC300" stroke-width="10" stroke-linecap="round"/>`; }).join('')}
      <circle cx="0" cy="-40" r="56" fill="#FFE45C" stroke="${OL}" stroke-width="${SW}"/>
      <rect x="-24" y="10" width="48" height="34" rx="6" fill="#9AA5B1" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M-14,-30 Q0,-60 14,-30" stroke="#FF9F1C" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
  // bubble wand: grip at the origin (attach to a hand), ring at (0,-140)
  wand: (p) => { const c = p.color || '#9B5DE5'; return `<g>
      <rect x="-9" y="-112" width="18" height="122" rx="9" fill="${c}" stroke="${OL}" stroke-width="6"/>
      <circle cx="0" cy="-140" r="32" fill="#D6F1FF" fill-opacity=".55" stroke="${OL}" stroke-width="22"/>
      <circle cx="0" cy="-140" r="32" fill="none" stroke="${c}" stroke-width="9"/></g>`; },
  // soap bubble: radius p.r (default 60) so big bubbles keep the same outline width
  bubble: (p) => { const r = p.r || 60; return `<g>
      <circle cx="0" cy="0" r="${r}" fill="#BDE8FF" fill-opacity=".42" stroke="${OL}" stroke-width="6"/>
      <circle cx="0" cy="0" r="${r - 7}" fill="none" stroke="#FF8FC7" stroke-opacity=".45" stroke-width="5" stroke-dasharray="${(r * 1.2).toFixed(0)} ${(r * 2.2).toFixed(0)}"/>
      <path d="M${-r * .62},${-r * .2} Q${-r * .55},${-r * .62} ${-r * .18},${-r * .7}" stroke="#FFFFFF" stroke-width="${Math.max(6, r * .13).toFixed(0)}" fill="none" stroke-linecap="round"/>
      <circle cx="${r * .42}" cy="${r * .4}" r="${Math.max(4, r * .1).toFixed(0)}" fill="#FFFFFF"/></g>`; },
  // floor cushion, about 192 x 96, centred on the origin; colour p.color
  pillow: (p) => { const c = p.color || '#1EA7FD'; return `<g>
      <path d="M-92,-38 Q-100,-52 -84,-48 Q0,-34 84,-48 Q100,-52 92,-38 Q100,0 92,38 Q100,52 84,48 Q0,34 -84,48 Q-100,52 -92,38 Q-100,0 -92,-38 Z" fill="${c}" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-58,-20 Q0,-10 58,-20" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="6" r="9" fill="#FFFFFF" stroke="${OL}" stroke-width="5"/></g>`; },
  // little fort flag: base of the pole at the origin
  flag: () => `<g>
      <rect x="-7" y="-176" width="14" height="180" rx="7" fill="#C98A4A" stroke="${OL}" stroke-width="6"/>
      <path d="M6,-172 L104,-138 L6,-104 Z" fill="#FFD13B" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="${starPath(40, -138, 16, 7)}" fill="#E63980"/>
      <circle cx="0" cy="-180" r="11" fill="#E63980" stroke="${OL}" stroke-width="5"/></g>`,
  // party balloon on a string: string end (hand / tie point) at the origin, balloon body centre at (0, -len-84); colour p.color, string length p.len (default 300)
  balloon: (p) => { const c = p.color || '#E63980', L = p.len || 300; return `<g>
      <path d="M0,0 Q-16,${(-L * .3).toFixed(0)} 4,${(-L * .55).toFixed(0)} Q22,${(-L * .8).toFixed(0)} 0,${-L}" stroke="${OL}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-13,${-L + 3} L13,${-L + 3} L0,${-L - 16} Z" fill="${c}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <ellipse cx="0" cy="${-L - 84}" rx="66" ry="80" fill="${c}" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M-38,${-L - 112} Q-34,${-L - 146} -8,${-L - 152}" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="12" fill="none" stroke-linecap="round"/></g>`; },
  // stripy sock: cuff (grip point) at the origin, leg hangs down, toe points +x; colour p.color, stripes p.stripe
  sock: (p) => { const c = p.color || '#2CA58D', st = p.stripe || '#F5E050'; return `<g>
      <path d="M-30,0 L30,0 L30,92 Q30,108 48,110 L84,110 Q108,112 108,136 Q108,160 82,160 L4,160 Q-30,160 -30,122 Z" fill="${c}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M-30,34 L30,34 L30,50 L-30,50 Z M-30,68 L30,68 L30,82 L-30,82 Z" fill="${st}" stroke="${OL}" stroke-width="4"/>
      <path d="M82,112 Q108,112 108,136 Q108,160 82,160 Q92,136 82,112 Z" fill="${st}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="-36" y="-14" width="72" height="22" rx="8" fill="#FFFFFF" stroke="${OL}" stroke-width="6"/></g>`; },
  // toothbrush: handle end (grip point) at the origin, head at (0,-150) with bristles facing +x; colour p.color
  toothbrush: (p) => { const c = p.color || '#1EA7FD'; return `<g>
      <rect x="-10" y="-150" width="20" height="160" rx="10" fill="${c}" stroke="${OL}" stroke-width="6"/>
      <rect x="-4" y="-120" width="8" height="70" rx="4" fill="#FFFFFF" fill-opacity=".6"/>
      <rect x="10" y="-160" width="26" height="46" rx="5" fill="#FFFFFF" stroke="${OL}" stroke-width="5"/>
      <path d="M17,-154 L17,-120 M26,-154 L26,-120" stroke="#9FD8F5" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="38" cy="-150" rx="16" ry="12" fill="#FFFFFF" stroke="${OL}" stroke-width="4"/></g>`; },
  // sand timer, about 120 x 200, centred on the origin
  hourglass: () => `<g>
      <rect x="-66" y="-104" width="132" height="22" rx="8" fill="#C98A4A" stroke="${OL}" stroke-width="6"/>
      <rect x="-66" y="82" width="132" height="22" rx="8" fill="#C98A4A" stroke="${OL}" stroke-width="6"/>
      <path d="M-48,-82 L48,-82 Q48,-30 8,0 Q48,30 48,82 L-48,82 Q-48,30 -8,0 Q-48,-30 -48,-82 Z" fill="#E6F7FF" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-30,-46 L30,-46 Q20,-22 0,-6 Q-20,-22 -30,-46 Z" fill="#FFD13B"/>
      <path d="M-2,-4 L2,-4 L2,60 L-2,60 Z" fill="#FFD13B"/>
      <path d="M-40,78 Q0,40 40,78 Z" fill="#FFD13B"/>
      <path d="M-34,-70 Q-34,-48 -22,-36" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
  // bouncy play ball, centred on the origin, radius p.r (default 48); colour p.color, band p.band
  ball: (p) => { const r = p.r || 48, c = p.color || '#E63980', b = p.band || '#FFD13B'; return `<g>
      <circle cx="0" cy="0" r="${r}" fill="${c}"/>
      <path d="M${-r * .99},${(-r * .16).toFixed(1)} Q0,${(-r * .5).toFixed(1)} ${r * .99},${(-r * .16).toFixed(1)} L${r * .99},${(r * .2).toFixed(1)} Q0,${(-r * .12).toFixed(1)} ${-r * .99},${(r * .2).toFixed(1)} Z" fill="${b}"/>
      <circle cx="0" cy="0" r="${r}" fill="none" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M${(-r * .58).toFixed(1)},${(r * .3).toFixed(1)} Q${(-r * .1).toFixed(1)},${(r * .62).toFixed(1)} ${(r * .5).toFixed(1)},${(r * .42).toFixed(1)}" stroke="${OL}" stroke-opacity=".25" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="${(-r * .38).toFixed(1)}" cy="${(-r * .5).toFixed(1)}" rx="${(r * .2).toFixed(1)}" ry="${(r * .12).toFixed(1)}" fill="#FFFFFF" transform="rotate(-30 ${(-r * .38).toFixed(1)} ${(-r * .5).toFixed(1)})"/></g>`; },
  // toy block (cube), bottom-centre at the origin, edge p.s (default 76); colour p.color, letter p.letter
  block: (p) => { const s = p.s || 76, h = s / 2, c = p.color || '#1EA7FD', d = s * .22; return `<g>
      <path d="M${-h},${-s} L${-h + d},${-s - d} L${h + d},${-s - d} L${h},${-s} Z" fill="#FFFFFF" fill-opacity=".55" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M${-h},${-s} L${-h + d},${-s - d} L${h + d},${-s - d} L${h},${-s} Z" fill="${c}" fill-opacity=".55"/>
      <path d="M${h},${-s} L${h + d},${-s - d} L${h + d},${-d} L${h},0 Z" fill="${c}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M${h},${-s} L${h + d},${-s - d} L${h + d},${-d} L${h},0 Z" fill="#000" fill-opacity=".22"/>
      <rect x="${-h}" y="${-s}" width="${s}" height="${s}" rx="6" fill="${c}" stroke="${OL}" stroke-width="6"/>
      <text x="0" y="${(-s * .26).toFixed(1)}" text-anchor="middle" class="cap" font-size="${(s * .66).toFixed(0)}" fill="#FFFFFF" stroke-width="9">${p.letter || ''}</text></g>`; },
  // toy box, bottom-centre at the origin, 300 wide x 160 tall. Use two actors: part:"back" (layer back, the inside)
  // and part:"front" (layer front, the front panel); blocks dropped in with layer "back" land between them
  toybox: (p) => p.part === 'back' ? `<g>
      <rect x="-134" y="-196" width="268" height="80" rx="12" fill="#1F7A68" stroke="${OL}" stroke-width="${SW}"/>
      <rect x="-118" y="-180" width="236" height="50" rx="8" fill="#17604F"/></g>` : `<g>
      <rect x="-140" y="-150" width="280" height="150" rx="16" fill="#2CA58D" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M-112,-24 L112,-24" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
      <path d="${starPath(0, -76, 40, 18)}" fill="#FFD13B" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <rect x="-152" y="-168" width="304" height="30" rx="12" fill="#F5E050" stroke="${OL}" stroke-width="${SW}"/></g>`,
  // big cardboard box (hide-and-seek), bottom-centre at the origin, 340 wide x p.h tall (default 440), open flaps on top.
  // Use layer "front" so a kid standing behind it (larger y is fine) is hidden; peeking = jump
  cardbox: (p) => { const h = p.h || 440; return `<g>
      <path d="M-170,${-h} L-206,${-h - 58} L-50,${-h - 66} L0,${-h} Z" fill="#C48A50" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M170,${-h} L206,${-h - 58} L50,${-h - 66} L0,${-h} Z" fill="#C48A50" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="-170" y="${-h}" width="340" height="${h}" rx="10" fill="#D9A066" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M-150,${-h + 26} L150,${-h + 26}" stroke="#B5763D" stroke-width="7" stroke-linecap="round"/>
      <rect x="-26" y="${-h + 4}" width="52" height="${h * .42}" fill="#F5E050" fill-opacity=".85" stroke="${OL}" stroke-width="5"/>
      <rect x="-56" y="${-h * .5}" width="112" height="34" rx="17" fill="#8A5A2E" stroke="${OL}" stroke-width="6"/>
      <path d="${heartPath(34)}" transform="translate(0,${-h * .2})" fill="#F06292" stroke="${OL}" stroke-width="5"/></g>`; },
  // terracotta flower pot, bottom-centre at the origin, about 190 wide x 140 tall; soil surface at (0,-140)
  pot: () => `<g>
      <path d="M-82,-118 L82,-118 L62,0 L-62,0 Z" fill="#D9622B" stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-40,-90 L-34,-24" stroke="#F08A5D" stroke-width="10" stroke-linecap="round"/>
      <rect x="-96" y="-150" width="192" height="40" rx="10" fill="#E9784A" stroke="${OL}" stroke-width="${SW}"/>
      <ellipse cx="0" cy="-146" rx="80" ry="10" fill="#6B4226"/></g>`,
  // little green sprout, base (soil) at the origin, about 70 tall
  sprout: () => `<g>
      <path d="M0,0 Q-4,-34 0,-58" stroke="${OL}" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M0,0 Q-4,-34 0,-58" stroke="#4CAF50" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M0,-56 Q-50,-90 -62,-52 Q-30,-36 0,-56 Z" fill="#6CCB5F" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M0,-56 Q50,-96 64,-58 Q30,-38 0,-56 Z" fill="#6CCB5F" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/></g>`,
  // grown flower, base (soil) at the origin, head centre at (0,-300); petals p.color (default pink)
  flower: (p) => { const c = p.color || '#FF8FC7'; let pet = '';
    for (let i = 0; i < 8; i++) pet += `<ellipse cx="0" cy="-44" rx="24" ry="38" fill="${c}" stroke="${OL}" stroke-width="6" transform="translate(0,-300) rotate(${i * 45})"/>`;
    return `<g>
      <path d="M0,0 Q-14,-150 0,-290" stroke="${OL}" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M0,0 Q-14,-150 0,-290" stroke="#4CAF50" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M-6,-110 Q-70,-160 -92,-110 Q-50,-86 -6,-110 Z" fill="#6CCB5F" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-4,-170 Q60,-224 86,-176 Q44,-150 -4,-170 Z" fill="#6CCB5F" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      ${pet}<circle cx="0" cy="-300" r="34" fill="#FFD13B" stroke="${OL}" stroke-width="7"/>
      <circle cx="-10" cy="-310" r="8" fill="#FFFFFF" fill-opacity=".8"/></g>`; },
  // watering can held by its top handle: grip at the origin, body hangs below, spout points -x with the rose at (-140,5)
  can: () => `<g>
      <path d="M-128,4 L-50,64 L-50,90 L-140,22 Z" fill="#1EA7FD" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <ellipse cx="-138" cy="8" rx="12" ry="20" transform="rotate(-38 -138 8)" fill="#9FD8F5" stroke="${OL}" stroke-width="6"/>
      <path d="M-38,32 Q0,-26 38,32" stroke="${OL}" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M-38,32 Q0,-26 38,32" stroke="#FFD13B" stroke-width="8" fill="none" stroke-linecap="round"/>
      <rect x="-56" y="28" width="112" height="96" rx="18" fill="#1EA7FD" stroke="${OL}" stroke-width="${SW}"/>
      <path d="M-40,52 L40,52" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="9" stroke-linecap="round"/>
      <path d="${heartPath(22)}" transform="translate(0,96)" fill="#FFD13B" stroke="${OL}" stroke-width="4"/></g>`,
  // falling water drops: a short column of 4 drops, top at the origin, 60 px apart (slide oy by 60 in a loop to animate)
  drops: () => `<g>${[0, 60, 120, 180].map((y, i) => `<path d="M${i % 2 ? 6 : -6},${y - 18} Q${(i % 2 ? 6 : -6) + 13},${y + 2} ${i % 2 ? 6 : -6},${y + 10} Q${(i % 2 ? 6 : -6) - 13},${y + 2} ${i % 2 ? 6 : -6},${y - 18} Z" fill="#5BC0F8" stroke="${OL}" stroke-width="4"/>`).join('')}</g>`,
  question: () => `<g><text x="0" y="0" text-anchor="middle" class="cap" font-size="130" fill="#1EA7FD" stroke-width="16">?</text></g>`,
};

function heartPath(s) { return `M0,${0.3 * s} C${-0.9 * s},${-0.35 * s} ${-0.4 * s},${-1.05 * s} 0,${-0.55 * s} C${0.4 * s},${-1.05 * s} ${0.9 * s},${-0.35 * s} 0,${0.3 * s} Z`; }
function burstPath(R, r, n) {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (rr * Math.cos(a)).toFixed(1) + ',' + (rr * Math.sin(a)).toFixed(1); }
  return d + 'Z';
}

// ---------------------------------------------------------------- background
function drawBg(kind) {
  let s = '';
  for (let i = 0; i < 18; i++) s += `<rect x="${i * 60}" y="-220" width="60" height="1490" fill="${i % 2 ? '#F8ECC2' : '#FFF5DC'}"/>`;
  // window
  s += `<g transform="translate(540,640)">
    <rect x="-185" y="-175" width="370" height="350" rx="14" fill="#FFFFFF" stroke="${OL}" stroke-width="${SW}"/>
    <rect x="-160" y="-150" width="320" height="300" fill="#8FD3FF"/>
    <circle cx="95" cy="-88" r="36" fill="#FFD13B"/>
    <g fill="#FFFFFF"><circle cx="-90" cy="-40" r="26"/><circle cx="-60" cy="-52" r="32"/><circle cx="-28" cy="-38" r="24"/><rect x="-92" y="-40" width="66" height="24"/>
      <circle cx="40" cy="40" r="20"/><circle cx="64" cy="30" r="26"/><circle cx="90" cy="42" r="18"/><rect x="40" y="40" width="50" height="18"/></g>
    <rect x="-160" y="-150" width="320" height="300" fill="none" stroke="${OL}" stroke-width="6"/>
    <rect x="-6" y="-150" width="12" height="300" fill="#FFFFFF" stroke="${OL}" stroke-width="4"/>
    <rect x="-160" y="-6" width="320" height="12" fill="#FFFFFF" stroke="${OL}" stroke-width="4"/>
    <path d="M-205,-190 Q-150,-40 -196,190 L-128,190 Q-100,40 -150,-190 Z" fill="#F7A1C4" stroke="${OL}" stroke-width="6"/>
    <path d="M205,-190 Q150,-40 196,190 L128,190 Q100,40 150,-190 Z" fill="#F7A1C4" stroke="${OL}" stroke-width="6"/>
    <rect x="-225" y="-205" width="450" height="22" rx="11" fill="#C98A4A" stroke="${OL}" stroke-width="6"/></g>`;
  // wall frames
  s += `<g transform="translate(150,560)"><rect x="-70" y="-80" width="140" height="160" rx="10" fill="#FFFFFF" stroke="${OL}" stroke-width="7"/>
        <path d="${heartPath(60)}" transform="translate(0,14)" fill="#F06292" stroke="${OL}" stroke-width="6"/></g>
        <g transform="translate(930,560)"><rect x="-70" y="-80" width="140" height="160" rx="10" fill="#FFFFFF" stroke="${OL}" stroke-width="7"/>
        <circle cx="0" cy="0" r="46" fill="#4FD1C5" stroke="${OL}" stroke-width="6"/><circle cx="0" cy="0" r="20" fill="#FF9F1C" stroke="${OL}" stroke-width="5"/></g>`;
  if (kind === 'party') {
    const cols = ['#9B5DE5', '#FF7828', '#FFD13B', '#2CA58D', '#E63980'];
    let d = '';
    for (let i = 0; i < 12; i++) { const x = 20 + i * 90; d += `<path d="M${x},${150 + Math.sin(i / 11 * Math.PI) * 60} l80,0 l-40,90 Z" fill="${cols[i % 5]}" stroke="${OL}" stroke-width="5"/>`; }
    s += `<path d="M0,150 Q540,330 1080,150" fill="none" stroke="${OL}" stroke-width="5"/>${d}`;
  }
  // skirting + floor
  s += `<rect x="-10" y="1240" width="1100" height="34" fill="#FFFFFF" stroke="${OL}" stroke-width="6"/>
        <rect x="0" y="1274" width="1080" height="800" fill="#DE9E5B"/>`;
  for (let r = 0; r < 10; r++) {
    const y = 1274 + r * 86;
    s += `<path d="M0,${y} L1080,${y}" stroke="#C4824A" stroke-width="5"/>`;
    for (let c = 0; c < 4; c++) { const x = ((c * 300 + (r % 2) * 150) % 1080) + 60; s += `<path d="M${x},${y} L${x},${y + 86}" stroke="#C4824A" stroke-width="5"/>`; }
  }
  s += `<ellipse cx="540" cy="1590" rx="500" ry="168" fill="#3A9692" stroke="${OL}" stroke-width="${SW}"/>
        <ellipse cx="540" cy="1590" rx="462" ry="140" fill="#7FCDBB"/>
        <ellipse cx="540" cy="1590" rx="380" ry="104" fill="none" stroke="#A8E0D2" stroke-width="10" stroke-dasharray="26 22"/>`;
  $('bg').innerHTML = s;
}

// ---------------------------------------------------------------- keyframes
const DEF_KID = { x: 540, y: 1590, sc: 1, flip: 1, jump: 0, hop: 0, run: 0, shiver: 0, sq: 1, lean: 0, armL: 8, armR: 8,
  tilt: 0, op: 1, look: 0, eyes: 'open', brows: 'normal', mouth: 'grin' };
const DEF_PROP = { x: 540, y: 960, sc: 1, rot: 0, op: 1, layer: 'front', attach: '', ab: 0, ox: 0, oy: 0 };
const DEF_CAM = { z: 1.25, cx: 540, cy: 2000, shake: 0 };
const DISCRETE = new Set(['eyes', 'brows', 'mouth', 'layer', 'attach', 'half', 'type']);

function makeTrack(keys) {
  const byProp = {};
  for (const k of keys.slice().sort((a, b) => a.t - b.t)) {
    for (const p in k) if (!['t', 'd', 'e'].includes(p)) (byProp[p] = byProp[p] || []).push({ t: k.t, v: k[p], d: k.d ?? 0.35, e: k.e || 'io' });
  }
  return byProp;
}
function valueAt(list, i, t, def) {
  if (i < 0) return def;
  const k = list[i];
  const prev = valueAt(list, i - 1, k.t, def);
  if (k.d <= 0) return k.v;
  const p = clamp((t - k.t) / k.d);
  return lerp(prev, k.v, EASE[k.e](p));
}
function sampleTrack(track, t, defs) {
  const out = Object.assign({}, defs);
  for (const p in track) {
    const list = track[p];
    let i = -1;
    for (let j = 0; j < list.length; j++) if (list[j].t <= t) i = j; else break;
    if (DISCRETE.has(p) || typeof list[0].v !== 'number') { if (i >= 0) out[p] = list[i].v; continue; }
    out[p] = valueAt(list, i, t, defs[p] ?? 0);
  }
  return out;
}

// ---------------------------------------------------------------- episode
let EP = null, TRACKS = {}, KIDS = {}, PROPEL = {}, faceCache = {};
window.loadEpisode = function (ep) {
  EP = ep; TRACKS = {}; KIDS = {}; PROPEL = {}; faceCache = {};
  $('defs').innerHTML = `<clipPath id="halfL"><rect x="-200" y="-300" width="200" height="400"/></clipPath>
                         <clipPath id="halfR"><rect x="0" y="-300" width="200" height="400"/></clipPath>`;
  drawBg(ep.set || 'home');
  $('actors').innerHTML = ''; $('back').innerHTML = ''; $('front').innerHTML = ''; $('shadows').innerHTML = '';
  for (const [id, a] of Object.entries(ep.actors)) {
    TRACKS[id] = makeTrack(a.keys || []);
    if (a.kind === 'kid') {
      $('shadows').insertAdjacentHTML('beforeend', `<ellipse id="${id}-shadow" cx="0" cy="0" rx="120" ry="22" fill="rgba(0,0,0,.18)"/>`);
      $('actors').insertAdjacentHTML('beforeend', kidSVG(id, CAST[a.who]));
      KIDS[id] = a;
    } else {
      const g = document.createElementNS(NS, 'g'); g.id = id;
      g.innerHTML = PROPS[a.type](a);
      PROPEL[id] = g;
    }
  }
  TRACKS.__cam = makeTrack(ep.camera || []);
};

function handPoint(kidId, side) {
  if (side === 'H') { // top of the head (hats, a sock on the head...)
    const head = $(`${kidId}-head`); if (!head) return null;
    const p = new DOMPoint(0, -690).matrixTransform($('world').getCTM().inverse().multiply(head.getCTM()));
    return { x: p.x, y: p.y };
  }
  const arm = $(`${kidId}-arm${side}`), hand = $(`${kidId}-hand${side}`);
  if (!arm || !hand) return null;
  const m = $('world').getCTM().inverse().multiply(hand.getCTM());
  const p = new DOMPoint(+hand.getAttribute('cx'), +hand.getAttribute('cy')).matrixTransform(m);
  return { x: p.x, y: p.y };
}

function renderKid(id, a, t) {
  const s = sampleTrack(TRACKS[id], t, Object.assign({}, DEF_KID, a.init || {}));
  const k = CAST[a.who];
  const root = $(id);
  root.setAttribute('opacity', s.op);
  const hop = s.hop ? Math.abs(Math.sin(t * Math.PI * 2.4)) * s.hop : 0;
  const jump = s.jump + hop;
  const shx = s.shiver ? Math.sin(t * 90) * s.shiver : 0;
  const sx = s.sc / Math.sqrt(s.sq), sy = s.sc * s.sq;
  root.setAttribute('transform', `translate(${(s.x + shx).toFixed(2)},${(s.y - jump).toFixed(2)}) rotate(${s.lean}) scale(${(sx * s.flip).toFixed(4)},${sy.toFixed(4)})`);
  const sh = $(`${id}-shadow`);
  const sf = clamp(1 - jump / 600, .4, 1);
  sh.setAttribute('transform', `translate(${s.x},${s.y}) scale(${s.sc * sf * (k.headScale > 1 ? .85 : 1)})`);
  // idle breathing + running bob
  const bob = Math.sin(t * Math.PI * 2 * 0.8 + (a.who === 'big' ? 0 : 1.3)) * 4 + (s.run ? -Math.abs(Math.sin(t * Math.PI * 6)) * 10 : 0);
  $(`${id}-upper`).setAttribute('transform', `translate(0,${bob.toFixed(2)})`);
  const legSw = s.run ? Math.sin(t * Math.PI * 6) * s.run : 0;
  $(`${id}-legL`).setAttribute('transform', `rotate(${legSw.toFixed(2)} -40 -150)`);
  $(`${id}-legR`).setAttribute('transform', `rotate(${(-legSw).toFixed(2)} 40 -150)`);
  const armSw = s.run ? Math.sin(t * Math.PI * 6) * s.run * 1.2 : 0;
  $(`${id}-armL`).setAttribute('transform', `rotate(${(s.armL - armSw).toFixed(2)} -94 -380)`);
  $(`${id}-armR`).setAttribute('transform', `rotate(${(-(s.armR + armSw)).toFixed(2)} 94 -380)`);
  $(`${id}-head`).setAttribute('transform', `rotate(${s.tilt} 0 -400) translate(0,-400) scale(${k.headScale}) translate(0,400)`);
  // face
  let eyes = s.eyes;
  const blinkPhase = (t + (a.who === 'big' ? 0.7 : 2.1)) % 3.4;
  if ((eyes === 'open' || eyes === 'wide') && blinkPhase < 0.11) eyes = 'closed';
  const key = `${eyes}|${s.brows}|${s.mouth === 'chew' ? 'chew' + (Math.floor(t * 7) % 2) : s.mouth}|${s.look.toFixed(1)}`;
  if (faceCache[id] !== key) {
    faceCache[id] = key;
    $(`${id}-face`).innerHTML = eye(-50, -536, eyes, s.look) + eye(50, -536, eyes, s.look) +
      brow(-50, -578, s.brows, -1) + brow(50, -578, s.brows, 1) + mouth(s.mouth, t);
  }
}

function renderProp(id, a, t) {
  const s = sampleTrack(TRACKS[id], t, Object.assign({}, DEF_PROP, a.init || {}));
  const g = PROPEL[id];
  const layer = $(s.layer);
  if (g.parentNode !== layer) layer.appendChild(g);
  let x = s.x, y = s.y;
  if (s.attach && s.ab > 0) {
    const [kid, side] = s.attach.split(':');
    const hp = handPoint(kid, side);
    if (hp) { x = lerp(x, hp.x + s.ox, s.ab); y = lerp(y, hp.y + s.oy, s.ab); }
  }
  g.setAttribute('opacity', clamp(s.op));
  g.setAttribute('display', s.op <= 0.001 || s.sc <= 0.001 ? 'none' : 'inline');
  g.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${s.rot}) scale(${Math.max(s.sc, 0.0001).toFixed(4)})`);
}

function renderFx(t) {
  let s = '';
  for (const f of EP.fx || []) {
    const dur = f.dur ?? 0.9, p = (t - f.t) / dur;
    if (p < 0 || p > 1) continue;
    if (f.type === 'burst') {
      const sc = p < 0.25 ? EASE.back(p / 0.25) : 1 + 0.05 * Math.sin(p * 20);
      const op = p > 0.8 ? 1 - (p - 0.8) / 0.2 : 1;
      const R = f.r || 120;
      s += `<g transform="translate(${f.x},${f.y}) rotate(${(f.rot || -8) + Math.sin(p * 9) * 3}) scale(${sc.toFixed(3)})" opacity="${op.toFixed(3)}">
        <path d="${burstPath(R, R * 0.72, 12)}" fill="${f.color || '#FFD13B'}" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/>
        <text x="0" y="${R * 0.18}" text-anchor="middle" class="cap" font-size="${f.size || R * 0.5}" fill="#FFFFFF" stroke-width="12">${f.text}</text></g>`;
    } else if (f.type === 'hearts') {
      const r = rnd(f.seed || 7);
      for (let i = 0; i < (f.n || 8); i++) {
        const d0 = r() * 0.5, q = clamp((p - d0) / (1 - d0)); if (q <= 0) continue;
        const hx = f.x + (r() - .5) * (f.spread || 260) + Math.sin(q * 8 + i) * 18, hy = f.y - q * (220 + r() * 160);
        const sz = (28 + r() * 26) * EASE.back(clamp(q * 4));
        s += `<path d="${heartPath(sz)}" transform="translate(${hx.toFixed(1)},${hy.toFixed(1)})" fill="${i % 2 ? '#FF4F8B' : '#FF7AA8'}" stroke="${OL}" stroke-width="5" opacity="${(1 - q * q).toFixed(3)}"/>`;
      }
    } else if (f.type === 'sparkle') {
      const r = rnd(f.seed || 3);
      for (let i = 0; i < (f.n || 6); i++) {
        const ph = r(), q = Math.sin(clamp(p * 1.6 - ph * .6) * Math.PI);
        if (q <= 0) continue;
        const a = r() * Math.PI * 2, rr = (f.r || 120) * (0.5 + r() * 0.6);
        const sx = f.x + Math.cos(a) * rr, sy = f.y + Math.sin(a) * rr, z = (18 + r() * 22) * q;
        s += `<path d="M0,${-z} Q${z * .18},${-z * .18} ${z},0 Q${z * .18},${z * .18} 0,${z} Q${-z * .18},${z * .18} ${-z},0 Q${-z * .18},${-z * .18} 0,${-z} Z" transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})" fill="${i % 2 ? '#FFFFFF' : '#FFE45C'}" stroke="${OL}" stroke-width="4"/>`;
      }
    } else if (f.type === 'confetti') {
      const r = rnd(f.seed || 11), cols = ['#E63980', '#1EA7FD', '#FFD13B', '#FF7828', '#2CA58D', '#9B5DE5'];
      for (let i = 0; i < (f.n || 90); i++) {
        const d0 = r() * 0.6, q = (t - f.t - d0 * dur) / 1.8; if (q < 0 || q > 1) continue;
        const cx = r() * 1080 + Math.sin(q * 10 + i) * 30, cy = -40 + q * 2000 * (0.8 + r() * 0.4);
        const rot = q * 720 * (r() - .5) * 2;
        s += `<rect x="-9" y="-5" width="18" height="10" rx="2" fill="${cols[i % 6]}" transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${rot.toFixed(1)})"/>`;
      }
    } else if (f.type === 'lines') { // speed / action lines
      const op = Math.sin(p * Math.PI);
      for (let i = 0; i < 6; i++) { const yy = f.y - 80 + i * 32; s += `<path d="M${f.x},${yy} l${(f.dir || -1) * (60 + (i % 3) * 30)},0" stroke="${OL}" stroke-width="7" stroke-linecap="round" opacity="${op.toFixed(2)}"/>`; }
    }
  }
  $('fx').innerHTML = s;
}

function capMarkup(text, size, y) {
  const lines = text.split('\n');
  return lines.map((ln, i) => {
    const parts = ln.split(/(\{[^}]+\})/g).filter(Boolean).map(seg =>
      seg.startsWith('{') ? `<tspan fill="#FFD13B">${seg.slice(1, -1)}</tspan>` : `<tspan>${seg}</tspan>`).join('');
    return `<text x="540" y="${y + i * size * 1.12}" text-anchor="middle" class="cap" font-size="${size}" fill="#FFFFFF" stroke-width="${Math.round(size * 0.2)}">${parts}</text>`;
  }).join('');
}
function renderCaptions(t) {
  let s = '';
  for (const c of EP.captions || []) {
    if (t < c.t0 || t > c.t1) continue;
    const pin = clamp((t - c.t0) / 0.28), pout = clamp((c.t1 - t) / 0.18);
    const sc = EASE.back(pin) * (0.85 + 0.15 * pout);
    const y = c.y || 300, size = c.size || 96;
    s += `<g transform="translate(540,${y}) scale(${sc.toFixed(3)}) translate(-540,${-y})" opacity="${pout.toFixed(3)}">
      <g transform="translate(6,8)" opacity=".25">${capMarkup(c.text, size, y).replace(/fill="#(FFFFFF|FFD13B)"/g, 'fill="#000"')}</g>
      ${capMarkup(c.text, size, y)}</g>`;
  }
  $('ui').innerHTML = s;
}

window.renderAt = function (t) {
  const c = sampleTrack(TRACKS.__cam, t, DEF_CAM);
  const z = Math.max(c.z, 1), hw = 540 / z, hh = 960 / z;
  c.z = z; c.cx = clamp(c.cx, hw, 1080 - hw); c.cy = clamp(c.cy, hh, 1920 - hh);
  const shx = c.shake ? Math.sin(t * 73) * c.shake : 0, shy = c.shake ? Math.cos(t * 61) * c.shake : 0;
  $('cam').setAttribute('transform', `translate(${540 + shx},${960 + shy}) scale(${c.z}) translate(${-c.cx},${-c.cy})`);
  for (const [id, a] of Object.entries(KIDS)) renderKid(id, a, t);
  for (const [id, a] of Object.entries(EP.actors)) if (a.kind !== 'kid') renderProp(id, a, t);
  renderFx(t);
  renderCaptions(t);
  return true;
};
