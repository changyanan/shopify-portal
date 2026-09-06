/**
 * Portal 定制:购物车抽屉推荐商品。
 *
 * <portal-cart-recommendations> 由 snippets/portal-cart-recommendations.liquid
 * 渲染在购物车抽屉内。加载策略:
 *  - 抽屉首次可见(IntersectionObserver)时,取购物车最新加入的商品作为锚点,
 *    请求原生推荐接口 /recommendations/products?section_id=portal-cart-recommendations
 *    &intent=related&product_id=... ,由 sections/portal-cart-recommendations.liquid
 *    渲染真实商品卡片后注入;
 *  - 监听原生 shopify:cart:lines-update 事件,锚点商品变化时才重新拉取,
 *    结果按锚点商品缓存,避免购物车数量变化造成请求抖动;
 *  - 无推荐、请求失败或购物车清空时隐藏模块。
 *
 * 快捷加购仅用于单默认变体的商品:POST /cart/add.js 原生接口,成功后通过
 * CartLinesUpdateEvent 通知购物车抽屉/图标等原生组件刷新;售罄、库存不足
 * 等失败场景展示接口返回的真实错误,并同步购物车真实状态。不伪造任何数据。
 */
import { CartLinesUpdateEvent } from '@shopify/events';

const CART_LINES_UPDATE_EVENT = 'shopify:cart:lines-update';
const DEFAULT_LIMIT = 4;
const ERROR_DISPLAY_DURATION = 6000;
const CACHE_MAX_SIZE = 20;

/** 模块级缓存:锚点商品 ID -> 渲染好的推荐内容 HTML,抽屉重渲染后可直接复用 */
const recommendationCache = new Map();

class PortalCartRecommendations extends HTMLElement {
  #anchorProductId = null;
  #abortController = null;
  #errorTimer = null;
  #observer = null;

  connectedCallback() {
    // 主题编辑器内不运行,避免无效请求
    if (window.Shopify?.designMode || this.dataset.designMode) return;

    this.addEventListener('click', this.#handleClick);
    document.addEventListener(CART_LINES_UPDATE_EVENT, this.#handleCartUpdate);

    // 抽屉打开(元素进入视口)时才做首次加载,普通浏览页面不发请求
    this.#observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.#observer?.disconnect();
        this.#load();
      }
    });
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
    document.removeEventListener(CART_LINES_UPDATE_EVENT, this.#handleCartUpdate);
    this.#observer?.disconnect();
    this.#abortController?.abort();
    this.#clearErrorTimer();
  }

  /** @param {MouseEvent} event */
  #handleClick = (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-portal-rec-add]') : null;
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    event.preventDefault();
    this.#addToCart(button);
  };

  /** @param {Event} event */
  #handleCartUpdate = (event) => {
    event.promise
      ?.then(({ detail }) => {
        const items = Array.isArray(detail?.items) ? detail.items : null;
        if (items) {
          this.#syncAnchor(items);
        } else {
          this.#refreshCartThenSync();
        }
      })
      .catch(() => {});
  };

  /**
   * 根据购物车行同步推荐锚点;锚点变化才重新拉取。
   * @param {Array<{product_id?: number|string}>} items
   */
  #syncAnchor(items) {
    if (!items.length) {
      this.#anchorProductId = null;
      this.hidden = true;
      this.querySelector('[data-portal-recs-content]')?.replaceChildren();
      return;
    }

    const anchor = items[items.length - 1]?.product_id;
    if (anchor == null || anchor === '') {
      // 行数据缺 product_id(异常响应),回退到购物车接口
      this.#refreshCartThenSync();
      return;
    }

    const anchorId = String(anchor);
    if (anchorId !== this.#anchorProductId) {
      this.#load(anchorId);
    }
  }

  async #load(anchorId = null) {
    const productId = anchorId ?? (await this.#fetchAnchorFromCart());
    if (!productId) {
      this.hidden = true;
      return;
    }
    this.#anchorProductId = productId;

    const cached = recommendationCache.get(productId);
    if (cached) {
      this.#inject(cached);
      return;
    }

    this.#abortController?.abort();
    const controller = new AbortController();
    this.#abortController = controller;

    try {
      const root = window.Shopify?.routes?.root || '/';
      const limit = Number(this.dataset.limit) || DEFAULT_LIMIT;
      const url =
        `${root}recommendations/products?section_id=${encodeURIComponent(this.dataset.sectionId || '')}` +
        `&intent=related&product_id=${encodeURIComponent(productId)}&limit=${limit}`;

      const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Recommendations request failed: ${response.status}`);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('[data-portal-cart-recs-content]');
      if (!content || !content.children.length) {
        this.hidden = true;
        return;
      }

      if (recommendationCache.size >= CACHE_MAX_SIZE) recommendationCache.clear();
      recommendationCache.set(productId, content.innerHTML);

      // 请求期间锚点已变化,丢弃过期结果
      if (this.#anchorProductId !== productId) return;
      this.#inject(content.innerHTML);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.warn('[portal-cart-recommendations] 加载推荐商品失败:', error);
        this.hidden = true;
      }
    }
  }

  /** @param {string} html */
  #inject(html) {
    const container = this.querySelector('[data-portal-recs-content]');
    if (!container) return;
    container.innerHTML = html;
    this.#clearError();
    this.hidden = false;
  }

  /** 通过原生 /cart.js 读取购物车,返回最新加入行的商品 ID(空购物车返回 null) */
  async #fetchAnchorFromCart() {
    try {
      const cart = await this.#fetchCart();
      const items = Array.isArray(cart.items) ? cart.items : [];
      if (!items.length) return null;
      const anchor = items[items.length - 1]?.product_id;
      return anchor == null || anchor === '' ? null : String(anchor);
    } catch (error) {
      console.warn('[portal-cart-recommendations] 读取购物车失败:', error);
      return null;
    }
  }

  async #fetchCart() {
    const url = `${window.Theme?.routes?.cart_url ?? '/cart'}.js`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
    return response.json();
  }

  /**
   * 重新读取购物车并同步锚点;传入 deferred 时(加购失败场景)按 product-form
   * 的约定 resolve,让购物车抽屉/图标等原生组件同步真实状态。
   * @param {{ resolve: (value?: unknown) => void, reject: (reason?: unknown) => void }?} deferred
   */
  async #refreshCartThenSync(deferred = null) {
    try {
      const cart = await this.#fetchCart();
      const items = Array.isArray(cart.items) ? cart.items : [];
      if (deferred) {
        deferred.resolve({
          cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart),
          detail: {
            didError: true,
            items,
            source: 'portal-cart-recommendations',
          },
        });
      }
      this.#syncAnchor(items);
    } catch (error) {
      deferred?.reject(error);
    }
  }

  /** @param {HTMLButtonElement} button */
  async #addToCart(button) {
    const variantId = button.dataset.variantId;
    if (!variantId) return;

    this.#clearError();
    button.setAttribute('aria-busy', 'true');

    const deferred = CartLinesUpdateEvent.createPromise();
    this.dispatchEvent(
      new CartLinesUpdateEvent({
        action: 'add',
        context: 'cart',
        lines: [{ merchandiseId: variantId, quantity: 1 }],
        promise: deferred.promise,
      })
    );

    try {
      const url = window.Theme?.routes?.cart_add_url ?? '/cart/add.js';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ items: [{ id: Number(variantId), quantity: 1 }] }),
      });
      const data = await response.json();

      if (data.status) {
        // 422 等:售罄/库存不足等,展示接口返回的真实错误并同步购物车状态
        this.#showError(data.description || data.message || this.dataset.errorText);
        this.#refreshCartThenSync(deferred);
        return;
      }

      const cart = await this.#fetchCart();
      deferred.resolve({
        cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart),
        detail: {
          items: cart.items,
          source: 'portal-cart-recommendations',
        },
      });
    } catch (error) {
      deferred.reject(error);
      console.error('[portal-cart-recommendations] 加入购物车失败:', error);
      this.#showError(this.dataset.errorText);
    } finally {
      button.removeAttribute('aria-busy');
    }
  }

  /** @param {string} message */
  #showError(message) {
    const errorElement = this.querySelector('[data-portal-recs-error]');
    if (!errorElement || !message) return;
    errorElement.textContent = message;
    errorElement.hidden = false;
    this.#clearErrorTimer();
    this.#errorTimer = setTimeout(() => {
      errorElement.hidden = true;
    }, ERROR_DISPLAY_DURATION);
  }

  #clearError() {
    this.#clearErrorTimer();
    const errorElement = this.querySelector('[data-portal-recs-error]');
    if (errorElement) errorElement.hidden = true;
  }

  #clearErrorTimer() {
    if (this.#errorTimer) {
      clearTimeout(this.#errorTimer);
      this.#errorTimer = null;
    }
  }
}

if (!customElements.get('portal-cart-recommendations')) {
  customElements.define('portal-cart-recommendations', PortalCartRecommendations);
}
