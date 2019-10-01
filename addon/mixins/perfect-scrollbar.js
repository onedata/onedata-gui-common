/**
 * Fork of https://github.com/briarsweetbriar/ember-perfect-scrollbar/
 * that works with new perfect-scrollbar versions.
 * 
 * Needs importing `node_modules/perfect-scrollbar/css/perfect-scrollbar.css`
 * to vendor CSS.
 * 
 * @module mixins/perfect-scrollbar
 * @author Jakub Liput
 * @copyright (C) 2018 briarsweetbriar
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import { isPresent } from '@ember/utils';
import PerfectScrollbar from 'npm:perfect-scrollbar';

export default Mixin.create({
  perfectScrollbarOptions: Object.freeze({}),

  perfectScrollbar: undefined,

  init(...args) {
    this._super(...args);

    const resizeService = get(this, 'resizeService');

    if (isPresent(resizeService)) {
      resizeService.on('debouncedDidResize', this, '_resizePerfectScrollbar');
    }
  },

  _resizePerfectScrollbar() {
    this.get('perfectScrollbar').update();
  },

  didInsertElement(...args) {
    this._super(...args);

    const perfectScrollbar =
      new PerfectScrollbar(this.element, this.get('perfectScrollbarOptions'));

    this.set('perfectScrollbar', perfectScrollbar);
  },

  willDestroyElement(...args) {
    this._super(...args);

    const resizeService = this.get('resizeService');

    if (isPresent(resizeService)) {
      resizeService.off('debouncedDidResize', this, '_resizePerfectScrollbar');
    }

    this.get('perfectScrollbar').destroy();
  },
});
