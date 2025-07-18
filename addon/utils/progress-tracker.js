/**
 * Intended for storing and computing progress of loading items when number of items is
 * known.
 *
 * It can be in the uninitialized state (when object is created, but no totalCount is
 * provided) or initialized state (when totalCount is known). The uninitialized state is
 * needed for having object reference, but when total count is not yet known. User can add
 * totalCount using `reset(totalCount)` method.
 *
 * In the initialized state, user can increase `doneCount` property and read percentage
 * value from `progress`. The object can be transitioned into uninitialized state if
 * `reset()` is invoked without arguments. When `totalCount` is resetted, the `doneCount`
 * is resetted too.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProgressTracker {
  /**
   * Internal state of total count - do not modify it outside of the class.
   * It is not JS private property because it is used in computed.
   * To get value, readonly `totalCount`. To set new `totalCount`, use `reset` method.
   * @type {number}
   */
  @tracked
  privateTotalCount;

  @tracked
  privateDoneCount;

  /**
   * @param {number} [totalCount]
   */
  constructor(totalCount) {
    this.reset(totalCount);
  }

  /** @type {number} */
  @computed('privateDoneCount')
  get doneCount() {
    return this.privateDoneCount;
  }

  /** @param {number} value */
  set doneCount(value) {
    if (typeof this.totalCount !== 'number') {
      throw new Error(
        'ProgressTracker.doneCount setter: totalCount must be initialized'
      );
    }
    this.privateDoneCount = value;
  }

  @computed('privateTotalCount')
  get totalCount() {
    return this.privateTotalCount;
  }

  /**
   * Number from 0 to 1 indicating progress.
   * @type {number}
   */
  @computed('doneCount', 'totalCount', 'isValid')
  get progress() {
    if (!this.isValid) {
      return 0;
    }
    return this.doneCount / this.totalCount;
  }

  /**
   * The object is considered as valid if it is in initialized state and `totalCount` is a
   * valid positive number.
   * @type {number}
   */
  @computed('totalCount')
  get isValid() {
    return typeof this.totalCount === 'number' && this.totalCount > 0;
  }

  /**
   * Progress in form of integer string from 0% to 100%.
   * @type {string}
   */
  @computed('progress')
  get progressText() {
    return `${Math.floor((this.progress || 0) * 100)}%`;
  }

  /**
   * @param {number|undefined} totalCount If positive number is provided then initialize
   *   valid progress and reset done counter. When no `totalCount` is provided, then the
   *   object will be invalid - it should be initialized to be used.
   */
  reset(totalCount) {
    this.privateTotalCount = totalCount;
    this.privateDoneCount = 0;
  }
}
