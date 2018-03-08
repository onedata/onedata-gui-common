import Component from '@ember/component';
import layout from '../templates/components/one-tile';

import { inject as service } from '@ember/service';
import { and } from '@ember/object/computed';

export default Component.extend({
  layout,
  classNames: ['one-tile'],
  classNameBindings: ['isLink:one-tile-link'],

  router: service(),

  /**
   * If true, whole tile is a pseudo-link to aspect
   * @type {boolean}
   */
  isLink: true,

  _isLink: and('isLink', 'aspect'),

  aspect: undefined,

  init() {
    this._super(...arguments);
    if (this.get('_isLink')) {
      this.click = function click() {
        const {
          router,
          aspect,
        } = this.getProperties('router', 'aspect');
        router.transitionTo('onedata.sidebar.content.aspect', aspect);
      }
    }
  },

});
