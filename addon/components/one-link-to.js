/**
 * Extends link-to component from Ember and fixes bug with text inputs inside
 * links in Firefox. Without that fix, text inputs cannot handle cursor move
 * and text selection by mouse events.
 *
 * @module components/one-link-to
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LinkComponent from '@ember/routing/link-component';

export default LinkComponent.extend({
  attributeBindings: ['draggable'],

  /**
   * @type {Boolean}
   */
  draggable: false,
});
