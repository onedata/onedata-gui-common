/**
 * Extends draggable-object to fix bugs.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
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
  dragEnd(event) {
    this._super(...arguments);

    /**
     * BUGFIX
     *
     * Bug description: ember-drag-drop adds opacity to the dragged element.
     * When dragging has ended, then the library resets opacity back to 1.
     * But instead of just removing opacity assigned earlier, it sets it
     * to 1 as an inline style. So every element, which has been dragged at
     * least once, has an additional inline `opacity` CSS rule. It may break
     * styling, because 1) default opacity can be !== 1 and 2) it's hard
     * to override inline rules.
     *
     * Bug solution: when drag ends, we remove opacity from the inline CSS
     * rules set (hoping it was the one defined by the library).
     */
    event.target.style.removeProperty('opacity');

    if (this.latestDragDefer) {
      this.latestDragDefer.resolve();
      this.set('latestDragDefer', null);
    }
  },
});
