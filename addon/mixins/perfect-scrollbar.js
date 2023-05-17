/**
 * Fork of https://github.com/briarsweetbriar/ember-perfect-scrollbar/
 * that works with new perfect-scrollbar versions.
 *
 * Last upstream update from revision: `01580ba9bcbf6c8dd48a22d5a809e2e0f0da310c`
 *
 * Needs importing `node_modules/perfect-scrollbar/css/perfect-scrollbar.css`
 * to vendor CSS.
 *
 * @author Jakub Liput
 * @copyright (C) 2018 briarsweetbriar
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { isPresent } from '@ember/utils';
import PerfectScrollbar from 'onedata-gui-common/utils/perfect-scrollbar';
import { computed } from '@ember/object';

export default Mixin.create({
  perfectScrollbarOptions: Object.freeze({}),

  perfectScrollbar: undefined,

  init(...args) {
    this._super(...args);

    const resizeService = this.get('resizeService');

    if (isPresent(resizeService)) {
      resizeService.on('debouncedDidResize', this, 'updateScrollbar');
    }
  },

  /**
   * @type {ComputedProperty<Function>}
   */
  updateScrollbarFun: computed(function updateScrollbarFun() {
    return this.updateScrollbar.bind(this);
  }),

  updateScrollbar() {
    this.get('perfectScrollbar').update();
  },

  didInsertElement(...args) {
    this._super(...args);

    const {
      element,
      perfectScrollbarOptions,
      updateScrollbarFun,
    } = this.getProperties('element', 'perfectScrollbarOptions', 'updateScrollbarFun');

    const perfectScrollbar =
      new PerfectScrollbar(element, perfectScrollbarOptions);

    element.addEventListener('transitionend', updateScrollbarFun);

    this.set('perfectScrollbar', perfectScrollbar);
  },

  didRender() {
    this._super(...arguments);
    this.updateScrollbar();
  },

  willDestroyElement(...args) {
    this._super(...args);

    const {
      element,
      resizeService,
      perfectScrollbar,
      updateScrollbarFun,
    } = this.getProperties(
      'element',
      'resizeService',
      'perfectScrollbar',
      'updateScrollbarFun'
    );

    if (isPresent(resizeService)) {
      resizeService.off('debouncedDidResize', this, 'updateScrollbar');
    }

    element.removeEventListener('transitionend', updateScrollbarFun);

    perfectScrollbar.destroy();
  },
});
