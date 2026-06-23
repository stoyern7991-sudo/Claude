/* Shoreline Theme — header.js */

class SiteHeader {
  constructor() {
    this.header = document.querySelector('.site-header');
    if (!this.header) return;

    this.isHomepage = document.body.classList.contains('template-index');
    this.transparentThreshold = 80;
    this.lastScrollY = 0;

    this.init();
  }

  init() {
    this.setHeight();
    window.addEventListener('resize', Shoreline.utils.debounce(() => this.setHeight(), 150));
    window.addEventListener('scroll', Shoreline.utils.throttle(() => this.onScroll(), 16), { passive: true });
    this.onScroll();

    if (this.isHomepage && this.header.dataset.transparentHome === 'true') {
      this.header.classList.add('is-transparent');
    }
  }

  setHeight() {
    const h = this.header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }

  onScroll() {
    const scrollY = window.pageYOffset;
    const sticky = this.header.dataset.sticky;

    if (sticky === 'always' || sticky === 'scroll-up') {
      if (scrollY > 10) {
        this.header.classList.add('is-sticky', 'is-scrolled');
      } else {
        this.header.classList.remove('is-sticky', 'is-scrolled');
      }
    }

    if (sticky === 'scroll-up') {
      if (scrollY > this.lastScrollY && scrollY > 200) {
        this.header.classList.add('is-hidden');
      } else {
        this.header.classList.remove('is-hidden');
      }
    }

    if (this.isHomepage && this.header.dataset.transparentHome === 'true') {
      if (scrollY > this.transparentThreshold) {
        this.header.classList.remove('is-transparent');
      } else {
        this.header.classList.add('is-transparent');
      }
    }

    this.lastScrollY = scrollY;
  }
}

class MegaMenu {
  constructor() {
    this.items = document.querySelectorAll('.nav-item--has-dropdown');
    this.openItem = null;
    this.init();
  }

  init() {
    this.items.forEach(item => {
      const trigger = item.querySelector('.nav-link');
      const menu = item.querySelector('.mega-menu');
      if (!trigger || !menu) return;

      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');

      item.addEventListener('mouseenter', () => this.open(item));
      item.addEventListener('mouseleave', () => this.close(item));

      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (item.classList.contains('is-open')) {
            this.close(item);
          } else {
            this.open(item);
          }
        }
        if (e.key === 'Escape') this.close(item);
      });

      menu.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.close(item);
          trigger.focus();
        }
      });
    });
  }

  open(item) {
    if (this.openItem && this.openItem !== item) this.close(this.openItem);
    item.classList.add('is-open');
    item.querySelector('.nav-link').setAttribute('aria-expanded', 'true');
    this.openItem = item;
  }

  close(item) {
    item.classList.remove('is-open');
    item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
    if (this.openItem === item) this.openItem = null;
  }
}

class MobileNav {
  constructor() {
    this.drawer = document.getElementById('mobile-nav-drawer');
    this.openBtn = document.querySelector('[data-open-mobile-nav]');
    this.closeBtn = document.querySelector('[data-close-mobile-nav]');
    this.releaseFocus = null;

    if (!this.drawer) return;
    this.init();
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    this.drawer.querySelectorAll('.mobile-nav__toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.mobile-nav__item--has-sub');
        item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', item.classList.contains('is-open'));
      });
    });

    document.getElementById('overlay-backdrop')?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !this.drawer.hidden) this.close();
    });
  }

  open() {
    this.drawer.removeAttribute('hidden');
    document.getElementById('overlay-backdrop')?.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    this.releaseFocus = Shoreline.utils.trapFocus(this.drawer);
  }

  close() {
    this.drawer.setAttribute('hidden', '');
    document.getElementById('overlay-backdrop')?.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (this.releaseFocus) {
      this.releaseFocus();
      this.releaseFocus = null;
    }
    this.openBtn?.focus();
  }
}

/* Search overlay */
class SearchOverlay {
  constructor() {
    this.overlay = document.getElementById('predictive-search-overlay');
    this.input = this.overlay?.querySelector('.search-overlay__input');
    this.triggers = document.querySelectorAll('[data-open-search]');
    this.closeBtn = this.overlay?.querySelector('[data-close-search]');
    this.releaseFocus = null;
    if (!this.overlay) return;
    this.init();
  }

  init() {
    this.triggers.forEach(btn => btn.addEventListener('click', () => this.open()));
    this.closeBtn?.addEventListener('click', () => this.close());
    document.getElementById('overlay-backdrop')?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !this.overlay.hidden) this.close();
    });
  }

  open() {
    this.overlay.removeAttribute('hidden');
    document.getElementById('overlay-backdrop')?.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    this.input?.focus();
    this.releaseFocus = Shoreline.utils.trapFocus(this.overlay);
  }

  close() {
    this.overlay.setAttribute('hidden', '');
    document.getElementById('overlay-backdrop')?.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (this.releaseFocus) { this.releaseFocus(); this.releaseFocus = null; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SiteHeader();
  new MegaMenu();
  new MobileNav();
  new SearchOverlay();
});
