/**
 * @module components/demo-components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Component.extend({
  items: computed(function items() {
    return _.range(1, 20).map(i => ({
      id: String(i),
      name: i + '. Oneprovider with long name',
      icon: 'provider',
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
      }
    ];
  }),
});
