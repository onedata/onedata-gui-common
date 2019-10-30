/**
 * @module components/demo-components/remove-icon
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  actions: {
    click() {
      alert('Clicked!');
    },
  },
});
