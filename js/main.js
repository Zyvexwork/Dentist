// ═══════════════════════════════════════════════════
//  BrightSmile Dental — Main JavaScript
// ═══════════════════════════════════════════════════

// ─── NAV SCROLL EFFECT ───
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ─── MOBILE NAV ───
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

// ─── ACTIVE NAV LINK ───
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}
setActiveNav();

// ─── SCROLL ANIMATIONS ───
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = (entry.target.dataset.delay || 0) + 'ms';
        entry.target.classList.add('animate-up');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate]').forEach((el, i) => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ─── COUNTER ANIMATION ───
function animateCounter(el) {
  const target = parseFloat(el.dataset.target || el.textContent);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = prefix + value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
}

// ─── TOAST NOTIFICATIONS ───
function showToast(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3800);
}

// ─── FORM VALIDATION ───
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      valid = false;
      if (group) group.classList.add('error');
      field.style.borderColor = 'var(--danger)';
    } else {
      if (group) group.classList.remove('error');
      field.style.borderColor = '';
    }
  });
  return valid;
}

function initForms() {
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm(form)) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      // Simulate async submit
      await new Promise(r => setTimeout(r, 1200));
      btn.textContent = originalText;
      btn.disabled = false;
      const successMsg = form.dataset.success || 'Submitted successfully!';
      showToast(successMsg, 'success');
      form.reset();
      // Save to localStorage for dashboard
      saveSubmission(form);
    });
  });
}

// ─── SAVE SUBMISSIONS FOR DASHBOARD ───
function saveSubmission(form) {
  const type = form.dataset.type || 'general';
  const data = Object.fromEntries(new FormData(form));
  data._timestamp = new Date().toISOString();
  data._type = type;
  const key = `dental_submissions_${type}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift(data);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
  // Also update total count
  const total = parseInt(localStorage.getItem('dental_total_submissions') || '0') + 1;
  localStorage.setItem('dental_total_submissions', total);
}

// ─── TESTIMONIAL SLIDER ───
function initSlider(container) {
  if (!container) return;
  const track = container.querySelector('.testimonial-track');
  const slides = container.querySelectorAll('.testimonial-slide');
  const dotsWrap = container.querySelector('.slider-dots');
  if (!track || !slides.length) return;
  let current = 0;
  let autoTimer;

  const dots = Array.from(slides).map((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(d);
    return d;
  });

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  const prevBtn = container.querySelector('[data-prev]');
  const nextBtn = container.querySelector('[data-next]');
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
  resetTimer();
}

// ─── LIGHTBOX ───
function initLightbox() {
  const items = document.querySelectorAll('[data-lightbox]');
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;cursor:zoom-out;';
  const img = document.createElement('img');
  img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;';
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox;
      img.src = src;
      overlay.style.display = 'flex';
      requestAnimationFrame(() => overlay.style.opacity = '1');
    });
  });
}

// ─── TABS ───
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => {
          p.classList.toggle('active', p.dataset.panel === target);
          p.style.display = p.dataset.panel === target ? 'block' : 'none';
        });
      });
    });
  });
}

// ─── SMOOTH SCROLL ───
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ─── DATE MIN (Appointment Forms) ───
function initDateInputs() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(d => {
    d.min = today;
  });
}

// ─── INIT ALL ───
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCounters();
  initForms();
  initSlider(document.querySelector('.testimonial-slider'));
  initLightbox();
  initTabs();
  initSmoothScroll();
  initDateInputs();
});
