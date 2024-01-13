/**
 * Extends draggable-object to fix bugs.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { defer } from 'rsvp';
import DraggableObject from 'ember-drag-drop/components/draggable-object';

export default DraggableObject.extend({
  dragDrop: service(),

  /**
   * @type {Defer | null}
   */
  latestDragDefer: null,

  didInsertElement() {
    /**
     * BUGFIX
     *
     * Bug description: element is not draggable when one drag occured and then
     * we want to start another drag without leaving and reentering drag handle.
     * It is caused by not receiving mouseover event without reentering drag
     * handle. That mouseover event originally causes `draggable` attribute
     * to be set to `true` and lets drag to start.
     *
     * Bug solution: we listen also for mousedown event and treat it like if
     * it was a mouseover. Even when we don't reenter drag handle, we always
     * trigger mousedown when starting to drag. The rest of the solution code is
     * located in the `willDestroyElement`.
     */
    scheduleOnce('afterRender', () => {
      const dragHandleElement = this.getDragHandleElement();
      if (dragHandleElement) {
        dragHandleElement.addEventListener('mousedown', this.mouseOverHandler);
      }
    });
  },

  willDestroyElement() {
    /**
     * The rest of the bugfix described in `didInsertElement`.
     */
    const dragHandleElement = this.getDragHandleElement();
    if (dragHandleElement) {
      dragHandleElement.removeEventListener('mousedown', this.mouseOverHandler);
    }
  },

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

  /**
   * @returns {HTMLElement | null}
   */
  getDragHandleElement() {
    return (this.dragHandle && this.element?.querySelector(this.dragHandle)) ?? null;
  },
});
