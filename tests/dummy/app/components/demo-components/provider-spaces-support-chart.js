/**
 * @module components/demo-components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';

export default Component.extend({
  providerId: 'p1',

  spaces: computed(function spaces() {
    return PromiseArray.create({
      promise: resolve([{
        id: 'space1',
        name: 'Space 1',
        supportSizes: {
          p1: 1000000,
        },
      }, {
        id: 'space2',
        name: 'Space 2',
        supportSizes: {
          p1: 2000000,
        },
      }]),
    });
  }),
});
