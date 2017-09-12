/**
 * @module components/demo-components/one-dynamic-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  run: {
    next,
  },
  A,
} = Ember;

export default Ember.Component.extend({
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
      console.log(values)
      next(() => this.set('_isValid', isValid));
    },
    toggleDisabledState() {
      let disabledFieldsPaths = this.get('disabledFieldsPaths');
      if (disabledFieldsPaths.get('length') > 0) {
        disabledFieldsPaths.clear();
      } else {
        disabledFieldsPaths.pushObjects(['node3', 'node2.node22.node221']);
      }
    },
    search(query) {
      this.set('_searchQuery', query);
    }
  }
});
