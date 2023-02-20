/**
 * @module components/demo-components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Component.extend({
  selectedItemIndex: 14,

  manyShortItems: computed(function items() {
    return _.range(1, 20).map(i => ({
      id: String(i),
      name: String(i).padStart(2, '0') + '. Pro',
      icon: 'space',
      class: 'provider-online',
    }));
  }),

  items: computed(function items() {
    return _.range(1, 20).map(i => ({
      id: String(i),
      name: i + '. Oneprovider with long name',
      icon: 'space',
      class: 'provider-online',
    }));
  }),

  fewItems: computed(function fewItems() {
    return [{
        id: '1',
        name: 'Kraków',
        icon: 'provider',
      },
      {
        id: '2',
        name: 'Paris',
        icon: 'space',
      },
      {
        id: '3',
        name: 'Lisbon',
        icon: 'group',
        disabled: true,
      },
    ];
  }),

  fewItemsLong: computed(function fewItems() {
    return [{
        id: '1',
        name: 'Lorem ipsum dolor sit amet consectetur adipiscing',
        icon: 'provider',
      },
      {
        id: '2',
        name: 'Aenean ut ornare ex integer at massa',
        icon: 'provider',
      },
    ];
  }),

  fewItemsLongLong: computed(function fewItems() {
    return [{
        id: '1',
        name: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        icon: 'provider',
      },
      {
        id: '2',
        name: 'Aenean ut ornare ex integer at massa magna',
        icon: 'provider',
      },
      {
        id: '3',
        name: 'Integer tempus tortor enim nec mollis odio euismod in',
        icon: 'provider',
      },
    ];
  }),
});
