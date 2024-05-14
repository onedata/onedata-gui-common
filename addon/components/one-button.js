/**
 * Button component with API based on ember-bootstrap button. Renders spinner when
 * called action returns a pending promise or when `isPending` is set to true.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/one-button';

export default class OneButton extends Component {
  tagName = '';
  layout = layout;

  /**
   * When clicking the button this action is called.
   * @virtual
   * @type {() => unknown}
   */
  onClick = null;

  /**
   * @virtual optional
   * @type {boolean}
   */
  disabled = false;

  /**
   * @virtual optional
   * @type {'xs' | 'sm' | 'lg' | null}
   */
  size = null;

  /**
   * @virtual optional
   * @type {'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'link'}
   */
  type = 'default';

  /**
   * A click event on a button will not bubble up the DOM tree if it has an
   * `onClick` action handler. Set to true to enable the event to bubble.
   * @virtual optional
   * @type {boolean}
   */
  bubble = false;

  /**
   * Sets the type of the button, either 'button' or 'submit'.
   * @virtual
   * @type {'button' | 'submit'}
   */
  buttonType = 'button';

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
   * This property will automatically be set when using a click action that
   * supplies the callback with a promise.
   * @type {'default' | 'pending'}
   */
  state = 'default';

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

  @computed('onClick')
  get clickHandler() {
    return () => {
      const clickResult = this.onClick?.();
      if (typeof clickResult?.finally === 'function' && !this.isDestroyed) {
        this.set('state', 'pending');
      }
      clickResult.finally(() => {
        if (!this.isDestroyed) {
          this.set('state', 'default');
        }
      });
    };
  }
}
