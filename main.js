// ── NAV SCROLL SHADOW ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ── MOBILE MENU ──
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  m.classList.toggle('open');
}

// ── SCROLL REVEAL ──
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  els.forEach(el => obs.observe(el));
});

// ── 3D SLIDER FACTORY ──
function buildSlider(trackId, dotsId, slides) {
  const track = document.getElementById(trackId);
  const dotsEl = document.getElementById(dotsId);
  if (!track || !dotsEl) return;
  let current = 0;
  track.innerHTML = ''; dotsEl.innerHTML = '';

  slides.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `<img src="${s.src}" alt="${s.label}" loading="lazy"><div class="slide-label">${s.label}</div>`;
    slide.addEventListener('click', () => {
      const pos = parseInt(slide.getAttribute('data-pos') || '0');
      if (pos === -1) { current = (current - 1 + slides.length) % slides.length; render(); }
      else if (pos === 1) { current = (current + 1) % slides.length; render(); }
    });
    track.appendChild(slide);
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => { current = i; render(); });
    dotsEl.appendChild(dot);
  });

  function render() {
    const els = track.children;
    const total = slides.length;
    Array.from(els).forEach((el, i) => {
      let pos = i - current;
      if (pos < -(total / 2)) pos += total;
      if (pos > (total / 2)) pos -= total;
      if (pos < -2) pos = -2;
      if (pos > 2) pos = 2;
      el.setAttribute('data-pos', pos);
    });
    Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  render();

  // Return controls so page can wire prev/next buttons
  return {
    next: () => { current = (current + 1) % slides.length; render(); },
    prev: () => { current = (current - 1 + slides.length) % slides.length; render(); }
  };
}

// ── FORM SUBMIT ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Message Sent — We\'ll be in touch soon!';
    btn.style.background = 'var(--sage)';
  }, 1200);
}
