/* Shoreline Theme — animations.js */

class ScrollReveal {
  constructor() {
    if (!window.Shoreline?.animations) return;
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });
    this.init();
  }

  init() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger')
      .forEach(el => this.observer.observe(el));
  }

  onIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        this.observer.unobserve(entry.target);
      }
    });
  }

  observe(el) {
    if (!window.Shoreline?.animations) {
      el.classList.add('is-visible');
      return;
    }
    this.observer.observe(el);
  }
}

class Parallax {
  constructor() {
    this.layers = [];
    this.ticking = false;
    this.init();
  }

  init() {
    document.querySelectorAll('.parallax-layer').forEach(el => {
      const ratio = parseFloat(el.dataset.parallaxRatio || '0.4');
      this.layers.push({ el, ratio });
    });
    if (this.layers.length) {
      window.addEventListener('scroll', () => this.requestTick(), { passive: true });
      this.update();
    }
  }

  requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  update() {
    const scrollY = window.pageYOffset;
    this.layers.forEach(({ el, ratio }) => {
      const rect = el.closest('.parallax-wrapper')?.getBoundingClientRect() || el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = scrollY * ratio;
      el.style.transform = `translateY(${offset}px)`;
    });
  }

  add(el, ratio = 0.4) {
    this.layers.push({ el, ratio });
    if (this.layers.length === 1) {
      window.addEventListener('scroll', () => this.requestTick(), { passive: true });
    }
  }
}

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  window.Shoreline = window.Shoreline || {};
  window.Shoreline.scrollReveal = new ScrollReveal();
  window.Shoreline.parallax = new Parallax();
});
