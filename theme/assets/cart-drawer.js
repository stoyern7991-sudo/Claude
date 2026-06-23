/* Shoreline Theme — cart-drawer.js */

class CartDrawer {
  constructor() {
    this.drawer = document.getElementById('cart-drawer');
    this.body = document.getElementById('cart-drawer-body');
    this.footer = document.getElementById('cart-drawer-footer');
    this.subtotal = document.getElementById('cart-subtotal');
    this.itemCount = document.querySelector('.header__cart-count');
    this.shippingBar = document.getElementById('shipping-bar');
    this.shippingFill = document.getElementById('shipping-bar-fill');
    this.shippingText = document.getElementById('shipping-bar-text');
    this.releaseFocus = null;

    if (!this.drawer) return;
    this.init();
  }

  init() {
    /* Open cart */
    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-cart]')) this.open();
      if (e.target.closest('[data-close-cart]')) this.close();
    });

    /* Close on Esc */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !this.drawer.hidden) this.close();
    });

    /* Qty changes and remove */
    this.drawer.addEventListener('click', async e => {
      const qtyBtn = e.target.closest('[data-cart-qty-change]');
      if (qtyBtn) await this.changeQty(qtyBtn.dataset.cartQtyChange, parseInt(qtyBtn.dataset.delta));

      const removeBtn = e.target.closest('[data-cart-remove]');
      if (removeBtn) await this.removeItem(removeBtn.dataset.cartRemove);
    });

    /* Cart update events */
    document.addEventListener('shoreline:cart:update', () => this.refreshCart());

    /* Update on load */
    this.refreshCart();
  }

  open() {
    Shoreline.utils.openDrawer('cart-drawer');
    this.releaseFocus = Shoreline.utils.trapFocus(this.drawer);
  }

  close() {
    this.drawer.setAttribute('hidden', '');
    this.drawer.setAttribute('aria-hidden', 'true');
    const backdrop = document.getElementById('overlay-backdrop');
    if (backdrop && !document.querySelector('[data-drawer]:not([hidden]):not(#cart-drawer)')) {
      backdrop.setAttribute('hidden', '');
    }
    document.body.style.overflow = '';
    if (this.releaseFocus) { this.releaseFocus(); this.releaseFocus = null; }
  }

  async changeQty(key, delta) {
    const input = this.drawer.querySelector(`[data-cart-qty-input="${key}"]`);
    const current = parseInt(input?.value || '1');
    const newQty = Math.max(0, current + delta);
    await Shoreline.utils.updateCartItem(key, newQty);
    await this.refreshCart();
  }

  async removeItem(key) {
    await Shoreline.utils.removeCartItem(key);
    await this.refreshCart();
  }

  async refreshCart() {
    try {
      const cart = await Shoreline.utils.fetchCart();
      this.renderItems(cart);
      this.updateCount(cart.item_count);
      this.updateSubtotal(cart.total_price);
      this.updateShippingBar(cart.total_price);
    } catch (e) {
      console.warn('Cart refresh error:', e);
    }
  }

  renderItems(cart) {
    if (!this.body) return;

    if (cart.item_count === 0) {
      this.body.innerHTML = `
        <div class="cart-drawer__empty">
          <p class="cart-drawer__empty-text">Your cart is empty.</p>
          <a href="/collections/all" class="btn btn--primary">Shop Now</a>
        </div>`;
      return;
    }

    const fmt = p => Shoreline.utils.formatMoney(p);

    const items = cart.items.map(item => `
      <li class="cart-item" data-cart-item-key="${item.key}">
        <a href="${item.url}" class="cart-item__media">
          <img src="${this.resizeImg(item.image, 160)}" alt="${this.esc(item.title)}" width="80" loading="lazy">
        </a>
        <div class="cart-item__info">
          <a href="${item.url}" class="cart-item__title">${this.esc(item.product_title)}</a>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<p class="cart-item__variant">${this.esc(item.variant_title)}</p>` : ''}
          <div class="cart-item__price-row">
            <span class="price">${fmt(item.final_line_price)}</span>
          </div>
          <div class="cart-item__actions">
            <div class="qty-selector qty-selector--sm">
              <button class="qty-selector__btn" data-cart-qty-change="${item.key}" data-delta="-1" aria-label="Decrease">−</button>
              <input class="qty-selector__input" type="number" value="${item.quantity}" min="0" data-cart-qty-input="${item.key}" aria-label="Quantity">
              <button class="qty-selector__btn" data-cart-qty-change="${item.key}" data-delta="1" aria-label="Increase">+</button>
            </div>
            <button class="cart-item__remove" data-cart-remove="${item.key}" aria-label="Remove ${this.esc(item.title)}">Remove</button>
          </div>
        </div>
      </li>`).join('');

    this.body.innerHTML = `<ul class="cart-items" id="cart-items-list">${items}</ul>`;
  }

  updateCount(count) {
    if (this.itemCount) {
      this.itemCount.textContent = count;
      this.itemCount.setAttribute('aria-label', `Cart (${count} items)`);
    }
    document.querySelectorAll('.header__cart-count').forEach(el => el.textContent = count);
  }

  updateSubtotal(price) {
    if (this.subtotal) {
      this.subtotal.textContent = Shoreline.utils.formatMoney(price);
    }
  }

  updateShippingBar(totalPrice) {
    const threshold = (window.Shoreline?.shippingThreshold || 0) * 100;
    if (!threshold || !this.shippingBar) return;

    const pct = Math.min(100, (totalPrice / threshold) * 100);
    if (this.shippingFill) this.shippingFill.style.width = pct + '%';

    if (this.shippingText) {
      if (totalPrice >= threshold) {
        this.shippingText.textContent = 'You qualify for free shipping!';
      } else {
        const remaining = Shoreline.utils.formatMoney(threshold - totalPrice);
        this.shippingText.textContent = `Add ${remaining} more for free shipping`;
      }
    }
  }

  resizeImg(url, width) {
    if (!url) return '';
    return url.replace(/\.jpg|\.png|\.gif|\.webp/i, match => `_${width}x${match}`);
  }

  esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.Shoreline = window.Shoreline || {};
  window.Shoreline.cartDrawer = new CartDrawer();
});
