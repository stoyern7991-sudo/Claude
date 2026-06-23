/* Shoreline Theme — utils.js */

window.Shoreline = window.Shoreline || {};

Shoreline.utils = {
  formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    let value = (cents / 100).toFixed(2);
    const fmt = format || Shoreline.moneyFormat || '${{amount}}';
    return fmt.replace('{{amount}}', value)
              .replace('{{amount_no_decimals}}', Math.floor(cents / 100))
              .replace('{{amount_with_comma_separator}}', value.replace('.', ','));
  },

  debounce(fn, wait) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  },

  throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  trapFocus(el) {
    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    el.addEventListener('keydown', handler);
    if (first) first.focus();

    return () => el.removeEventListener('keydown', handler);
  },

  async fetchCart() {
    const res = await fetch('/cart.js');
    return res.json();
  },

  async addToCart(variantId, quantity = 1, properties = {}) {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity, properties }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async updateCartItem(key, quantity) {
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    });
    return res.json();
  },

  async removeCartItem(key) {
    return Shoreline.utils.updateCartItem(key, 0);
  },

  openDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    const backdrop = document.getElementById('overlay-backdrop');
    if (!drawer) return;
    drawer.removeAttribute('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    document.dispatchEvent(new CustomEvent('shoreline:drawer:open', { detail: { id: drawerId } }));
  },

  closeAllDrawers() {
    document.querySelectorAll('[data-drawer]').forEach(d => {
      d.setAttribute('hidden', '');
      d.setAttribute('aria-hidden', 'true');
    });
    const backdrop = document.getElementById('overlay-backdrop');
    if (backdrop) backdrop.setAttribute('hidden', '');
    document.body.style.overflow = '';
    document.dispatchEvent(new CustomEvent('shoreline:drawer:close'));
  },

  getSelectedVariant(form) {
    const selects = form.querySelectorAll('[name^="option"]');
    const options = [...selects].map(s => s.value);
    const variantId = form.querySelector('[name="id"]');
    return { options, variantId: variantId ? variantId.value : null };
  },
};

/* Backdrop click closes all drawers */
document.addEventListener('DOMContentLoaded', () => {
  const backdrop = document.getElementById('overlay-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => Shoreline.utils.closeAllDrawers());
  }
});
