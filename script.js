/* ============================================================
   TALEGGIO — script à prova de balas (funciona nas 2 páginas,
   com ou sem Bootstrap, e destrava cliques presos)
   ============================================================ */
const $ = id => document.getElementById(id);
const hasBootstrap = typeof bootstrap !== 'undefined';

/* ===== 0) DESTRIVA CLIQUES: remove backdrop de modal órfão ===== */
document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(b => b.remove());
document.body.classList.remove('modal-open');
document.body.style.removeProperty('overflow');
document.querySelectorAll('.modal').forEach(m => { m.classList.remove('show'); m.style.display = ''; });

/* ===== fallback de imagens ===== */
const FALLBACK = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
     <rect width="800" height="600" fill="#A23B22"/>
     <path d="M400 230c7 48 37 78 85 85-48 7-78 37-85 85-7-48-37-78-85-85 48-7 78-37 85-85Z" fill="#F4EEE2"/>
   </svg>`);
document.querySelectorAll('img[data-fb]').forEach(img => {
  img.addEventListener('error', () => { img.src = FALLBACK; }, { once: true });
});

/* ===== FALLBACK MANUAL: se o bundle do Bootstrap não carregou
   (rede bloqueada etc.), os componentes continuam funcionando ===== */
if (!hasBootstrap) {
  document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const menu = btn.nextElementSibling;
      document.querySelectorAll('.dropdown-menu.show').forEach(m => { if (m !== menu) m.classList.remove('show'); });
      if (menu) menu.classList.toggle('show');
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown'))
      document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
  });
  document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = document.querySelector(btn.getAttribute('data-bs-target'));
      if (t) t.classList.toggle('show');
    });
  });
  document.querySelectorAll('[data-bs-toggle="modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = document.querySelector(btn.getAttribute('data-bs-target'));
      if (t) { t.classList.add('show'); t.style.display = 'block'; document.body.style.overflow = 'hidden'; }
    });
  });
  document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.closest('.modal');
      if (m) { m.classList.remove('show'); m.style.display = ''; document.body.style.overflow = ''; }
    });
  });
}
function showToast(el) {
  if (hasBootstrap) { bootstrap.Toast.getOrCreateInstance(el, { delay: 2600 }).show(); return; }
  el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600);
}

/* ===== navbar no scroll ===== */
const nav = $('nav');
if (nav) addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 24), { passive: true });

/* ===== revelação no scroll ===== */
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  reveals.forEach(el => io.observe(el));
}

/* ===== contadores animados ===== */
const nums = document.querySelectorAll('.fact-num[data-count]');
if (nums.length) {
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const ioCount = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    ioCount.unobserve(e.target);
    const target = +e.target.dataset.count, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / 1200, 1);
      e.target.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: .6 });
  nums.forEach(el => ioCount.observe(el));
}

/* ===== badge "aberto agora" (só na inicial) ===== */
const openBadge = $('openBadge');
if (openBadge) {
  const n = new Date(), d = n.getDay(), h = n.getHours() + n.getMinutes() / 60;
  const [txt, on] =
    d === 1 ? ['Fechado — o forno descansa às segundas', 'off'] :
    (h >= 12 && h < 15) ? ['Aberto agora · almoço até 15h', 'on'] :
    (h >= 18 && h < 23) ? ['Aberto agora · jantar até 23h', 'on'] :
    h < 12 ? ['Fechado — abrimos hoje às 12h', 'off'] :
    h < 18 ? ['Fechado — jantar a partir das 18h', 'off'] :
             ['Fechado — abrimos amanhã às 12h', 'off'];
  $('openStatus').textContent = txt;
  openBadge.classList.toggle('on', on === 'on');
}

/* ===== foto do prato seguindo o cursor (só na inicial) ===== */
const canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
const fl = $('dish-float');
if (canHover && fl) {
  let mx = -400, my = -400, cx = -400, cy = -400;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function loop() {
    cx += (mx - cx) * .13; cy += (my - cy) * .13;
    const flip = cx > innerWidth - 300;
    const x = flip ? cx - 256 : cx + 28;
    fl.style.transform = `translate(${x}px, ${cy - 176}px) rotate(${flip ? 5 : -5}deg)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('.dish[data-img]').forEach(d => {
    const pre = new Image(); pre.src = d.dataset.img;
    d.addEventListener('mouseenter', () => {
      fl.style.backgroundImage = `url(${d.dataset.img})`;
      fl.classList.add('on');
    });
    d.addEventListener('mouseleave', () => fl.classList.remove('on'));
  });
}

/* ===== formulário de reserva (só na inicial) ===== */
const fHora = $('fHora'), fPessoas = $('fPessoas'), fData = $('fData'), fTel = $('fTel');
if (fHora && fPessoas && fData && fTel) {
  (function fill() {
    const slots = [];
    const push = (a, b) => { for (let m = a * 60; m < b * 60; m += 30)
      slots.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); };
    push(12, 15); push(18, 23);
    fHora.innerHTML = '<option value="" selected disabled>Escolha</option>' +
      slots.map(s => `<option>${s}</option>`).join('');
    fPessoas.innerHTML = '<option value="" selected disabled>Nº</option>' +
      [1,2,3,4,5,6,7,8].map(n => `<option value="${n}">${n} ${n === 1 ? 'pessoa' : 'pessoas'}</option>`).join('') +
      '<option value="9+">9+ (evento)</option>';
    fData.min = new Date().toISOString().slice(0, 10);
  })();

  fTel.addEventListener('input', () => {
    let v = fTel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 7)      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    fTel.value = v;
  });

  $('bookForm').addEventListener('submit', e => {
    e.preventDefault();
    const checks = [
      ['fNome',    v => v.trim().length >= 2],
      ['fTel',     v => v.replace(/\D/g, '').length >= 10],
      ['fData',    v => !!v],
      ['fHora',    v => !!v],
      ['fPessoas', v => !!v]
    ];
    let first = null;
    checks.forEach(([id, ok]) => {
      const el = $(id), bad = !ok(el.value);
      el.closest('.field').classList.toggle('err', bad);
      if (bad && !first) first = el;
    });
    if (first) return first.focus();

    const nome = $('fNome').value.trim().split(' ')[0];
    const quando = new Date(fData.value + 'T12:00:00')
      .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      .replace(/^./, c => c.toUpperCase());
    $('okNome').textContent = nome;
    $('okQuando').textContent = `${quando} · ${fHora.value}`;
    $('okPessoas').textContent = fPessoas.options[fPessoas.selectedIndex].text;
    $('okObs').textContent = $('fObs').value.trim() || 'nenhuma';
    $('okCod').textContent = 'TLG-' + Math.floor(1000 + Math.random() * 9000);
    const m = $('okModal');
    if (hasBootstrap) bootstrap.Modal.getOrCreateInstance(m).show();
    else { m.classList.add('show'); m.style.display = 'block'; document.body.style.overflow = 'hidden'; }
  });
}

/* ===== copiar telefone + toast (só na inicial) ===== */
const copyPhone = $('copyPhone');
if (copyPhone) copyPhone.addEventListener('click', () => {
  (navigator.clipboard ? navigator.clipboard.writeText('+55 11 3061-4477') : Promise.resolve()).catch(() => {});
  showToast($('copyToast'));
});

/* ===== toast de demo (só na página do Bootstrap) ===== */
const bpToastBtn = $('bpToastBtn');
if (bpToastBtn) bpToastBtn.addEventListener('click', () => showToast($('bpToast')));

/* ===== tecla ESC fecha modais manualmente abertos ===== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.show').forEach(m => {
    m.classList.remove('show'); m.style.display = ''; document.body.style.overflow = '';
  });
});

/* ===== ano automático (sempre roda por último) ===== */
const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();