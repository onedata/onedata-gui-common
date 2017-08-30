/**
 * @module components/demo-components/one-pie-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  A,
} = Ember;

export default Ember.Component.extend({
  // sample chart data
  chartData: A([
    Ember.Object.create({
      id: '1',
      label: 'Series 1',
      value: 10,
      color: '#4BD187',
    }),
    Ember.Object.create({
      id: '2',
      label: 'Series 2',
      value: 20,
      color: '#3EA5F9',
    }),
    Ember.Object.create({
      id: '3',
      label: 'Series 3',
      value: 30,
      color: '#EE3F3F',
    })
  ]),
});
