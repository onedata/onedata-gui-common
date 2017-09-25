/**
 * @module components/demo-components/one-way-toggle
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Component.extend({
  // values for toggles
  twoStateToggle: false,
  threeStateToggle: 2,
  disabledToggle: true,

  actions: {
    toggle1FocusOut() {
      console.log('toggle1 focus out');
    }
  }
});
