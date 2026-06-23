/* Shoreline Theme — collection.js */

class CollectionFilters {
  constructor(formEl) {
    this.form = formEl;
    this.grid = document.querySelector('.collection-grid-products');
    this.count = document.querySelector('.collection-count');
    this.init();
  }

  init() {
    this.form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', Shoreline.utils.debounce(() => this.applyFilters(), 300));
    });

    /* Sort select outside of filter form */
    document.querySelector('[data-sort-select]')?.addEventListener('change', e => {
      this.applyFilters({ sort: e.target.value });
    });
  }

  async applyFilters(extra = {}) {
    const formData = new FormData(this.form);
    const params = new URLSearchParams(formData);

    Object.entries(extra).forEach(([k, v]) => params.set(k, v));

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', url);

    this.grid.style.opacity = '0.5';

    try {
      const res = await fetch(`${url}&section_id={{ section.id }}`);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newGrid = doc.querySelector('.collection-grid-products');
      if (newGrid) {
        this.grid.innerHTML = newGrid.innerHTML;
        window.Shoreline?.scrollReveal?.init();
      }

      const newCount = doc.querySelector('.collection-count');
      if (newCount && this.count) this.count.textContent = newCount.textContent;
    } catch (e) {
      console.warn('Filter error:', e);
    } finally {
      this.grid.style.opacity = '1';
    }
  }
}

class FilterDrawer {
  constructor() {
    this.drawer = document.getElementById('filter-drawer');
    this.openBtn = document.querySelector('[data-open-filters]');
    this.closeBtn = document.querySelector('[data-close-filters]');
    if (!this.drawer) return;
    this.init();
  }

  init() {
    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    document.getElementById('overlay-backdrop')?.addEventListener('click', () => this.close());
  }

  open() {
    this.drawer.removeAttribute('hidden');
    document.getElementById('overlay-backdrop')?.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer.setAttribute('hidden', '');
    document.getElementById('overlay-backdrop')?.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) new CollectionFilters(filterForm);
  new FilterDrawer();
});
