/**
 * @module components/demo-components/providers-list
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { A } from '@ember/array';

export default Component.extend({
  // fake spaces
  spaces: A([{
    name: 'space1',
    supportSizes: {
      '1': 2097152,
      '2': 1048576,
      '3': 1048576,
    },
  }, {
    name: 'space2',
    supportSizes: {
      '1': 1048576,
      '2': 2097152,
      '3': 1048576,
    }
  }]),

  // fake providers
  providersData: computed('spaces', function () {
    let spaces = this.get('spaces');
    return A([{
        provider: {
          id: '1',
          name: 'provider1',
          spaces,
        },
        color: '#4BD187',
      },
      {
        provider: {
          id: '2',
          name: 'provider2',
          spaces,
        },
        color: '#3ea5f9',
      },
      {
        provider: {
          id: '3',
          name: 'provider3',
          spaces,
        },
        color: '#EE3F3F',
      },
    ]);
  }),

  selectedSpace: oneWay('spaces.firstObject'),

  // fake provider actions
  providerActions: [{
      text: 'Action',
      action: () => {},
      class: 'action1-trigger',
    },
    {
      text: 'Another action',
      action: () => {},
      class: 'action2-trigger',
    },
  ],
});
