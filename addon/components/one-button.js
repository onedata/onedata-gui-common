/**
 * Button component with API based on ember-bootstrap button. Renders spinner when
 * called action returns a pending promise or when `isPending` is set to true.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsButton from 'ember-bootstrap/components/bs-button';
import { computed } from '@ember/object';
import {
  attributeBindings,
  classNameBindings,
  classNames,
} from '@ember-decorators/component';
import layout from '../templates/components/one-button';

@classNames('one-button')
@classNameBindings('isInPendingState:pending')
@attributeBindings('isEffDisabled:disabled')
export default class OneButton extends BsButton {
  layout = layout;

  /**
   * @virtual optional
   * @type {boolean}
   */
  isPending = false;

  /**
   * @virtual optional
   * @type {boolean}
   */
  disableWhenPending = true;

  /**
   * @virtual optional
   * @type {boolean}
   */
  showSpinnerWhenPending = true;

  /**
   * @type {boolean}
   */
  @computed('isPending', 'state')
  get isInPendingState() {
    return this.isPending || this.state === 'pending';
  }

  /**
   * @type {ComputedProperty<boolean>}
   */
  @computed('isInPendingState', 'showSpinnerWhenPending')
  get isSpinnerVisible() {
    return this.isInPendingState && this.showSpinnerWhenPending;
  }

  /**
   * @type {ComputedProperty<boolean>}
   */
  @computed('disabled', 'isInPendingState', 'disableWhenPending')
  get isEffDisabled() {
    return this.disabled || (this.isInPendingState && this.disableWhenPending);
  }
}
