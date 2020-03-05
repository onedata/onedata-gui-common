/**
 * @module components/demo-components/providers-map-tile
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

export default Component.extend({
  providersProxy: computed(function providersProxy() {
    return PromiseArray.create({
      promise: resolve([{
        id: '1',
        name: 'provider1',
        latitude: 0,
        longitude: 0,
      }, {
        id: '2',
        name: 'provider2',
        latitude: 30,
        longitude: 40,
      }]),
    });
  }),
});
