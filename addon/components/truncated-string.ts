/**
 * A component that truncates text inside it. If text is truncated, tooltip
 * with full text will be shown on hover.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { type SafeString } from 'onedata-gui-common/utils/missing-types';
import type Owner from '@ember/owner';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface TruncatedStringSignature {
  Args: {
    isTooltipDisabled: boolean | undefined,
    customTooltipText: string | SafeString | undefined,
    /**
     * Placement of popover with full text.
     * See Bootstrap 3 docs for available values.
     */
    tooltipPlacement: string,
    tooltipOnShown: () => void | undefined,
    tooltipClass: string | undefined,
  };
  Element: HTMLDivElement;
}

export default class TruncatedStringComponent
  extends Component<TruncatedStringSignature> {

  /**
   * If true, tooltip is visible
   */
  @tracked
  isTooltipShown: boolean = false;

  @tracked
  tooltipText: string = '';

  // Note: leaving empty constructor to be the example for developing TypeScript
  // components.
  constructor(owner: Owner, args: TruncatedStringSignature['Args']) {
    super(owner, args);
  }

  get isTooltipDisabled() {
    return this.args.isTooltipDisabled ?? false;
  }

  get tooltipPlacement() {
    return this.args.tooltipPlacement ?? 'top';
  }

  get tooltipClass() {
    return this.args.tooltipClass ?? '';
  }

  get tooltipTitle() {
    return this.args.customTooltipText ?? this.tooltipText;
  }

  @action
  onMouseEnter(event: Event) {
    const element = event.target;
    if (element === null || !(element instanceof HTMLDivElement)) {
      return;
    }
    this.tooltipText = element.textContent?.trim() ?? '';
    this.isTooltipShown = element.offsetWidth < element.scrollWidth;
  }

  @action
  onMouseLeave() {
    this.isTooltipShown = false;
  }

  @action
  didInsertNode(element: HTMLDivElement): void {
    element.addEventListener('mouseenter', this.onMouseEnter);
    element.addEventListener('mouseleave', this.onMouseLeave);
  }

  @action
  handleTooltipShown() {
    this.args.tooltipOnShown?.();
  }
}
