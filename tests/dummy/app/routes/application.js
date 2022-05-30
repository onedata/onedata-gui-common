import Route from '@ember/routing/route';
import smoothscroll from 'smoothscroll-polyfill';
import { inject as service } from '@ember/service';

export default Route.extend({
  browser: service(),

  beforeModel() {
    this._super(...arguments);
    this.smoothScrollPolyfill();
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
