import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createHall } from './hall.js';
import { createAudio } from './audio.js';
import { capitulos, reinos, eras, marcas, emperadores, judea, mapaPasos, ciudades, regiones } from '../data/content.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const isMobile = () => window.innerWidth < 900;

/* ————————————————— texto partido en letras ————————————————— */
function splitChars(el) {
  const targets = el.querySelectorAll('.line').length ? [...el.querySelectorAll('.line')] : [el];
  const chars = [];
  targets.forEach((t) => {
    const words = t.textContent.split(' ');
    t.textContent = '';
    words.forEach((w, wi) => {
      const ws = document.createElement('span'); ws.className = 'split-word';
      [...w].forEach((ch) => { const s = document.createElement('span'); s.className = 'split-char'; s.textContent = ch; ws.appendChild(s); chars.push(s); });
      t.appendChild(ws);
      if (wi < words.length - 1) t.appendChild(document.createTextNode(' '));
    });
  });
  return chars;
}
const splits = new Map();
$$('[data-split]').forEach((el) => splits.set(el, splitChars(el)));

function revealChars(chars, opts = {}) {
  return gsap.fromTo(chars,
    { opacity: 0, yPercent: 60, rotateX: -70 },
    { opacity: 1, yPercent: 0, rotateX: 0, duration: 1.2, force3D: true, clearProps: 'transform', ease: 'expo.out', stagger: { each: 0.035, from: opts.from || 'start' }, ...opts });
}

/* ————————————————— pre-render: se hace UNA vez al cargar ————————————————— */
// Niebla: se dibuja una sola vez en un canvas y se usa como imagen fija. Antes era un blur CSS + mezcla en vivo.
function paintFog() {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 400;
  const g = c.getContext('2d');
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const blobs = [[.3, .6, .5, '241,224,206', .55], [.72, .4, .45, '232,196,180', .5], [.5, .5, .7, '214,170,150', .4]];
  for (let i = 0; i < 70; i++) blobs.push([rnd(), rnd(), .08 + rnd() * .22, '245,232,218', .06 + rnd() * .12]);
  blobs.forEach(([x, y, r, col, a]) => {
    const R = r * c.width, gr = g.createRadialGradient(x * c.width, y * c.height, 0, x * c.width, y * c.height, R);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  });
  $('#fog').style.backgroundImage = `url(${c.toDataURL('image/webp', 0.85)})`;
}
paintFog();
// Estatua: se descarga y decodifica durante el loader, no al llegar a la sección.
const statueReady = (() => {
  const el = $('#statue-img');
  const m = el && getComputedStyle(el).backgroundImage.match(/url\("?(.*?)"?\)/);
  if (!m) return Promise.resolve();
  const im = new Image(); im.src = m[1];
  return (im.decode ? im.decode() : Promise.resolve()).catch(() => {});
})();

/* ————————————————— scroll suave ————————————————— */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function goTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const st = ScrollTrigger.getById('pin-' + id);
  const y = st ? st.start + 2 : el.getBoundingClientRect().top + window.scrollY;
  if (lenis) lenis.scrollTo(y, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}
$$('[data-goto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(a.dataset.goto); }));

/* ————————————————— escena 3D ————————————————— */
let hall = null;
try { hall = createHall($('#hall'), { reduced }); }
catch (err) {
  $('#hall').style.display = 'none';
  document.body.style.background = 'radial-gradient(ellipse at 50% 40%, #3a140d, #0a0706 70%)';
}
window.addEventListener('pointermove', (e) => {
  if (!hall) return;
  hall.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
}, { passive: true });

/* ————————————————— sonido ————————————————— */
const audio = createAudio();
const soundBtn = $('#sound');
soundBtn.addEventListener('click', async () => {
  const on = await audio.toggle();
  soundBtn.classList.toggle('is-on', on);
  soundBtn.setAttribute('aria-pressed', String(on));
  soundBtn.setAttribute('aria-label', on ? 'Silenciar sonido ambiente' : 'Activar sonido ambiente');
});

/* ————————————————— loader ————————————————— */
function fmtYear(y) { y = Math.round(y); return y < 0 ? `${-y} a.C.` : `${Math.max(1, y)} d.C.`; }
function runLoader() {
  const loader = $('#loader');
  if (!loader || reduced) { loader && loader.remove(); document.body.classList.remove('is-loading'); return Promise.resolve(); }
  document.body.classList.add('is-loading');
  if (lenis) lenis.stop();
  const yr = { v: -753 };
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); document.body.classList.remove('is-loading'); if (lenis) lenis.start(); resolve(); } });
    tl.to(yr, { v: 1453, duration: 2.4, ease: 'power2.inOut', onUpdate: () => { $('#loader-year').textContent = fmtYear(yr.v); } }, 0)
      .to('#loader-bar', { scaleX: 1, duration: 2.4, ease: 'power2.inOut' }, 0)
      .fromTo('.loader__mark text', { strokeDasharray: 300, strokeDashoffset: 300 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0)
      .to('.loader__core', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' }, 2.5)
      .to('.loader__half--t', { yPercent: -100, duration: 1.3, ease: 'expo.inOut' }, 2.9)
      .to('.loader__half--b', { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, 2.9);
  });
}

/* ————————————————— HUD ————————————————— */
const veils = [0, 0.38, 0.5, 0.55, 0.55, 0.42];
let currentCh = -1;
function setChapter(i) {
  if (i === currentCh) return;
  currentCh = i;
  const c = capitulos[i];
  const pill = $('#hud-pill');
  gsap.fromTo(pill, { opacity: 0.2, y: -6 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
  $('#hud-num').textContent = c.num;
  $('#hud-name').textContent = c.nombre;
  $('#hud-lugar').textContent = c.lugar;
  scramble($('#hud-coord'), c.coord);
  $$('.hud__nav a').forEach((a, k) => a.classList.toggle('is-active', k === i));
  if (hall) { hall.setMood(i); hall.setDetail(veils[i] >= 0.5 ? 0.75 : 1); }
  gsap.to('#veil-dim', { opacity: veils[i], duration: 1.2, ease: 'power2.out' });
}
function scramble(el, text) {
  if (reduced) { el.textContent = text; return; }
  const glyphs = '0123456789°·NE';
  const o = { p: 0 };
  gsap.to(o, { p: 1, duration: 0.8, ease: 'power2.out', onUpdate: () => {
    const n = Math.floor(o.p * text.length);
    el.textContent = text.slice(0, n) + [...text.slice(n)].map((ch) => (ch === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0])).join('');
  }, onComplete: () => { el.textContent = text; } });
}

/* ————————————————— capítulos ————————————————— */
function buildHero() {
  const tl = gsap.timeline({ scrollTrigger: { id: 'pin-inicio', trigger: '#inicio', start: 'top top', end: '+=140%', pin: true, scrub: 1 } });
  gsap.set('#hero-cap1', { opacity: 0 });
  tl.to('#scroll-hint', { opacity: 0, duration: 0.15 }, 0)
    .to('#hero-inner', { scale: 1.35, autoAlpha: 0, duration: 0.5, ease: 'power2.in', force3D: true }, 0)
    .fromTo('#hero-cap1', { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power2.out', force3D: true }, 0.45)
    .to('#hero-cap1', { autoAlpha: 0, scale: 1.12, duration: 0.3, ease: 'power2.in', force3D: true }, 0.95);
}

function buildDaniel() {
  const frame = $('#statue'), img = $('#statue-img');
  const st = { fx: 0.5, fy: 0.5, s: 1 };
  let w = 0, h = 0;
  const MAXS = Math.max(...reinos.map((r) => r.focus[2]));
  function measure() {
    w = frame.clientWidth; h = frame.clientHeight;
    // la imagen se dibuja UNA vez al tamaño máximo de zoom y después solo se achica (barato y siempre nítido)
    img.style.width = h * MAXS + 'px'; img.style.height = h * MAXS + 'px';
    apply();
  }
  function apply() {
    const S = h * st.s;
    let tx = w / 2 - st.fx * S, ty = h / 2 - st.fy * S;
    tx = Math.min(0, Math.max(w - S, tx)); ty = Math.min(0, Math.max(h - S, ty));
    if (S < w) tx = (w - S) / 2;
    img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${st.s / MAXS})`;
  }
  measure();
  window.addEventListener('resize', measure);

  const items = $$('.reino'), word = $('#metal-word'), tag = $('#statue-tag');
  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    const r = reinos[i];
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    word.style.setProperty('--metal', r.tono);
    gsap.fromTo(word, { opacity: 0, x: -30 }, { opacity: 0.22, x: 0, duration: 0.8, ease: 'expo.out', onStart: () => { word.textContent = r.metal; } });
    tag.textContent = `${r.parte} · ${r.ref}`;
  }
  setActive(0);

  const tl = gsap.timeline({
    onUpdate: () => setActive(Math.max(0, Math.min(5, Math.floor((tl.time() - 0.5) / 1.6)))),
    scrollTrigger: { id: 'pin-daniel', trigger: '#daniel', start: 'top top', end: '+=520%', pin: true, scrub: 1.2 } });
  reinos.forEach((r, i) => {
    tl.to(st, { fx: r.focus[0], fy: r.focus[1], s: r.focus[2], duration: 1, ease: 'power2.inOut', onUpdate: apply }, i === 0 ? 0 : '+=0.6');
  });
  tl.to(st, { fx: 0.5, fy: 0.5, s: 1, duration: 1, ease: 'power2.inOut', onUpdate: apply }, '+=0.6');
  tl.fromTo('#statue-scan', { y: () => h * 0.08 }, { y: () => h * 0.92, duration: tl.duration(), ease: 'none' }, 0);
}

function buildLinea() {
  const track = $('#track'), band = $('#band'), wrap = $('.linea .track-wrap');
  const eraEls = $$('.band__era', band), hitoEls = $$('.hito', track);
  const totalPeso = eras.reduce((a, e) => a + e.peso, 0);
  let geo = { padL: 0, bandW: 0, trackW: 0 };

  function layout() {
    const vw = window.innerWidth;
    const trackW = Math.max(vw * 4.6, isMobile() ? 3400 : 4200);
    const padL = vw * 0.42, padR = vw * 0.55;
    const bandW = trackW - padL - padR;
    geo = { padL, bandW, trackW };
    track.style.width = trackW + 'px';
    band.style.left = padL + 'px'; band.style.right = 'auto'; band.style.width = bandW + 'px';
    eraEls.forEach((el, i) => { el.style.width = (eras[i].peso / totalPeso) * bandW + 'px'; });
    const last = { roma: [], biblia: [] };
    hitoEls.forEach((el) => {
      const x = xOfYear(+el.dataset.anio);
      el.style.left = x + 'px';
      const lane = el.classList.contains('hito--roma') ? 'roma' : 'biblia';
      const minGap = isMobile() ? 180 : 236;
      let level = 0;
      while (last[lane][level] !== undefined && x - last[lane][level] < minGap) level++;
      last[lane][level] = x;
      const off = level * (isMobile() ? 78 : 86);
      el.style.setProperty('--off', off + 'px');
      if (lane === 'roma') el.style.bottom = `calc(50% + 34px + ${off}px)`; else el.style.top = `calc(50% + 34px + ${off}px)`;
      el.style.setProperty('--stem', 34 + off + 'px');
    });
    $$('.hito').forEach((el) => {
      const stem = el.style.getPropertyValue('--stem');
      el.style.setProperty('--stem', stem);
    });
    const ntA = xOfYear(-63), ntB = xOfYear(96);
    const box = $('#nt-box'); box.style.left = ntA - 6 + 'px'; box.style.width = ntB - ntA + 12 + 'px';
  }
  function xOfYear(y) {
    let x = geo.padL;
    for (const e of eras) {
      const w = (e.peso / totalPeso) * geo.bandW;
      if (y <= e.hasta || e === eras[eras.length - 1]) return x + Math.max(0, Math.min(1, (y - e.desde) / (e.hasta - e.desde))) * w;
      x += w;
    }
    return x;
  }
  function yearOfX(x) {
    let acc = geo.padL;
    for (const e of eras) {
      const w = (e.peso / totalPeso) * geo.bandW;
      if (x <= acc + w || e === eras[eras.length - 1]) return e.desde + Math.max(0, Math.min(1, (x - acc) / w)) * (e.hasta - e.desde);
      acc += w;
    }
    return eras[eras.length - 1].hasta;
  }
  layout();
  // tallos de cada hito según su nivel
  const styleTag = document.createElement('style');
  styleTag.textContent = '.hito--roma::before, .hito--biblia::before { height: var(--stem, 34px) !important; }';
  document.head.appendChild(styleTag);

  const yearEl = $('#year-big');
  let lastYear = null;
  const tween = gsap.to(track, {
    x: () => -(geo.trackW - window.innerWidth), ease: 'none',
    scrollTrigger: {
      id: 'pin-linea', trigger: '#linea', start: 'top top', end: () => '+=' + (geo.trackW - window.innerWidth) * 1.1, pin: true, scrub: 1,
      invalidateOnRefresh: true, onRefreshInit: layout,
    },
    onUpdate: () => {
        const tx = gsap.getProperty(track, 'x');
        const y = Math.round(yearOfX(-tx + window.innerWidth / 2));
        if (y !== lastYear) {
          lastYear = y;
          const yy = y <= 0 ? -y || 1 : y;
          yearEl.innerHTML = `${yy}<small>${y <= 0 ? 'a.C.' : 'd.C.'}</small>`;
        }
    },
  });
  hitoEls.forEach((el) => {
    const up = el.classList.contains('hito--roma');
    gsap.fromTo(el, { autoAlpha: 0, y: up ? 40 : -40 }, {
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { containerAnimation: tween, trigger: el, start: 'left 88%', toggleActions: 'play none none reverse' },
    });
  });
  gsap.fromTo('#nt-box', { scaleY: 0.4, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.8, ease: 'expo.out',
    scrollTrigger: { containerAnimation: tween, trigger: '#nt-box', start: 'left 70%', toggleActions: 'play none none reverse' } });
}

function buildZoom() {
  const N = marcas.length - 1;
  const ticks = $$('.tick'), emps = $$('.emp'), evs = $$('.ev');
  const ph = $('#playhead'), lanes = $('#lanes');
  let cur = -1;
  function setIdx(i) {
    if (i === cur) return;
    cur = i;
    ticks.forEach((t, k) => t.classList.toggle('is-active', k === i));
    const e = emperadores.find((x) => i >= x.desde && (i < x.hasta || (i === N && x.hasta === N)));
    emps.forEach((el) => el.classList.toggle('is-active', +el.dataset.desde === e.desde));
    const exact = judea.find((j) => i >= j.marca && i <= j.hasta);
    const prev = [...judea].reverse().find((j) => j.marca <= i);
    const j = exact || prev;
    evs.forEach((el) => el.classList.toggle('is-active', exact && +el.dataset.desde === exact.marca));
    $('#z-date').innerHTML = `${marcas[i]}<small>Fecha clave ${String(i + 1).padStart(2, '0')} / ${marcas.length}</small>`;
    $('#z-emp').textContent = e.nombre; $('#z-emp-s').textContent = e.fechas;
    const card = $('#z-jud-card');
    card.classList.toggle('is-grave', !!(exact && exact.grave));
    card.querySelector('.card__k').textContent = exact ? 'Judea · hechos y gobernantes' : 'Judea · último hecho';
    $('#z-jud').textContent = j.titulo; $('#z-jud-s').textContent = j.fecha;
    gsap.fromTo(['#z-date', '#z-emp', '#z-jud'], { opacity: 0.2, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'expo.out' });
  }
  setIdx(0);
  const o = { k: 0 };
  gsap.to(o, {
    k: N, ease: 'none',
    scrollTrigger: { id: 'pin-zoom', trigger: '#zoom', start: 'top top', end: '+=420%', pin: true, scrub: 0.8,
      snap: reduced ? false : { snapTo: 1 / N, duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: 'power1.inOut' } },
    onUpdate: () => {
      ph.style.left = (o.k / N) * lanes.clientWidth + 'px';
      setIdx(Math.round(o.k));
    },
  });
}

function buildMapa() {
  const svg = $('#map-frame svg');
  const NS = 'http://www.w3.org/2000/svg';
  const fx = svg.querySelector('.map-fx');
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || fx).appendChild(e); return e; };

  const scalable = [];
  regiones.forEach(([t, x, y, kind]) => { const e = el('text', { x, y, class: 'map-lab' + (kind ? ' map-lab--' + kind : '') }); e.textContent = t; scalable.push([e, x, y]); });

  // Judea: llamada
  const call = el('g', { class: 'city', id: 'judea-call' });
  scalable.push([call, 622, 444.6]);
  el('path', { d: 'M622 444.6 L652 469 L660 492', fill: 'none', stroke: 'rgba(241,232,216,.6)', 'stroke-width': '.8' }, call);
  el('rect', { x: 618, y: 492, width: 124, height: 40, rx: 3, fill: 'rgba(16,11,9,.85)', stroke: 'rgba(241,232,216,.4)', 'stroke-width': '.6' }, call);
  const t1 = el('text', { x: 680, y: 505, 'text-anchor': 'middle', style: 'font-family:var(--f-display);font-size:8px;letter-spacing:.25em;fill:#f1e8d8;stroke:none' }, call); t1.textContent = 'JUDEA';
  const t2 = el('text', { x: 680, y: 516, 'text-anchor': 'middle', style: 'font-size:6.5px;stroke:none;fill:#a8988a' }, call); t2.textContent = 'Bajo Roma desde 63 a.C.';
  const t3 = el('text', { x: 680, y: 525, 'text-anchor': 'middle', style: 'font-size:6.5px;stroke:none;fill:#a8988a' }, call); t3.textContent = 'Provincia desde 6 d.C.';

  const cityEls = ciudades.map((c) => {
    const g = el('g', { class: 'city' + (c.capital ? ' city--capital' : '') + (c.destacada ? ' city--destacada' : '') + (c.oriente ? ' city--oriente' : '') });
    if (c.oriente) {
      el('rect', { x: c.x - 3.2, y: c.y - 3.2, width: 6.4, height: 6.4, transform: `rotate(45 ${c.x} ${c.y})` }, g);
    } else {
      if (c.nt || c.capital) el('circle', { class: 'halo', cx: c.x, cy: c.y, r: c.capital ? 5 : 3.2 }, g);
      el('circle', { class: 'c', cx: c.x, cy: c.y, r: c.capital ? 3.4 : 2.1 }, g);
    }
    const left = c.lado === 'izq';
    const dy = c.arriba ? -6 : c.abajo ? 10 : 2.6;
    const t = el('text', { x: c.x + (left ? -5 : 5), y: c.y + dy, 'text-anchor': left ? 'end' : 'start' }, g);
    t.textContent = c.n;
    scalable.push([g, c.x, c.y]);
    return { c, g };
  });

  const border = svg.querySelector('.border');
  border.setAttribute('pathLength', '2000');
  const eraPaths = $$('.era', svg);
  const legend = $$('#legend li'), bars = $$('#map-steps i');
  const showCity = (c, step) => {
    if (step >= 8) return true;
    if (c.capital) return step >= 1;
    if (c.n === 'Cartago') return step >= 3 && step <= 6;
    if (c.n === 'Alejandría') return step >= 4 && step <= 6;
    if (c.n === 'Londinium') return step >= 5 && step <= 6;
    if (c.n === 'Jerusalén') return step >= 4 && step <= 6;
    if (c.oriente) return step >= 7;
    return false;
  };
  let cur = -1, vbTween = null;
  function setStep(s) {
    if (s === cur) return;
    cur = s;
    const p = mapaPasos[s];
    eraPaths.forEach((e) => {
      const k = +e.dataset.era;
      e.classList.toggle('is-on', s >= k);
      e.classList.toggle('is-new', s === k);
    });
    svg.classList.toggle('show-split', s >= 6);
    svg.classList.toggle('show-judea', s === 4 || s === 8);
    $('#judea-call').classList.toggle('is-on', s === 4 || s === 8);
    cityEls.forEach(({ c, g }, k) => { g.style.transitionDelay = s === 8 ? k * 0.06 + 's' : '0s'; g.classList.toggle('is-on', showCity(c, s)); });
    legend.forEach((li) => li.classList.toggle('is-on', s >= 1 && (+li.dataset.l <= s || s === 8)));
    bars.forEach((b, k) => b.classList.toggle('is-on', k <= s));
    const vb = isMobile() && s === 0 ? [40, 90, 720, 480] : p.vb;
    flyTo(vb);
    gsap.fromTo(['#m-rango', '#m-titulo', '#m-texto'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out' });
    $('#m-rango').textContent = p.rango; $('#m-titulo').textContent = p.titulo; $('#m-texto').textContent = p.texto;
  }
  // Vuelo de cámara del mapa: durante el movimiento se anima solo un transform (GPU, sin redibujar
  // los ~150 KB de trazos); al llegar se fija el viewBox una sola vez y el mapa queda nítido.
  let curVb = mapaPasos[0].vb.slice();
  function fit(v) {
    const W = svg.clientWidth, H = svg.clientHeight;
    const k = Math.min(W / v[2], H / v[3]);
    return { k, ox: (W - v[2] * k) / 2 - v[0] * k, oy: (H - v[3] * k) / 2 - v[1] * k };
  }
  function commit(v) {
    curVb = v.slice();
    svg.setAttribute('viewBox', v.join(' '));
    svg.style.transform = '';
    rescale();
    svg.classList.remove('is-flying');
  }
  function flyTo(target) {
    if (vbTween) { vbTween.kill(); vbTween = null; commit(curVb); }
    if (reduced || target.every((n, i) => n === curVb[i])) { commit(target); return; }
    const from = curVb.slice(), A = fit(from), o = { t: 0 };
    svg.classList.add('is-flying');
    vbTween = gsap.to(o, {
      t: 1, duration: 1.5, ease: 'power3.inOut',
      onUpdate: () => {
        const v = from.map((n, i) => n + (target[i] - n) * o.t);
        curVb = v;
        const F = fit(v), k = F.k / A.k;
        svg.style.transform = `translate3d(${F.ox - k * A.ox}px, ${F.oy - k * A.oy}px, 0) scale(${k})`;
      },
      onComplete: () => { vbTween = null; commit(target); },
    });
  }
  function rescale() {
    const w = svg.viewBox.baseVal.width || 780;
    const k = Math.max(0.42, Math.min(1, w / 640));
    scalable.forEach(([e, x, y]) => e.setAttribute('transform', `translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`));
  }
  svg.setAttribute('viewBox', mapaPasos[0].vb.join(' '));
  rescale();
  setStep(0);
  const steps = mapaPasos.length;
  gsap.timeline({
    scrollTrigger: { id: 'pin-mapa', trigger: '#mapa', start: 'top top', end: '+=' + steps * 70 + '%', pin: true, scrub: 1,
      onUpdate: (self) => setStep(Math.min(steps - 1, Math.floor(self.progress * steps * 0.999 + 0.0001))) },
  }).fromTo(border, { strokeDashoffset: 2000 }, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
    .to({}, { duration: steps - 1 });
}

function buildCreditos() {
  gsap.fromTo('#names li', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: 'expo.out',
    scrollTrigger: { trigger: '#names', start: 'top 85%', toggleActions: 'play none none reverse' } });
}

/* ————————————————— niebla entre capítulos + seguimiento ————————————————— */
function buildTransitions() {
  const sections = $$('.ch');
  sections.forEach((sec, i) => {
    if (i === 0) return;
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 95%', end: 'top 5%', scrub: true } })
      .fromTo('#fog', { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 0.9, scale: 1.05, duration: 0.5, ease: 'power1.in', force3D: true })
      .to('#fog', { autoAlpha: 0, scale: 1, duration: 0.5, ease: 'power1.out', force3D: true });
  });
  $$('[data-split]').forEach((el) => {
    if (el.closest('#inicio')) return;
    const chars = splits.get(el);
    gsap.set(chars, { opacity: 0 });
    ScrollTrigger.create({ trigger: el, start: 'top 82%', once: false,
      onEnter: () => revealChars(chars), onEnterBack: () => revealChars(chars) });
  });

  let chapterStarts = [];
  const measure = () => {
    chapterStarts = sections.map((sec) => {
      const st = ScrollTrigger.getById('pin-' + sec.id);
      return st ? st.start : sec.getBoundingClientRect().top + window.scrollY;
    });
  };
  ScrollTrigger.addEventListener('refresh', measure);
  measure();
  let lastScroll = window.scrollY, lastT = performance.now();
  ScrollTrigger.create({
    trigger: '#main', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      if (hall) hall.setProgress(self.progress);
      const probe = window.scrollY + window.innerHeight * 0.55;
      let ch = 0;
      chapterStarts.forEach((y, k) => { if (probe >= y) ch = k; });
      setChapter(ch);
      const pct = Math.round(self.progress * 100);
      $('#hud-pct').textContent = String(pct).padStart(3, '0');
      $('#hud-ring').style.strokeDashoffset = 100 - pct;
      const now = performance.now();
      audio.setEnergy(Math.abs(window.scrollY - lastScroll) / Math.max(16, now - lastT) / 4);
      lastScroll = window.scrollY; lastT = now;
    },
  });
}

/* ————————————————— arranque ————————————————— */
function init() {
  buildHero();
  buildDaniel();
  buildLinea();
  buildZoom();
  buildMapa();
  buildCreditos();
  buildTransitions();
  setChapter(0);
  ScrollTrigger.refresh();
}
init();

const heroChars = splits.get($('.hero__title'));
gsap.set(heroChars, { opacity: 0 });
gsap.set(['#hero-inner .eyebrow', '#hero-inner .lead', '.reticle', '#scroll-hint'], { opacity: 0 });
const go = () => {
  revealChars(heroChars, { duration: 1.6, stagger: { each: 0.06, from: 'center' } });
  gsap.fromTo(['.reticle', '#hero-inner .eyebrow', '#hero-inner .lead', '#scroll-hint'], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, delay: 0.5, ease: 'expo.out' });
  gsap.from('.hud__top, .hud__bottom, .hud__nav', { opacity: 0, duration: 1.4, delay: 0.8, ease: 'power2.out' });
};
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
Promise.all([fontsReady, statueReady, runLoader()]).then(() => { ScrollTrigger.refresh(); go(); });
