import Route from '@ember/routing/route';
import smoothscroll from 'smoothscroll-polyfill';
import globals from 'onedata-gui-common/utils/globals';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
    this.smoothScrollPolyfill();
  },

  smoothScrollPolyfill() {
    // Both Firefox (any version) and Chrome (from version ~103) don't handle
    // smooth scroll for perfect scrollbar. As Firefox + Chrome cover most of
    // the GUI users, we enforce smooth scroll polyfill in every browser
    // for simplicity.
    globals.window.__forceSmoothScrollPolyfill__ = true;
    smoothscroll.polyfill();
  },
});
