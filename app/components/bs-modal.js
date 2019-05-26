/**
 * Custom extension of ember-bootstrap bs-modal
 *
 * @module components/bs-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import BsModal from 'ember-bootstrap/components/bs-modal';
import config from 'ember-get-config';

export default BsModal.extend({
  /**
   * @override
   */
  fade: computed(function () {
    // disables fade in test environment
    return config.environment !== 'test';
  }),
});
