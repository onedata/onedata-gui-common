/**
 * Extends draggable-object-target to fix bugs.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import DraggableObjectTarget from 'ember-drag-drop/components/draggable-object-target';

export default DraggableObjectTarget.extend({
  dragDrop: service(),

  /**
   * @override
   */
  async handlePayload(payload, event) {
    const obj = this.coordinator.getObject(payload, { target: this });
    await this.dragDrop.latestDragPromise;
    this.action?.(obj, { target: this, event: event });
  },

  /**
   * @override
   */
  handleDragOver(event) {
    this._super(...arguments);

    /**
     * BUGFIX
     *
     * Bug description: on Firefox (checked version: 108) dragging over
     * overlapping draggable targets causes leaving some of them in "accepting"
     * (active) state even when drag leaves droppable area. It does not take
     * place in other browsers.
     *
     * Bug solution: when draggable object target becomes active, find any
     * other active targets and dispatch `dragleave` event on them. It will
     * leave only one active target - the current one.
     */
    getIncorrectAcceptingTargets(event.currentTarget).forEach((target) =>
      deactivateAcceptingTarget(target)
    );
  },
});

/**
 * Returns a list of draggable object targets, which are incorrectly active.
 * There can be only one active target, so any target different from current
 * target is incorrect.
 * @param {HTMLElement} currentAcceptingTarget
 * @returns {Array<HTMLElement>}
 */
function getIncorrectAcceptingTargets(currentAcceptingTarget) {
  return [...document.querySelectorAll('.draggable-object-target.accepts-drag')]
    .filter((target) => target !== currentAcceptingTarget);
}

/**
 * Deactivates active draggable object target by simulating `dragleave` event.
 * @param {HTMLElement} acceptingTarget
 * @returns {void}
 */
function deactivateAcceptingTarget(acceptingTarget) {
  acceptingTarget.dispatchEvent(new Event('dragleave', { bubbles: true }));
}
