/**
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';

export default Component.extend({
  providerId: 'p1',

  spacesCount: 16,

  spaces: computed(function spaces() {
    const {
      providerId,
      spacesCount,
    } = this.getProperties('providerId', 'spacesCount');
    const supports = [];
    for (let i = 0; i < spacesCount; ++i) {
      supports.push({
        id: `space${i}`,
        name: `Space ${i}`,
        supportSizes: {
          [providerId]: 1000000,
        },
      });
    }
    return promiseArray(resolve(supports));
  }),
});
