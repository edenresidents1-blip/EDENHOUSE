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
// This form now submits natively to Netlify Forms (built into hosting — no
// third-party service, no signup, no verification step, free up to 100
// submissions/month). Netlify auto-detects the form at deploy time because
// it has the data-netlify="true" attribute and a matching hidden
// "form-name" field directly in contact.html.
//
// ONE-TIME SETUP STEP for the site owner (in the Netlify dashboard):
// 1. Go to your site in Netlify → Site configuration → Forms
// 2. Confirm a form named "contact" appears in the list (it's auto-detected
//    on deploy — if it's missing, trigger a new deploy first)
// 3. Go to Forms → Form notifications → Add notification → Email
//    notification, and enter the email address(es) that should receive
//    submissions. That's the only step needed — no third-party account,
//    no email verification link to chase down.
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submitBtn');
  const errorMsg = document.getElementById('formError');
  errorMsg.style.display = 'none';
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const data = new FormData(form);
  const encoded = new URLSearchParams(data).toString();

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encoded
  })
    .then(response => {
      if (response.ok) {
        btn.textContent = '✓ Message Sent — We\'ll be in touch soon!';
        btn.style.background = 'var(--sage)';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    })
    .catch(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      errorMsg.style.display = 'block';
    });
}

// ── CALENDAR LIGHTBOX ──
// Full-size zoomed view for the monthly calendar images (click to enlarge)
function openCalLightbox(src, alt) {
  let box = document.getElementById('calLightbox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'calLightbox';
    box.className = 'cal-lightbox';
    box.innerHTML = '<span class="cal-lightbox-close">&times;</span><img id="calLightboxImg" src="" alt="">';
    box.addEventListener('click', () => box.classList.remove('open'));
    document.body.appendChild(box);
  }
  document.getElementById('calLightboxImg').src = src;
  document.getElementById('calLightboxImg').alt = alt || 'Activities calendar';
  box.classList.add('open');
}

// ── NEWSLETTER SPREAD ──
// Shows newsletter pages two at a time (like an open magazine), with
// prev/next navigation between spreads. Reused across pages.
function initNewsletterSpread(opts) {
  const { containerId, prevId, nextId, dotsId, downloadId, data } = opts;
  const container = document.getElementById(containerId);
  const pages = data.pages;
  const spreads = [];
  for (let i = 0; i < pages.length; i += 2) spreads.push(pages.slice(i, i + 2));

  let current = 0;

  function renderSpread() {
    const spread = spreads[current];
    container.innerHTML = spread.map((p, i) => {
      const pageNum = current * 2 + i + 1;
      return `
        <div class="newsletter-page-frame" onclick="openCalLightbox('${p.src}', '${data.label} — page ${pageNum}')">
          <img src="${p.src}" alt="${data.label} — page ${pageNum}" loading="lazy">
        </div>
      `;
    }).join('');

    const dotsEl = document.getElementById(dotsId);
    if (dotsEl) {
      dotsEl.innerHTML = spreads.map((_, i) =>
        `<span class="slider-dot${i === current ? ' active' : ''}" onclick="window.__newsletterGoTo_${containerId}(${i})"></span>`
      ).join('');
    }
  }

  window['__newsletterGoTo_' + containerId] = (i) => { current = i; renderSpread(); };

  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (prevBtn) prevBtn.addEventListener('click', () => { current = (current - 1 + spreads.length) % spreads.length; renderSpread(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { current = (current + 1) % spreads.length; renderSpread(); });

  const dlEl = document.getElementById(downloadId);
  if (dlEl) dlEl.innerHTML = `<a href="${data.pdf}" download class="btn-outline">⬇ Download Full Newsletter (PDF)</a>`;

  renderSpread();
}
