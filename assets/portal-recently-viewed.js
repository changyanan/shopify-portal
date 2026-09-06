/**
 * Portal 定制:最近浏览商品。
 *
 * 浏览历史记录在 localStorage(键:portal-viewed-products,上限 8 个),
 * 与 Horizon 原生 RecentlyViewed(键:viewedProducts,供搜索抽屉使用)互不影响。
 * <portal-recently-viewed> 挂载时排除当前商品,通过 Section Rendering API
 * 请求 /search?q=id:A OR id:B&section_id=portal-recently-viewed 拉取真实商品卡片
 * (卡片由 sections/portal-recently-viewed.liquid 的 search 分支渲染),
 * 按浏览顺序注入列表;无记录、无结果或请求失败时隐藏整个 section。
 */
const STORAGE_KEY = 'portal-viewed-products';
const MAX_STORED = 8;
const DEFAULT_LIMIT = 4;

function getProducts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function addProduct(productId) {
  if (productId == null || productId === '') return;
  let ids = getProducts().filter((id) => id !== String(productId));
  ids.unshift(String(productId));
  ids = ids.slice(0, MAX_STORED);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 隐私模式等写入失败的场景:仅无法跨页记录,不影响当前页面
  }
}

class PortalRecentlyViewed extends HTMLElement {
  connectedCallback() {
    // 主题编辑器内没有顾客浏览记录,服务端已渲染占位图形,不运行逻辑
    if (this.dataset.designMode || window.Shopify?.designMode) return;

    const currentProductId = this.dataset.currentProductId;
    if (currentProductId) addProduct(currentProductId);

    const limit = Number.parseInt(this.dataset.limit, 10);
    const ids = getProducts()
      .filter((id) => id !== currentProductId)
      .slice(0, Number.isNaN(limit) ? DEFAULT_LIMIT : limit);

    if (ids.length === 0) {
      this.#hideSection();
      return;
    }

    this.#load(ids);
  }

  async #load(ids) {
    try {
      const searchUrl = window.Theme?.routes?.search_url || '/search';
      const url = new URL(searchUrl, window.location.origin);
      url.searchParams.set('q', ids.map((id) => `id:${id}`).join(' OR '));
      url.searchParams.set('resources[type]', 'product');
      url.searchParams.set('section_id', this.dataset.sourceSectionId || 'portal-recently-viewed');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const markup = await response.text();
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      const items = [...doc.querySelectorAll('[data-portal-rv-source] [data-portal-rv-item]')];
      const list = this.querySelector('[data-portal-rv-list]');

      if (items.length === 0 || !list) {
        this.#hideSection();
        return;
      }

      list.replaceChildren(...items.map((item) => document.importNode(item, true)));
      list.hidden = false;
    } catch (error) {
      console.warn('[portal-recently-viewed] Failed to load recently viewed products:', error);
      this.#hideSection();
    }
  }

  #hideSection() {
    this.closest('.shopify-section')?.setAttribute('hidden', '');
  }
}

if (!customElements.get('portal-recently-viewed')) {
  customElements.define('portal-recently-viewed', PortalRecentlyViewed);
}
