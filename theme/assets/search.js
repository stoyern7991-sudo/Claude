/* Shoreline Theme — search.js */

class PredictiveSearch {
  constructor() {
    this.overlay = document.getElementById('predictive-search-overlay');
    this.input = this.overlay?.querySelector('.search-overlay__input');
    this.results = this.overlay?.querySelector('.search-overlay__results');
    if (!this.input || !this.results) return;

    this.debounceTimer = null;
    this.init();
  }

  init() {
    this.input.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      const q = this.input.value.trim();
      if (q.length < 2) {
        this.results.innerHTML = '';
        return;
      }
      this.debounceTimer = setTimeout(() => this.fetch(q), 250);
    });

    this.results.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (link) this.close();
    });
  }

  async fetch(q) {
    try {
      const res = await fetch(
        `/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product,collection,page&resources[limit]=6`
      );
      const data = await res.json();
      this.render(data.resources.results, q);
    } catch (e) {
      console.warn('Search error:', e);
    }
  }

  render(results, q) {
    const { products = [], collections = [], pages = [] } = results;
    let html = '';

    if (products.length) {
      html += `<div class="search-results__group">
        <p class="search-results__group-label label">Products</p>
        <ul class="search-results__list">
          ${products.map(p => `
            <li class="search-result-item">
              <a href="${p.url}" class="search-result-item__link">
                <img src="${this.resizeImg(p.featured_image?.url, 80)}" alt="${this.esc(p.title)}" width="40" height="40" loading="lazy">
                <div>
                  <p class="search-result-item__title">${this.highlight(p.title, q)}</p>
                  <p class="search-result-item__price">${p.price_min ? Shoreline.utils.formatMoney(p.price_min) : ''}</p>
                </div>
              </a>
            </li>`).join('')}
        </ul>
      </div>`;
    }

    if (collections.length) {
      html += `<div class="search-results__group">
        <p class="search-results__group-label label">Collections</p>
        <ul class="search-results__list">
          ${collections.map(c => `
            <li class="search-result-item">
              <a href="${c.url}" class="search-result-item__link">
                <p class="search-result-item__title">${this.highlight(c.title, q)}</p>
              </a>
            </li>`).join('')}
        </ul>
      </div>`;
    }

    if (!products.length && !collections.length && !pages.length) {
      html = `<p class="search-results__empty">No results for "<strong>${this.esc(q)}</strong>"</p>`;
    }

    html += `<a href="/search?q=${encodeURIComponent(q)}" class="search-results__view-all btn btn--secondary btn--sm">
      View all results for "${this.esc(q)}"
    </a>`;

    this.results.innerHTML = html;
  }

  highlight(str, q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.esc(str).replace(new RegExp(`(${safe})`, 'gi'), '<mark>$1</mark>');
  }

  resizeImg(url, width) {
    if (!url) return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    return url.replace(/\.jpg|\.png|\.gif|\.webp/i, match => `_${width}x${match}`);
  }

  esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PredictiveSearch();
});
