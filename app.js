const $ = s => document.querySelector(s);

/* ===== Блёстки: 3 кадра «гифки» на canvas ===== */
function glitter(base, flakes) {
  const T = 64, cv = document.createElement('canvas'); cv.width = T; cv.height = T * 3; const c = cv.getContext('2d');
  const cells = []; for (let y = 0; y < T; y += 2) for (let x = 0; x < T; x += 2) cells.push([x, y, flakes[Math.random() * flakes.length | 0]]);
  for (let f = 0; f < 3; f++) {
    const g = c.createLinearGradient(0, f * T, T, f * T + T); base.forEach((b, k) => g.addColorStop(k / (base.length - 1), b));
    c.fillStyle = g; c.fillRect(0, f * T, T, T);
    for (const [x, y, col] of cells) { const r = Math.random(); if (r < .5) continue; c.globalAlpha = r > .93 ? 1 : .45; c.fillStyle = r > .93 ? '#fff' : col; c.fillRect(x, y + f * T, 2, 2); }
    c.globalAlpha = 1; c.fillStyle = '#fff';
    for (let k = 0; k < 3; k++) { const x = Math.random() * T, y = f * T + Math.random() * T, s = 2 + Math.random() * 4; c.fillRect(x - s, y, s * 2 + 1, 1); c.fillRect(x, y - s, 1, s * 2 + 1); }
  }
  return `url(${cv.toDataURL()})`;
}
const R = document.documentElement.style;
R.setProperty('--gg', glitter(['#fff4a3', '#ffd700', '#e0a800', '#ffe866', '#c98a00'], ['#fff9c4', '#ffb300', '#8a5a00', '#fffde0']));
R.setProperty('--gp', glitter(['#ffc1e8', '#ff3fb4', '#ff8ad4', '#e0007a'], ['#fff', '#ffd1f0', '#a3005a', '#ff63c3']));

/* ===== WordArt по буквам ===== */
document.querySelectorAll('.wordart[data-text]').forEach(h => {
  let i = 0;
  h.innerHTML = h.dataset.text.split('|').map(line => '<span class="w">' + [...line].map(ch => ch === ' ' ? '<span class="sp"></span>'
    : `<span class="L" data-c="${ch}" style="--i:${i++}"><i>${ch}</i></span>`).join('') + '</span>').join('');
});

/* ===== Имя из ссылки: ?n=Вася ===== */
const nm = new URLSearchParams(location.search).get('n');
if (nm) $('#nameLine').textContent = nm.slice(0, 30) + '!';

/* ===== Гирлянда флажков ===== */
(() => { const box = $('#flags'), cols = ['#ff1493', '#ffd700', '#00e5ff', '#7fff00', '#ff8c00', '#d500f9'], n = innerWidth < 600 ? 11 : 19;
  for (let k = 1; k < n; k++) { const t = k / n, f = document.createElement('i');
    f.style.left = `calc(${t * 100}% - 13px)`; f.style.top = (2 + 120 * t * (1 - t) * .5) + 'px'; f.style.borderTopColor = cols[k % cols.length]; f.style.animationDelay = (-k * .3) + 's'; box.appendChild(f); } })();

/* ===== Windows 98: часы, убегающая «Отмена» ===== */
const clock = () => { const d = new Date(), el = $('#clock'); if (!el) return; el.textContent = d.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'}); };
clock(); setInterval(clock, 15000);
let runs = 0;
function flee(e) {
  const b = $('#noBtn');
  if (runs >= 4) { b.textContent = 'Не можна 🙂'; if (e.type === 'click') openCard(); return; }
  e.preventDefault(); runs++; b.classList.add('run');
  b.style.left = (10 + Math.random() * (innerWidth - 130)) + 'px'; b.style.top = (60 + Math.random() * (innerHeight - 160)) + 'px';
  if (runs === 4) b.textContent = 'Не можна 🙂';
}
$('#noBtn').addEventListener('pointerenter', e => e.pointerType === 'mouse' && runs < 4 && flee(e));
$('#noBtn').addEventListener('click', flee);
$('#openBtn').addEventListener('click', openCard);

/* ===== Открытие: «шашки» как в PowerPoint ===== */
let opened = false;
function openCard() {
  if (opened) return; opened = true;
  try { Music.start(); Music.tada(); } catch (e) {}
  const ch = $('#checker'), W = innerWidth, H = innerHeight, cols = W < 600 ? 6 : 10, w = Math.ceil(W / cols), rows = Math.ceil(H / w);
  for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) {
    const i = document.createElement('i'), off = r % 2 ? -w / 2 : 0;
    Object.assign(i.style, {left: (c * w + off) + 'px', top: (r * w) + 'px', width: w + 1 + 'px', height: w + 1 + 'px', transitionDelay: (c * 70 + (r % 2) * 35) + 'ms'});
    ch.appendChild(i);
  }
  $('#intro').remove(); $('#card').hidden = false; $('#snd').hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => ch.querySelectorAll('i').forEach(i => i.classList.add('go'))));
  setTimeout(() => ch.remove(), 1500);
  FX.start(); setTimeout(() => { FX.burst(innerWidth / 2, innerHeight * .45, 120); FX.rain(); }, 500);
  Heads.start(); Peek.start(); Cube.start(); counter();
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('on'), io.unobserve(e.target))), {threshold: .15});
  document.querySelectorAll('.fx').forEach(el => io.observe(el));
}

/* ===== 3D-куб: презентация «ЛЕГЕНДА» ===== */
const SLIDES = [
  ['cake', 'ІМЕНИННИЦЯ', 'Торт боїться дихати 🎂', '50% 30%'],
  ['laser', 'ГРОЗА ВОЛОСИН', 'Жодна не втекла. Жодна ⚡', '50% 20%'],
  ['tir', 'СНАЙПЕРКА', 'Спершу лазером, потім контрольний 🎯', '50% 30%'],
  ['crown', 'КОРОЛЕВА', 'Корона не тисне. Корона сидить 👑', '50% 15%'],
  ['vogue', 'ЧИТАЧКА', 'Вона читає Vogue. Vogue читає її 📖', '50% 30%'],
  ['sup', 'КАПІТАНКА', 'Сап, весло і повний вперед 🌊', '50% 45%'],
  ['puppies', 'МАЛЬТИМАМА', 'Найпухнастіша коробка року 🐶', '50% 62%'],
  ['liel', 'LIEL\'', 'Окуляри з власним іменем. Рівень 😎', '50% 30%'],
  ['prague', 'ТУРИСТКА', 'Рига, Амстердам, Прага. Далі буде ✈️', '50% 25%'],
  ['madame', 'МАДМАЗЕЛЬ', 'Запальничка є. Запалює й без неї 🤌', '50% 20%'],
  ['heels', 'HEELS', 'Підбори — це не взуття, це аргумент 👠', '50% 35%'],
  ['bday', 'СКОРПІОН', 'Birthday girl у природному середовищі 🦂', '50% 25%']
];
SLIDES.forEach(s => s[0] && (new Image().src = `img/${s[0]}.jpg`));
const Cube = (() => {
  const cube = $('#cube'), F = {}; let cur = 0, busy = false;
  ['front', 'right', 'left', 'top', 'bottom', 'back'].forEach(k => F[k] = cube.querySelector('.f-' + k));
  F.back.innerHTML = F.top.innerHTML = F.bottom.innerHTML = '<div class="big">🦂</div>';
  function fill(el, k) {
    const [img, t, c, pos] = SLIDES[k];
    el.innerHTML = (img ? `<img src="img/${img}.jpg" alt="" style="object-position:${pos}">` : '<div class="big">🦂</div>') +
      `<b class="t">${t}</b><i class="c">${c}</i><em class="n">${k + 1}/${SLIDES.length}</em>`;
  }
  const DIRS = [['right', 'rotateY', -90, 'Куб ←'], ['left', 'rotateY', 90, 'Куб →'], ['bottom', 'rotateX', 90, 'Куб ↑'], ['top', 'rotateX', -90, 'Куб ↓']];
  let dir = DIRS[0];
  function prep() { dir = Math.random() < .6 ? DIRS[Math.random() * 2 | 0] : DIRS[2 + (Math.random() * 2 | 0)]; fill(F[dir[0]], (cur + 1) % SLIDES.length); }
  function next() {
    if (busy || document.hidden) return; busy = true;
    const h = cube.offsetWidth / 2, [side, fn, deg, name] = dir;
    Music.whoosh();
    const a = cube.animate([{transform: `translateZ(${-h}px) ${fn}(0deg)`}, {transform: `translateZ(${-h * 2.1}px) ${fn}(${deg / 2}deg)`}, {transform: `translateZ(${-h}px) ${fn}(${deg}deg)`}],
      {duration: 1250, easing: 'ease-in-out', fill: 'forwards'});
    a.onfinish = () => {
      const old = F.front; F.front = F[side]; F[side] = old; F.front.className = 'face f-front'; old.className = 'face f-' + side; a.cancel();
      cur = (cur + 1) % SLIDES.length; $('#slideNo').textContent = `Слайд ${cur + 1} з ${SLIDES.length}`; $('#fxName').textContent = name;
      if (SLIDES[cur][0] === 'crown') Music.kaching();
      busy = false; prep();
    };
  }
  fill(F.front, 0); prep();
  return { start() { setInterval(next, 3800); } };
})();

/* ===== Счётчик, «Избранное», диалоги ===== */
function counter() {
  let n = 1; try { n = +(localStorage.getItem('lika-visits') || 0) + 1; localStorage.setItem('lika-visits', n); } catch (e) {}
  $('#cnt').innerHTML = [...String(n).padStart(6, '0')].map(d => `<b>${d}</b>`).join('');
}
const MSG = {
  fav: ['Internet Explorer', 'ℹ️', 'Натисніть Ctrl+D, щоб додати листівку в Обране.'],
  home: ['Помилка', '⚠️', 'Програма виконала неприпустиму операцію і буде закрита. А листівка — ні 💋'],
  book: ['Гостьова книга', '📖', 'Гостьова книга переповнена. Спробуйте у 1999 році.']
};
const msg = (t, ico, text) => { $('#msgTitle').textContent = t; $('#msgIco').textContent = ico; $('#msgText').textContent = text; $('#msg').hidden = false; };
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); msg(...MSG[a.dataset.msg]); }));
['#msgOk', '#msgX'].forEach(s => $(s).addEventListener('click', () => $('#msg').hidden = true));
$('#snd').addEventListener('click', () => { const on = Music.toggle(); $('#snd').textContent = on ? '🔊' : '🔇'; });
