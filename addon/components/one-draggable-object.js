/**
 * Extends draggable-object to fix nested draggable objects bug.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DraggableObject from 'ember-drag-drop/components/draggable-object';

export default DraggableObject.extend({
  dragStart() {
    // `if` below fixes error with nested draggable-objects.
    if (this.get('dragCoordinator.currentDragObject')) {
      return;
    }

    this._super(...arguments);
  },
});
