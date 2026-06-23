/* Shoreline Theme — quick-filter.js */
/* Homepage collection tab quick-filter (no page reload) */

class QuickFilter {
  constructor(sectionEl) {
    this.section = sectionEl;
    this.tabs = sectionEl.querySelectorAll('.qf-tab');
    this.grid = sectionEl.querySelector('.qf-grid');
    this.loading = sectionEl.querySelector('.qf-loading');
    this.cache = {};
    this.activeHandle = null;

    if (!this.tabs.length || !this.grid) return;
    this.init();
  }

  init() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });

    /* Load first tab on init */
    const firstTab = this.tabs[0];
    if (firstTab) this.switchTab(firstTab);
  }

  async switchTab(tab) {
    const handle = tab.dataset.collection;
    if (handle === this.activeHandle) return;

    this.tabs.forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    this.activeHandle = handle;

    if (this.cache[handle]) {
      this.renderProducts(this.cache[handle]);
      return;
    }

    this.showLoading();

    try {
      const limit = parseInt(this.section.dataset.limit || '8', 10);
      const res = await fetch(`/collections/${handle}/products.json?limit=${limit}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      this.cache[handle] = data.products;
      this.renderProducts(data.products);
    } catch (e) {
      console.warn('QuickFilter fetch error:', e);
      this.hideLoading();
    }
  }

  renderProducts(products) {
    this.hideLoading();
    this.grid.innerHTML = '';

    if (!products.length) {
      this.grid.innerHTML = '<p class="qf-empty">No products found.</p>';
      return;
    }

    const cols = parseInt(this.section.dataset.cols || '4', 10);

    products.forEach((product, i) => {
      const card = document.createElement('article');
      card.className = 'product-card hover-lift';
      card.style.animationDelay = `${i * 60}ms`;
      card.classList.add('grid-entering');

      const price = this.formatPrice(product.price_min);
      const comparePrice = product.compare_at_price_min && product.compare_at_price_min > product.price_min
        ? this.formatPrice(product.compare_at_price_min)
        : null;

      const img = product.featured_image
        ? `<img src="${this.resizeImg(product.featured_image, 600)}" alt="${this.esc(product.title)}" width="600" loading="lazy" class="product-card__img product-card__img--primary">`
        : `<div class="product-card__img-placeholder skeleton" style="aspect-ratio:3/4;"></div>`;

      const badge = !product.available
        ? '<span class="badge badge--sold-out">Sold Out</span>'
        : comparePrice
          ? '<span class="badge badge--sale">Sale</span>'
          : '';

      card.innerHTML = `
        <a href="/products/${product.handle}" class="product-card__media-link" tabindex="-1" aria-hidden="true">
          <div class="product-card__media hover-zoom">
            ${img}
            <div class="product-card__badges">${badge}</div>
          </div>
        </a>
        <div class="product-card__info">
          <h3 class="product-card__title">
            <a href="/products/${product.handle}" class="product-card__title-link">${this.esc(product.title)}</a>
          </h3>
          <div class="price-group">
            <span class="price${comparePrice ? ' price--sale' : ''}">${price}</span>
            ${comparePrice ? `<span class="price price--compare">${comparePrice}</span>` : ''}
          </div>
        </div>
      `;

      this.grid.appendChild(card);
    });
  }

  formatPrice(cents) {
    const fmt = (window.Shoreline?.moneyFormat || '${{amount}}');
    return fmt.replace('{{amount}}', (cents / 100).toFixed(2));
  }

  resizeImg(src, width) {
    if (!src) return '';
    // Strip any existing Shopify size suffix (_200x, _1200x800, etc.) then insert new one
    return src.replace(/(_\d+x\d*)?\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
      (_, _old, ext, qs) => `_${width}x.${ext}${qs || ''}`);
  }

  esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  showLoading() {
    if (this.loading) this.loading.removeAttribute('hidden');
    this.grid.style.opacity = '0.4';
  }

  hideLoading() {
    if (this.loading) this.loading.setAttribute('hidden', '');
    this.grid.style.opacity = '1';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quick-filter-section').forEach(el => new QuickFilter(el));
});
