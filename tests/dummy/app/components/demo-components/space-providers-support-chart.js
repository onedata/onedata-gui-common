/**
 * @module components/demo-components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  // fake space
  space: undefined,

  // colors for spaces
  colors: Object.freeze({
    1: '#4BD187',
    2: '#3ea5f9',
    3: '#EE3F3F',
  }),

  init() {
    this._super(...arguments);

    const space = {
      name: 'space1',
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
        },
      ],
    };
    // generate support size
    let v1 = Math.random() * 100000000;
    let v2 = Math.random() * 100000000;
    let v3 = Math.random() * 100000000;
    space.supportSizes = {
      1: v1,
      2: v2,
      3: v3,
    };
    space.totalSize = v1 + v2 + v3;
    this.set('space', space);
  },
});
