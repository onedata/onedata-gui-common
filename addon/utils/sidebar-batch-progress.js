// FIXME: jsdoc

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// FIXME: jeśli nie będzie nic specyficznego, to można zmienić nazwę na bardziej generyczną
// nawet nie BatchProgress, a Progress?
export default class SidebarBatchProgress {
  #totalCount = 0;

  @tracked
  doneCount = 0;

  /**
   * @param {number} totalCount
   */
  constructor(totalCount) {
    /** @type {number} */
    this.#totalCount = totalCount;
  }

  @computed('doneCount')
  get progress() {
    return this.doneCount / this.#totalCount;
  }
}
