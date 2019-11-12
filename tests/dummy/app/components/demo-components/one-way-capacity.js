/**
 * @module components/demo-components/one-way-capacity
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  capacity: 1000000,

  actions: {
    capacityChanged(newCapacity) {
      this.set('capacity', newCapacity);
    },
  },
})
