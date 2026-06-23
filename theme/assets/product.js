/* Shoreline Theme — product.js */

class VariantPicker {
  constructor(productEl) {
    this.el = productEl;
    this.productId = productEl.dataset.productId;
    this.picker = productEl.querySelector('.variant-picker');
    if (!this.picker) return;

    this.productData = null;
    this.loadProductData();
    this.init();
  }

  async loadProductData() {
    const res = await fetch(`/products/${this.el.dataset.productHandle}.js`);
    this.productData = await res.json();
  }

  init() {
    this.picker.addEventListener('change', e => {
      if (e.target.matches('.variant-picker__radio, .variant-picker__select')) {
        this.onOptionChange(e.target);
      }
    });
  }

  onOptionChange() {
    if (!this.productData) return;
    const selects = [...this.picker.querySelectorAll('.variant-picker__select')];
    const radios = [...this.picker.querySelectorAll('.variant-picker__radio:checked')];
    const selectedValues = [];

    [...this.picker.querySelectorAll('.variant-picker__option')].forEach((optionEl, i) => {
      const radio = optionEl.querySelector('.variant-picker__radio:checked');
      const select = optionEl.querySelector('.variant-picker__select');
      if (radio) selectedValues[i] = radio.value;
      else if (select) selectedValues[i] = select.value;
    });

    const variant = this.findVariant(selectedValues);

    if (variant) {
      this.updateVariant(variant);
    }
  }

  findVariant(selectedValues) {
    return this.productData.variants.find(v => {
      return selectedValues.every((val, i) => v[`option${i + 1}`] === val);
    });
  }

  updateVariant(variant) {
    /* Update hidden input */
    const input = this.picker.querySelector('.variant-picker__variant-id');
    if (input) input.value = variant.id;

    /* Update price */
    const priceEl = this.el.querySelector('.js-product-price');
    if (priceEl && variant.price) {
      const fmt = Shoreline.utils.formatMoney(variant.price);
      priceEl.querySelector('.price').textContent = fmt;
      if (variant.compare_at_price > variant.price) {
        let compareEl = priceEl.querySelector('.price--compare');
        if (!compareEl) {
          compareEl = document.createElement('span');
          compareEl.className = 'price price--compare';
          priceEl.appendChild(compareEl);
        }
        compareEl.textContent = Shoreline.utils.formatMoney(variant.compare_at_price);
        priceEl.querySelector('.price').classList.add('price--sale');
      } else {
        priceEl.querySelector('.price').classList.remove('price--sale');
        priceEl.querySelector('.price--compare')?.remove();
      }
    }

    /* Update ATC button */
    const atcBtn = this.el.querySelector('.js-atc-btn');
    if (atcBtn) {
      atcBtn.disabled = !variant.available;
      atcBtn.textContent = variant.available ? 'Add to Cart' : 'Sold Out';
      atcBtn.dataset.variantId = variant.id;
    }

    /* Update sticky ATC */
    const stickyPrice = document.getElementById(`sticky-atc-price-${this.productId}`);
    const stickyVariant = document.getElementById(`sticky-atc-variant-${this.productId}`);
    const stickyBtn = document.getElementById(`sticky-atc-btn-${this.productId}`);

    if (stickyPrice) stickyPrice.textContent = Shoreline.utils.formatMoney(variant.price);
    if (stickyVariant) stickyVariant.textContent = variant.title !== 'Default Title' ? variant.title : '';
    if (stickyBtn) {
      stickyBtn.disabled = !variant.available;
      stickyBtn.dataset.variantId = variant.id;
      stickyBtn.textContent = variant.available ? 'Add to Cart' : 'Sold Out';
    }

    /* Update media gallery */
    if (variant.featured_media) {
      document.dispatchEvent(new CustomEvent('shoreline:variant:media', {
        detail: { mediaId: variant.featured_media.id, productId: this.productId }
      }));
    }

    /* Update selected color label */
    [...this.picker.querySelectorAll('.variant-picker__option')].forEach((optionEl, i) => {
      const selectedDisplay = optionEl.querySelector(`[data-option-selected="${i}"]`);
      if (selectedDisplay) selectedDisplay.textContent = variant[`option${i + 1}`];
    });

    /* Update URL */
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url.toString());
  }
}

class MediaGallery {
  constructor(galleryEl) {
    this.gallery = galleryEl;
    this.productId = galleryEl.dataset.productId;
    this.thumbs = [...galleryEl.querySelectorAll('.media-gallery__thumb')];
    this.slides = [...galleryEl.querySelectorAll('.media-gallery__slide')];
    this.dots = [...galleryEl.querySelectorAll('.media-gallery__dot')];

    this.init();
  }

  init() {
    this.thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => this.show(thumb.dataset.mediaId));
    });

    document.addEventListener('shoreline:variant:media', e => {
      if (e.detail.productId === this.productId) {
        this.show(String(e.detail.mediaId));
      }
    });

    /* Mobile swipe */
    const main = this.gallery.querySelector('.media-gallery__main');
    if (main) {
      let startX = 0;
      main.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
      main.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          const current = this.slides.findIndex(s => s.classList.contains('is-active'));
          if (diff > 0) this.showByIndex(current + 1);
          else this.showByIndex(current - 1);
        }
      });
    }
  }

  show(mediaId) {
    this.thumbs.forEach(t => t.classList.toggle('is-active', t.dataset.mediaId === mediaId));
    this.slides.forEach(s => s.classList.toggle('is-active', s.dataset.mediaId === mediaId));
    this.dots.forEach(d => d.classList.toggle('is-active', d.dataset.mediaId === mediaId));
  }

  showByIndex(idx) {
    if (idx < 0 || idx >= this.slides.length) return;
    this.show(this.slides[idx].dataset.mediaId);
  }
}

class StickyATC {
  constructor(productEl) {
    this.productEl = productEl;
    this.productId = productEl.dataset.productId;
    this.mainBtn = productEl.querySelector('.js-atc-btn');
    this.stickyBar = document.getElementById(`sticky-atc-${this.productId}`);
    if (!this.mainBtn || !this.stickyBar) return;

    this.init();
  }

  init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const visible = !entry.isIntersecting;
        this.stickyBar.hidden = !visible;
        this.stickyBar.setAttribute('aria-hidden', !visible);
      });
    }, { threshold: 0, rootMargin: '-10px 0px -10px 0px' });

    observer.observe(this.mainBtn);

    /* Qty buttons in sticky bar */
    this.stickyBar.querySelectorAll('[data-sticky-qty]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = this.stickyBar.querySelector('[data-sticky-qty-input]');
        const delta = parseInt(btn.dataset.stickyQty);
        const current = parseInt(input.value) || 1;
        input.value = Math.max(1, current + delta);
      });
    });

    /* ATC from sticky bar */
    this.stickyBar.addEventListener('click', async e => {
      const btn = e.target.closest('[data-sticky-atc-product]');
      if (!btn || btn.disabled) return;

      btn.classList.add('btn--loading');
      const variantId = parseInt(btn.dataset.variantId);
      const qty = parseInt(this.stickyBar.querySelector('[data-sticky-qty-input]')?.value || '1');

      try {
        await Shoreline.utils.addToCart(variantId, qty);
        Shoreline.utils.openDrawer('cart-drawer');
        document.dispatchEvent(new CustomEvent('shoreline:cart:update'));
      } catch (err) {
        alert(err.description || 'Could not add to cart.');
      } finally {
        btn.classList.remove('btn--loading');
      }
    });
  }
}

class ProductForm {
  constructor(formEl) {
    this.form = formEl;
    this.btn = formEl.querySelector('.js-atc-btn');
    if (!this.btn) return;

    this.form.addEventListener('submit', async e => {
      e.preventDefault();
      this.btn.classList.add('btn--loading');

      const variantId = parseInt(formEl.querySelector('[name="id"]').value);
      const qty = parseInt(formEl.querySelector('[name="quantity"]')?.value || '1');

      try {
        await Shoreline.utils.addToCart(variantId, qty);
        Shoreline.utils.openDrawer('cart-drawer');
        document.dispatchEvent(new CustomEvent('shoreline:cart:update'));
      } catch (err) {
        alert(err.description || 'Could not add to cart. Please try again.');
      } finally {
        this.btn.classList.remove('btn--loading');
      }
    });
  }
}

/* Quick-add on product cards */
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-quick-add]');
  if (!btn) return;
  btn.classList.add('btn--loading');
  const variantId = parseInt(btn.dataset.quickAdd);
  try {
    await Shoreline.utils.addToCart(variantId, 1);
    Shoreline.utils.openDrawer('cart-drawer');
    document.dispatchEvent(new CustomEvent('shoreline:cart:update'));
  } catch (err) {
    alert(err.description || 'Could not add to cart.');
  } finally {
    btn.classList.remove('btn--loading');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-product-page]').forEach(el => {
    new VariantPicker(el);
    new StickyATC(el);

    const form = el.querySelector('[data-product-form]');
    if (form) new ProductForm(form);
  });

  document.querySelectorAll('.media-gallery').forEach(el => new MediaGallery(el));
});
