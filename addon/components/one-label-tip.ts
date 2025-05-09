/**
 * Inserts 'help' icon with tooltip
 * Typical usage:
 * ```
 * <OneLabelTip @title="tooltip text" />
 * ```
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import Component from '@glimmer/component';

type OneLabelTipSignagure = {
  Element: HTMLSpanElement;
  Args: {
    title: string;
    tooltipClass: string | undefined;
    icon: string | undefined;
    placement: string | undefined;
    triggerEvents: string | undefined;
  };
};

export default class OneLabelTip extends Component<OneLabelTipSignagure> {
  get tooltipClass() {
    return this.args.tooltipClass ?? '';
  }

  /**
   * Text used in tooltip
   * @type {string}
   */
  get title() {
    return this.args.title ?? '';
  }

  /**
   * Icon used as a tooltip trigger (from oneicons icons set)
   * @type {string}
   */
  get icon() {
    return this.args.icon ?? 'sign-question-rounded';
  }

  /**
   * Placement of the tooltip
   * @type {string}
   */
  get placement() {
    return this.args.placement ?? 'top';
  }

  /**
   * The event(s) that should trigger the tooltip
   * @type {string}
   */
  get triggerEvents() {
    return this.args.triggerEvents ?? 'hover';
  }

  get tooltipClassInternal() {
    return `one-label-tooltip ${this.tooltipClass}`;
  }

  /**
   * In mobile mode, it's better to not propagate click event from tip.
   */
  @action
  onClick(clickEvent: Event) {
    clickEvent.preventDefault();
  }
}
