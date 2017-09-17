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

    this.set('data', A().pushObjects([
      Ember.Object.create({
        supporterName: 'Provider #1',
        supportSize: 1048576,
      }),
      Ember.Object.create({
        supporterName: 'Provider #2',
        supportSize: 2621440,
      }),
      Ember.Object.create({
        supporterName: 'Provider #3',
        supportSize: 39321600,
      })
    ]));
  },
});
