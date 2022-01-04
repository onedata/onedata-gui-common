/**
 * @module components/demo-components/one-histogram
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import OneHistogramConfiguration from 'onedata-gui-common/utils/one-histogram/configuration';

export default Component.extend({
  configuration: computed(() => new OneHistogramConfiguration({
    rawConfiguration: {
      id: 'demoChart',
      title: 'Demo chart',
      yAxes: [{
        id: 'axis1',
        name: 'Axis 1',
        valueFormatter: {
          functionName: 'asPercent',
        },
      }],
    },
    dataSources: {},
  })),
});
