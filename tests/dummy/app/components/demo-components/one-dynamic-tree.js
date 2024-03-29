/**
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { next } from '@ember/runloop';
import { A } from '@ember/array';

export default Component.extend({
  _isValid: null,
  checked: false,
  _searchQuery: '',

  disabledFieldsPaths: null,

  init() {
    this._super(...arguments);
    this.set('disabledFieldsPaths', A());
  },

  actions: {
    valuesChanged(values, isValid) {
      // logs are for component demo purposes
      console.log('Tree values:');
      console.log(values);
      next(() => this.set('_isValid', isValid));
    },
    toggleDisabledState() {
      const disabledFieldsPaths = this.get('disabledFieldsPaths');
      if (disabledFieldsPaths.get('length') > 0) {
        disabledFieldsPaths.clear();
      } else {
        disabledFieldsPaths.pushObjects(['node3', 'node2.node22.node221']);
      }
    },
  },
});
