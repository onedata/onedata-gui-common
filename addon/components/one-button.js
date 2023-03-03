/**
 * Button component with API based on ember-bootstrap button. Renders spinner when
 * called action returns a pending promise or when `isPending` is set to true.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsButton from 'ember-bootstrap/components/bs-button';
import layout from '../templates/components/one-button';
import { or, eq, raw, and } from 'ember-awesome-macros';

export default BsButton.extend({
  layout,
  classNames: ['one-button'],
  classNameBindings: ['isInPendingState:pending'],
  attributeBindings: ['isEffDisabled:disabled'],

  /**
   * @virtual optional
   * @type {boolean}
   */
  isPending: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  disableWhenPending: true,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showSpinnerWhenPending: true,

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInPendingState: or('isPending', eq('state', raw('pending'))),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSpinnerVisible: and('isInPendingState', 'showSpinnerWhenPending'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEffDisabled: or('disabled', and('isInPendingState', 'disableWhenPending')),
});
