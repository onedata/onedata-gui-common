/**
 * @module components/demo-components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  // fake spaces
  space: {
    name: 'space1',
    // will be generated in init()
    totalSize: 0,
    // will be generated in init()
    supportSizes: {},
    providers: [{
        id: '1',
        name: 'provider1 very very very very very very very long name',
      },
      {
        id: '2',
        name: 'provider2',
      },
      {
        id: '3',
        name: 'provider3',
      }
    ]
  },

  // colors for spaces
  colors: {
    '1': '#4BD187',
    '2': '#3ea5f9',
    '3': '#EE3F3F',
  },

  init() {
    this._super(...arguments);

    // generate support size
    let v1 = Math.random() * 100000000;
    let v2 = Math.random() * 100000000;
    let v3 = Math.random() * 100000000;
    this.get('space').supportSizes = {
      1: v1,
      2: v2,
      3: v3,
    };
    this.get('space').totalSize = v1 + v2 + v3;
  },
});
