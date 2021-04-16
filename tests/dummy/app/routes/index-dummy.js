import Route from '@ember/routing/route';
import componentsList from 'dummy/components-list';
import smoothscroll from 'npm:smoothscroll-polyfill';

export default Route.extend({
  model() {
    return {
      components: componentsList,
    };
  },

  smoothScrollPolyfill() {
    if (this.get('browser.browser.browserCode') === 'firefox') {
      // Firefox does not handle smooth scroll for perfect scrollbar. Enforce smooth scroll
      // polyfill.
      window.__forceSmoothScrollPolyfill__ = true;
    }
    smoothscroll.polyfill();
  },
});
