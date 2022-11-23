import Route from '@ember/routing/route';
import smoothscroll from 'smoothscroll-polyfill';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
    this.smoothScrollPolyfill();
  },

  smoothScrollPolyfill() {
    // Both Firefox (any version) and Chrome (from version ~103) does not handle
    // smooth scroll for perfect scrollbar. Enforce smooth scroll polyfill.
    window.__forceSmoothScrollPolyfill__ = true;
    smoothscroll.polyfill();
  },
});
