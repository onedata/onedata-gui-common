/**
 * @module components/demo-components/global-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  modalManager: service(),

  actions: {
    showModal() {
      this.get('modalManager').show('dummy-modal');
    }
  }
})
