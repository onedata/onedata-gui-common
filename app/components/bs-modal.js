/**
 * Custom extension of ember-bootstrap bs-modal
 *
 * @module components/bs-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { getOwner } from '@ember/application';
import BsModal from 'ember-bootstrap/components/bs-modal';

export default BsModal.extend({
  /**
   * @override
   */
  fade: computed(function () {
    // disables fade in test environment
    // (then getOwner(this).application === undefined)
    return !!get(getOwner(this), 'application');
  }),
});
