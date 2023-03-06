/**
 * Hides external implemetation of ember-drag-drop dragCoordinator service behind
 * our API.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { getBy } from 'ember-awesome-macros';

export default Service.extend({
  dragCoordinator: service(),

  /**
   * @type {ComputedProperty<any>}
   */
  draggedElementModel: getBy(
    'dragCoordinator.currentDragObject',
    'dragCoordinator.currentDragObject.unwrappingKey'
  ),
});
