/* ============================================================
   SETTLINKS – main.js
   Navigation · Scroll Reveal · Form Handler · FAQ · Toast
   ============================================================ */

/* ── Google Apps Script URL ──────────────────────────────────
   Replace with your deployed GAS Web App URL.
   One URL handles all forms (pass a 'page' hidden field).
   ------------------------------------------------------------ */
const GAS_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

/* ── Mobile nav toggle ── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  /* ── Active nav link ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

  /* ── Form submission (GAS) ── */
  document.querySelectorAll('form[data-gas]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const origText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      const data = new FormData(form);
      // Add page source
      data.append('source_page', document.title);
      data.append('timestamp', new Date().toISOString());

      try {
        // GAS requires no-cors for cross-origin form posts from static sites
        await fetch(GAS_URL, { method: 'POST', body: data, mode: 'no-cors' });
        showToast('Message sent! We'll be in touch shortly.', 'success');
        form.reset();
      } catch (err) {
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        btn.textContent = origText;
        btn.disabled = false;
      }
    });
  });

  /* ── Smooth counter animation ── */
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let started = false;

    const io2 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        animateCount(el, target, suffix, prefix);
      }
    }, { threshold: 0.5 });
    io2.observe(el);
  });
});

/* ── Toast helper ── */
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = type === 'error' ? 'error' : '';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

/* ── Count-up animation ── */
function animateCount(el, target, suffix, prefix) {
  const duration = 1800;
  const start = performance.now();
  const isFloat = String(target).includes('.');

  function step(now) {
    const pct = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - pct, 3);
    const val = target * ease;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (pct < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
