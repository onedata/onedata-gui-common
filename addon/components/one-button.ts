/**
 * Button component with API based on ember-bootstrap button. Renders spinner when
 * called action returns a pending promise or when `isPending` is set to true.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2022-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { type Promise } from 'rsvp';
import { tracked } from '@glimmer/tracking';

interface OneButtonSignature {
  Element: HTMLButtonElement;
  Args: OneButtonArgs;
}

type OneButtonStyleType =
  | 'default'
  | 'primary'
  | 'info'
  | 'warning'
  | 'danger'
  | 'link';

type OneButtonSize = 'xs' | 'sm' | 'lg';

type ButtonType = 'button' | 'submit';

interface OneButtonArgs {
  onClick?: () => Promise<void> | void;
  size?: OneButtonSize;
  /** Bootstrap button style */
  type?: OneButtonStyleType;
  disabled?: boolean;
  /** HTML <button> type property */
  buttonType?: ButtonType;
  bubble?: boolean;
  showSpinnerWhenPending?: boolean;
  disableWhenPending?: boolean;
  isPending?: boolean;
}

export default class OneButton extends Component<OneButtonSignature> {
  /**
   * This property will automatically be set when using a click action that
   * supplies the callback with a promise.
   * @type {'default' | 'pending'}
   */
  @tracked
  protected state: 'default' | 'pending' = 'default';

  /**
   * When clicking the button this action is called.
   * @virtual
   */
  get onClick() {
    return this.args.onClick ?? null;
  }

  get type() {
    return this.args.type ?? 'default';
  }

  get buttonType() {
    return this.args.buttonType ?? 'button';
  }

  /**
   * A click event on a button will not bubble up the DOM tree if it has an
   * `onClick` action handler. Set to true to enable the event to bubble.
   * @returns {boolean}
   */
  get bubble(): boolean {
    return this.args.bubble ?? false;
  }

  get size() {
    return this.args.size ?? null;
  }

  get disableWhenPending() {
    return this.args.disableWhenPending ?? true;
  }

  get showSpinnerWhenPending() {
    return this.args.showSpinnerWhenPending ?? true;
  }

  @computed('args.isPending', 'state')
  get isInPendingState() {
    return this.args.isPending || this.state === 'pending';
  }

  @computed('isInPendingState', 'showSpinnerWhenPending')
  get isSpinnerVisible() {
    return this.isInPendingState && this.showSpinnerWhenPending;
  }

  @computed('args.disabled', 'isInPendingState', 'disableWhenPending')
  get isEffDisabled() {
    return this.args.disabled || (this.isInPendingState && this.disableWhenPending);
  }

  @computed('onClick')
  get clickHandler() {
    return () => {
      const clickResult = this.onClick?.();
      if (typeof clickResult?.finally === 'function' && !this.isDestroyed) {
        this.state = 'pending';
        clickResult.finally(() => {
          if (!this.isDestroyed) {
            this.state = 'default';
          }
        });
      }
    };
  }
}
