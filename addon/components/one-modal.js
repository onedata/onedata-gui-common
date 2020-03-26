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
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { tag } from 'ember-awesome-macros';

export default BsModal.extend({
  tagName: '',

  /**
   * In original source code modalId depends on elementId which is null here,
   * due to an empty tag.
   * @override
   */
  modalId: tag `${'componentGuid'}-modal`,

  /**
   * In original source code modalId depends on elementId which is null here,
   * due to an empty tag.
   * @override
   */
  backdropId: tag `${'componentGuid'}-backdrop`,

  /**
   * @type {ComputedProperty<String>}
   */
  componentGuid: computed(function componentGuid() {
    return guidFor(this);
  }),

  init() {
    this._super(...arguments);

    if (config.environment === 'test') {
      // 1ms (not 0) for animation to prevent from firing shown and hidden events
      // in the same runloop frame as its' trigger events.
      this.setProperties({
        transitionDuration: 1,
        backdropTransitionDuration: 1,
      });
    }
  }
});
