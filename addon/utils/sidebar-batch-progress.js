// FIXME: jsdoc: może być invalid (nie initialized) albo valid (initialized)

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// FIXME: jeśli nie będzie nic specyficznego, to można zmienić nazwę na bardziej generyczną
// nawet nie BatchProgress, a Progress?
export default class SidebarBatchProgress {
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
        'SidebarBatchProgress.doneCount setter: totalCount must be initialized'
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

  @computed('totalCount')
  get isValid() {
    return typeof this.totalCount === 'number' && this.totalCount > 0;
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
