/**
 * Shows range store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SingleValuePresenter from './single-value-presenter';

export default SingleValuePresenter.extend({
  classNames: ['range-presenter'],

  /**
   * @override
   */
  dataSpec: Object.freeze({
    type: 'range',
  }),

  /**
   * @override
   */
  async fetchValueContainer() {
    if (!this.getStoreContentCallback) {
      return null;
    }

    const value = await this.getStoreContentCallback?.({
      type: 'rangeStoreContentBrowseOptions',
    }) ?? null;

    return value === null ? null : { success: true, value };
  },
});
