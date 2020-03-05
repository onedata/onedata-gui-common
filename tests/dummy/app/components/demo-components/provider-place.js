/**
 * @module components/demo-components/provider-place
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  // fake provider
  provider: Object.freeze({
    id: '1',
    name: 'provider1',
    status: 'online',
    host: '127.0.0.1',
    latitude: 50,
    longitude: 19,
    spaces: [{
      name: 'space1',
      supportSizes: {
        1: 1048576,
      },
    }, {
      name: 'space2',
      supportSizes: {
        1: 1048576,
        2: 2097152,
      },
    }],
  }),
});
