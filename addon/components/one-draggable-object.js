/**
 * Extends draggable-object to fix nested draggable objects bug.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { defer } from 'rsvp';
import DraggableObject from 'ember-drag-drop/components/draggable-object';

export default DraggableObject.extend({
  dragDrop: service(),

  /**
   * @type {Defer | null}
   */
  latestDragDefer: null,

  /**
   * @override
   */
  dragStart() {
    // `if` below fixes error with nested draggable-objects.
    if (this.dragCoordinator.currentDragObject) {
      return;
    }

    this._super(...arguments);

    if (this.isDraggingObject) {
      this.set('latestDragDefer', defer());
      set(this.dragDrop, 'latestDragPromise', this.latestDragDefer.promise);
    }
  },

  /**
   * @override
   */
  dragEnd() {
    this._super(...arguments);

    if (this.latestDragDefer) {
      this.latestDragDefer.resolve();
      this.set('latestDragDefer', null);
    }
  },
});
