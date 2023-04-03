/**
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { trySet } from '@ember/object';

export default Component.extend({
  modalManager: service(),

  /**
   * @type {String}
   */
  modalResult: 'undefined',

  actions: {
    async showModal() {
      let result = 'undefined';
      await this.get('modalManager').show('unsaved-changes-question-modal', {
        onSubmit: (data) => {
          result = JSON.stringify(data) || 'undefined';
        },
      }).hiddenPromise;
      trySet(this, 'modalResult', result);
    },
  },
});
