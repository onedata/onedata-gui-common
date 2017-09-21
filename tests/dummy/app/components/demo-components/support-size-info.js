/**
 * @module components/demo-components/support-size-table
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  A,
} = Ember;

export default Ember.Component.extend({
  // fake data
  data: null,

  init() {
    this._super(...arguments);

    this.set('data', A([
      Ember.Object.create({
        id: '1',
        label: 'Provider #1',
        value: 1048576,
        color: '#4BD187',
      }),
      Ember.Object.create({
        id: '2',
        label: 'Provider #2',
        value: 2621440,
        color: '#3EA5F9',
      }),
      Ember.Object.create({
        id: '3',
        label: 'Provider #3',
        value: 39321600,
        color: '#EE3F3F',
      })
    ]));
  },
});
