/**
 * Custom extension of ember-bootstrap bs-modal
 *
 * @module components/bs-modal
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsModal from 'ember-bootstrap/components/bs-modal';
import config from 'ember-get-config';

export default BsModal.extend({
  tagName: '',

  init() {
    this._super(...arguments);

    if (config.environment === 'test') {
      this.setProperties({
        transitionDuration: 1,
        backdropTransitionDuration: 1,
      });
    }
  }
});
