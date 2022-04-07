/**
 * @module components/demo-components/space-providers-support-chart
 * @author Michal Borzecki
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { resolve } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import ColorGenerator from 'onedata-gui-common/utils/color-generator';

export default Component.extend({
  // fake space
  space: undefined,

  /**
   * @type {ComputedProperty<Utils.ColorGenerator>}
   */
  colorGenerator: computed(() => new ColorGenerator()),

  /**
   * @type {Object<string, string>}
   */
  providersColors: computed(function providersColors() {
    const colorGenerator = this.get('colorGenerator');
    return {
      1: colorGenerator.generateColorForKey(1),
      2: colorGenerator.generateColorForKey(2),
      3: colorGenerator.generateColorForKey(3),
    };
  }),

  init() {
    this._super(...arguments);

    // generate support size
    const v1 = Math.random() * 100000000;
    const v2 = Math.random() * 100000000;
    const v3 = Math.random() * 100000000;
    const space = {
      name: 'space1',
      providerList: promiseObject(resolve({
        isLoaded: true,
        list: promiseArray(resolve([{
          entityId: '1',
          name: 'provider1 very very very very very very very long name',
        }, {
          entityId: '2',
          name: 'provider2',
        }, {
          entityId: '3',
          name: 'provider3',
        }])),
      })),
      supportSizes: {
        1: v1,
        2: v2,
        3: v3,
      },
      totalSize: v1 + v2 + v3,
    };

    this.set('space', space);
  },
});
