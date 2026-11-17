/* ===== Музыка: MIDI «Happy Birthday» (public domain) + жуткая шкатулка ===== */
const Music = (() => {
  let ac, out, echo, timer, mode = 'happy', on = true, ev = [], i = 0, t0 = 0, beat = .46;
  const MEL = [[7,.75],[7,.25],[9,1],[7,1],[12,1],[11,2],[7,.75],[7,.25],[9,1],[7,1],[14,1],[12,2],
    [7,.75],[7,.25],[19,1],[16,1],[12,1],[11,1],[9,1],[17,.75],[17,.25],[16,1],[12,1],[14,1],[12,2]];
  const ACC = 'CCCCGGGGGGCCCCCCFFFCCGCC';
  const CH = {C:[48,[55,60,64]], G:[43,[53,59,62]], F:[41,[53,57,60]]};
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const minor = m => [4, 9].includes(((m % 12) + 12) % 12) ? m - 1 : m;
  function build() {
    ev = []; let b = 0; const box = mode === 'creepy';
    for (const [s, d] of MEL) { let m = 67 - 7 + s; if (box) m = minor(m) + 12; ev.push({b, m, d, k: box ? 'box' : 'lead'}); b += d; }
    if (!box) for (let k = 0; k < 24; k++) {
      const [bass, st] = CH[ACC[k]], pos = ((k - 1) % 3 + 3) % 3;
      if (pos === 0) ev.push({b: k, m: bass, d: .9, k: 'bass'});
      else st.forEach(m => ev.push({b: k, m, d: .35, k: 'stab'}));
    }
    ev.sort((a, c) => a.b - c.b); beat = box ? .66 : .46;
  }
  function note(e, t) {
    const f = hz(e.m), dur = e.d * beat, g = ac.createGain(); g.connect(e.k === 'box' ? echo : out);
    const o = ac.createOscillator();
    if (e.k === 'lead') {
      o.type = 'square'; o.frequency.value = f;
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 7;
      lfo.connect(lg); lg.connect(o.detune); lfo.start(t); lfo.stop(t + dur + .1);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.085, t + .015); g.gain.setTargetAtTime(.05, t + .05, .1); g.gain.setTargetAtTime(0, t + dur * .9, .04);
    } else if (e.k === 'bass') {
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.2, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    } else if (e.k === 'stab') {
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(.022, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    } else {
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 24;
      const o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'sine'; o2.frequency.value = f * 3.01; g2.gain.value = .25;
      o2.connect(g2); g2.connect(g); o2.start(t); o2.stop(t + 2.2);
      g.gain.setValueAtTime(.16, t); g.gain.exponentialRampToValueAtTime(.001, t + 2.1);
    }
    o.connect(g); o.start(t); o.stop(t + (e.k === 'box' ? 2.3 : dur + .3));
  }
  function tick() {
    while (on && ac.currentTime + .3 > t0 + (ev[i] ? ev[i].b * beat : 24 * beat)) {
      if (i >= ev.length) { t0 += 24 * beat; i = 0; continue; }
      note(ev[i], t0 + ev[i].b * beat); i++;
    }
  }
  function sfx(fn) { if (ac && on) fn(ac.currentTime); }
  return {
    start() {
      if (ac) return;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      try { // iOS: беззвучний режим глушить Web Audio, тихий <audio> перемикає на медіа-канал
        const n = 8000, buf = new Uint8Array(44 + n), dv = new DataView(buf.buffer), w = (o, s) => [...s].forEach((c, k) => buf[o + k] = c.charCodeAt(0));
        w(0, 'RIFF'); dv.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
        dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); w(36, 'data'); dv.setUint32(40, n, true); buf.fill(128, 44);
        const au = new Audio(URL.createObjectURL(new Blob([buf], {type: 'audio/wav'}))); au.loop = true; au.setAttribute('playsinline', ''); au.play().catch(() => {});
        document.addEventListener('visibilitychange', () => document.hidden ? au.pause() : on && au.play().catch(() => {}));
      } catch (e) {}
      ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state !== 'running') ac.resume();
      const wake = () => { if (on && ac.state !== 'running') ac.resume(); }; addEventListener('touchend', wake); addEventListener('click', wake);
      out = ac.createGain(); out.gain.value = .9; const lp = ac.createBiquadFilter(); lp.frequency.value = 3800; out.connect(lp); lp.connect(ac.destination);
      echo = ac.createGain(); const dl = ac.createDelay(), fb = ac.createGain(); dl.delayTime.value = .33; fb.gain.value = .38;
      echo.connect(lp); echo.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(lp);
      build(); t0 = ac.currentTime + .9; timer = setInterval(tick, 60);
      document.addEventListener('visibilitychange', () => document.hidden ? ac.suspend() : on && ac.resume());
    },
    mode(m) { if (!ac) return; mode = m; build(); i = 0; t0 = ac.currentTime + .15; },
    toggle() { on = !on; if (!ac) return on; if (on) { ac.resume(); i = 0; t0 = ac.currentTime + .1; } else ac.suspend(); return on; },
    tada() { sfx(t => [60, 64, 67, 72].forEach((m, k) => note({m, d: 3, k: 'lead'}, t + k * .07))); },
    whoosh() { sfx(t => {
      const n = ac.createBufferSource(), b = ac.createBuffer(1, ac.sampleRate * .6, ac.sampleRate), d = b.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
      n.buffer = b; const f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.Q.value = 1.2;
      f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + .45);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + .2); g.gain.linearRampToValueAtTime(0, t + .58);
      n.connect(f); f.connect(g); g.connect(out); n.start(t); }); },
    kaching() { sfx(t => [2093, 2637, 3136].forEach((f, k) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.12, t + .12 + k * .05); g.gain.exponentialRampToValueAtTime(.001, t + 1 + k * .05);
      o.connect(g); g.connect(out); o.start(t + .12 + k * .05); o.stop(t + 1.2); })); },
    get on() { return on; }
  };
})();

/* ===== Конфетти, серпантин, блёстки (canvas) ===== */
const FX = (() => {
  const cv = document.getElementById('fx'), cx = cv.getContext('2d');
  const COL = ['#ff1493', '#ffd700', '#00e5ff', '#7fff00', '#ff8c00', '#d500f9', '#ffffff', '#ff4081'];
  let W, H, run = false, ambient = true; const C = [], S = [], K = [];
  const r = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
  function size() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  addEventListener('resize', size); size();
  const conf = (x, y, burst) => C.length < 160 && C.push({x, y, vx: burst ? r(-7, 7) : r(-.5, .5), vy: burst ? r(-13, -3) : r(1, 2.2), a: r(0, 6), va: r(-.15, .15), f: r(0, 6), w: r(6, 10), h: r(3, 6), c: pick(COL)});
  const serp = (x, y, burst) => S.length < 16 && S.push({x, y, vx: burst ? r(-4, 4) : r(-.3, .3), vy: burst ? r(-10, -4) : r(.8, 1.6), p: r(0, 6), vp: r(.08, .16), n: 26 | r(0, 14), amp: r(5, 10), c: pick(COL)});
  const spark = (x, y, big) => K.length < 220 && K.push({x, y, vx: r(-.6, .6), vy: big ? r(-1, 1) : r(.2, 1.4), l: 1, dl: r(.012, .03), s: big ? r(5, 10) : r(2.5, 6), c: pick(['#fff', '#fff7a8', '#ffd700', '#ffb3ec', '#b3f5ff'])});
  function star(x, y, s, c, a) {
    cx.globalAlpha = a; cx.fillStyle = c; cx.beginPath();
    cx.moveTo(x, y - s); cx.quadraticCurveTo(x, y, x + s, y); cx.quadraticCurveTo(x, y, x, y + s); cx.quadraticCurveTo(x, y, x - s, y); cx.quadraticCurveTo(x, y, x, y - s); cx.fill();
  }
  function frame() {
    if (!run) return; requestAnimationFrame(frame); cx.clearRect(0, 0, W, H);
    if (ambient) { if (Math.random() < .12) conf(r(0, W), -10); if (Math.random() < .012) serp(r(0, W), -30); if (Math.random() < .35) spark(r(0, W), r(0, H), true); }
    for (let k = C.length; k--;) { const p = C[k];
      p.vy = Math.min(p.vy + .12, 2.6); p.vx *= .985; p.x += p.vx + Math.sin(p.f) * .6; p.y += p.vy; p.a += p.va; p.f += .08;
      if (p.y > H + 20) { C.splice(k, 1); continue; }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.scale(1, Math.cos(p.f)); cx.globalAlpha = 1; cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); }
    for (let k = S.length; k--;) { const s = S[k];
      s.vy = Math.min(s.vy + .08, 1.7); s.vx *= .98; s.x += s.vx; s.y += s.vy; s.p += s.vp;
      if (s.y - s.n * 6 > H) { S.splice(k, 1); continue; }
      cx.globalAlpha = 1; cx.lineCap = 'round';
      for (let j = 0; j < s.n; j++) {
        const a1 = s.p + j * .55, a2 = a1 + .55;
        cx.strokeStyle = Math.cos(a1) > 0 ? s.c : shade(s.c); cx.lineWidth = 1 + 3.5 * Math.abs(Math.cos(a1));
        cx.beginPath(); cx.moveTo(s.x + Math.sin(a1) * s.amp, s.y - j * 6); cx.lineTo(s.x + Math.sin(a2) * s.amp, s.y - (j + 1) * 6); cx.stroke(); } }
    for (let k = K.length; k--;) { const p = K[k]; p.x += p.vx; p.y += p.vy; p.l -= p.dl;
      if (p.l <= 0) { K.splice(k, 1); continue; } star(p.x, p.y, p.s * (0.4 + p.l * .6), p.c, Math.min(1, p.l * 1.6)); }
    cx.globalAlpha = 1;
  }
  const shade = c => c === '#ffffff' ? '#bbbbbb' : c + '99';
  let last = 0;
  addEventListener('pointermove', e => { if (!run) return; const n = performance.now(); if (n - last < 16) return; last = n; spark(e.clientX + r(-6, 6), e.clientY + r(-6, 6)); spark(e.clientX, e.clientY); });
  addEventListener('pointerdown', e => { if (!run) return; for (let k = 0; k < 10; k++) spark(e.clientX + r(-20, 20), e.clientY + r(-20, 20), true); });
  return {
    start() { if (run) return; run = true; frame(); },
    burst(x = W / 2, y = H * .55, n = 90) { for (let k = 0; k < n; k++) conf(x + r(-30, 30), y); for (let k = 0; k < 9; k++) serp(x + r(-40, 40), y); for (let k = 0; k < 30; k++) spark(x + r(-80, 80), y + r(-80, 80), true); },
    rain() { for (let k = 0; k < 12; k++) serp(r(0, W), r(-200, -20)); },
    set ambient(v) { ambient = v; }
  };
})();

/* ===== Летающие головы-херувимы, подглядывание, жуткий режим ===== */
const FACES = ['face_liel', 'face_selfie', 'face_laser', 'face_port'].map(n => `img/${n}.jpg`);
const WING = 'M32,46 C22,28 8,22 0,27 C6,31 3,36 9,38 C3,42 6,47 12,48 C8,53 13,57 19,55 C20,60 27,60 33,53 Z';
const Heads = (() => {
  const box = document.getElementById('heads'), hs = []; let run = false;
  function make(src, k) {
    const d = document.createElement('div'); d.className = 'head';
    d.innerHTML = `<svg viewBox="0 0 86 86" width="86" height="86"><ellipse cx="43" cy="9" rx="17" ry="4.5" fill="none" stroke="#ffd700" stroke-width="3"/>
      <g class="w"><path d="${WING}" fill="#fff" stroke="#e8c200" stroke-width="1.4"/></g>
      <g transform="translate(86 0) scale(-1 1)"><g class="w"><path d="${WING}" fill="#fff" stroke="#e8c200" stroke-width="1.4"/></g></g></svg><img src="${src}" alt="">`;
    box.appendChild(d); hs.push({d, ax: .00011 + k * .000037, ay: .00017 + k * .000029, px: k * 1.7, py: k * 2.3});
  }
  function frame(t) {
    if (!run) return; requestAnimationFrame(frame); const W = innerWidth - 86, H = innerHeight - 86;
    for (const h of hs) { const x = W * (.5 + .48 * Math.sin(t * h.ax * 6 + h.px)), y = H * (.5 + .46 * Math.sin(t * h.ay * 6 + h.py));
      h.d.style.transform = `translate3d(${x}px,${y}px,0) rotate(${Math.sin(t * .002 + h.px) * 12}deg)`; }
  }
  return { start() { if (run) return; run = true; FACES.slice(0, innerWidth < 600 ? 3 : 4).forEach(make); requestAnimationFrame(frame); },
    set show(v) { box.style.display = v ? '' : 'none'; } };
})();

const Peek = (() => {
  const el = document.getElementById('peek'); let tm;
  function once() {
    const side = ['left', 'right', 'bottom'][Math.random() * 3 | 0], W = innerWidth, H = innerHeight;
    el.src = FACES[Math.random() * FACES.length | 0];
    const pos = {left: [-125, H * .35 + Math.random() * H * .3, 90, -60, 0], right: [W + 5, H * .35 + Math.random() * H * .3, -90, 60, 0], bottom: [W * .15 + Math.random() * W * .6, H + 10, 0, 0, -95]}[side];
    el.style.transition = 'none'; el.style.left = pos[0] + 'px'; el.style.top = pos[1] + 'px';
    el.style.transform = `rotate(${pos[2]}deg)`; el.style.opacity = 1; void el.offsetWidth;
    el.style.transition = ''; el.style.transform = `translate(${-pos[3]}px,${pos[4]}px) rotate(${pos[2] * .75}deg)`;
    setTimeout(() => { el.style.transform = `rotate(${pos[2]}deg)`; setTimeout(() => el.style.opacity = 0, 900); }, 2300);
  }
  return { start() { clearTimeout(tm); const loop = () => { once(); tm = setTimeout(loop, 13000 + Math.random() * 9000); }; tm = setTimeout(loop, 9000); } };
})();
