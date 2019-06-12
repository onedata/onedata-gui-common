/**
 * @module components/demo-components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
  items: Object.freeze(_.range(1, 20).map(i => ({
    id: String(i),
    name: i + '. Oneprovider with long name',
    icon: 'provider',
    class: 'provider-online',
  }))),

  fewItems: Object.freeze([{
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
  ]),
});
