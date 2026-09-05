/**
 * Global Portal enhancements for the official Tinker/Horizon components.
 *
 * The native components remain the source of truth for behavior. This module
 * only keeps the accessibility state of progressive-enhancement controls in
 * sync when their server-rendered content changes.
 */
(() => {
  const syncPredictiveSearch = (component) => {
    const input = component.querySelector('.search-input');
    const results = component.querySelector('[ref="predictiveSearchResults"]');

    if (!(input instanceof HTMLInputElement) || !(results instanceof HTMLElement)) return;

    const sync = () => {
      const resultList = results.querySelector('#predictive-search-results');
      const expanded = resultList instanceof HTMLElement && !resultList.hidden;

      input.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };

    const observer = new MutationObserver(sync);
    observer.observe(results, {
      attributes: true,
      attributeFilter: ['hidden', 'aria-hidden'],
      childList: true,
      subtree: true,
    });

    sync();
  };

  const syncMenuDrawer = (drawer) => {
    const summary = Array.from(drawer.children).find(
      (element) => element instanceof HTMLElement && element.tagName === 'SUMMARY'
    );
    const panel = Array.from(drawer.children).find(
      (element) => element instanceof HTMLElement && element.classList.contains('menu-drawer')
    );

    if (!(summary instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;

    if (!panel.id) panel.id = `${drawer.id || 'header-menu'}-panel`;
    summary.setAttribute('aria-controls', panel.id);

    const sync = () => summary.setAttribute('aria-expanded', drawer.open ? 'true' : 'false');
    drawer.addEventListener('toggle', sync);
    sync();
  };

  const syncSearchDialog = () => {
    const modal = document.getElementById('search-modal');
    const triggers = document.querySelectorAll('[aria-controls="search-modal"]');

    if (!(modal instanceof HTMLElement) || triggers.length === 0) return;

    const sync = () => {
      const open = modal.querySelector('dialog')?.open === true;
      triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', open ? 'true' : 'false'));
    };

    modal.addEventListener('dialog:open', sync);
    modal.addEventListener('dialog:close', sync);
    sync();
  };

  const init = () => {
    document.querySelectorAll('predictive-search-component').forEach(syncPredictiveSearch);
    document.querySelectorAll('.menu-drawer-container').forEach(syncMenuDrawer);
    syncSearchDialog();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
