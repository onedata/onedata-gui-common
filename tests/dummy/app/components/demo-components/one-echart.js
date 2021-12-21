/**
 * @module components/demo-components/one-echart
 * @author Michal Borzecki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  option: computed(() => ({
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      data: [150, 230, 224, 218, 135, 147, 350],
      type: 'line',
    }],
  })),

  actions: {
    changeOption() {
      const option = this.get('option');
      this.set('option', Object.assign({}, option, {
        series: [{
          data: option.series[0].data.map(val => Math.max(val * Math.random() * 2, 100)),
          type: 'line',
        }],
      }));
    },
  },
});
