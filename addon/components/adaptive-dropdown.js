/**
 * Dropdown that renders static list or infinite-scrollable list from options provided
 * with static array.
 *
 * The type of list is evaluated based on length of the provided array.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';

/**
 * @typedef {Object} AdaptiveDropdownSignature
 * @property {AdaptiveDropdownArgs} Args
 */

/**
 * @typedef {import('./infinite-scroll-dropdown').InfiniteScrollDropdownArgs & {
 *   minOptionsForInfiniteScroll: number
 * }} AdaptiveDropdownArgs
 */

export const defaultMinOptionsForInfiniteScroll = 50;

/**
 * @extends {Component<AdaptiveDropdownSignature>}
 */
export default class AdaptiveDropdownComponent extends Component {
  /** @type {number} */
  get minOptionsForInfiniteScroll() {
    return this.args.minOptionsForInfiniteScroll ?? defaultMinOptionsForInfiniteScroll;
  }

  get dropdownComponentName() {
    return (this.args.options?.length ?? 0) >= this.minOptionsForInfiniteScroll ?
      'infinite-scroll-dropdown' : 'one-dropdown';
  }
}
