/**
 * @module components/demo-components/one-pie-chart
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

import Component from '@ember/component';
import { A } from '@ember/array';

export default Component.extend({
  // sample chart data
  chartData: A([
    EmberObject.create({
      id: '1',
      label: 'Series 1',
      value: 10,
      color: '#4BD187',
    }),
    EmberObject.create({
      id: '2',
      label: 'Series 2',
      value: 20,
      color: '#3EA5F9',
    }),
    EmberObject.create({
      id: '3',
      label: 'Series 3',
      value: 30,
      color: '#EE3F3F',
    }),
  ]),
});
