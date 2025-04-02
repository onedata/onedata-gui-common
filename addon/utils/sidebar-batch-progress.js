// FIXME: jsdoc

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { defer } from 'rsvp';

// FIXME: jeśli nie będzie nic specyficznego, to można zmienić nazwę na bardziej generyczną
// nawet nie BatchProgress, a Progress?
export default class SidebarBatchProgress {
  #totalCount = 0;

  @tracked
  doneCount = 0;

  get totalCount() {
    return this.#totalCount;
  }

  get donePromise() {
    return this.doneDefer.promise;
  }

  /**
   * @param {number} totalCount
   */
  constructor(totalCount) {
    /** @type {number} */
    this.#totalCount = totalCount;

    // FIXME: debug code
    // this.mockLoading();
  }

  /**
   * Number from 0 to 1 indicating progress.
   * @type {number}
   */
  @computed('doneCount')
  get progress() {
    if (!this.#totalCount) {
      return 0;
    }
    return this.doneCount / this.#totalCount;
  }

  // // FIXME: debug code
  // mockLoading() {
  //   this.doneDefer = defer();
  //   this.increase();
  // }

  // increase() {
  //   this.doneCount += Math.min(Math.floor(this.totalCount / 10), 1);
  //   if (this.progress < 1) {
  //     setTimeout(this.increase.bind(this), 1000);
  //   } else {
  //     this.doneDefer.resolve();
  //   }
  // }
}
