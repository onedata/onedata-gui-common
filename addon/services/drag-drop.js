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
import { resolve } from 'rsvp';

export default Service.extend({
  dragCoordinator: service(),

  /**
   * @type {ComputedProperty<any>}
   */
  draggedElementModel: getBy(
    'dragCoordinator.currentDragObject',
    'dragCoordinator.currentDragObject.unwrappingKey'
  ),

  /**
   * Promise, which is resolved by dragend event of the latest drag. It helps to
   * solve issue with unmounting dragged component before `dragend` event
   * happened, which breaks down ember-drag-drop addon logic. You should always
   * wait for this promise to resolve before you consume information about
   * successful drop.
   *
   * Usage of this promise is already included in drag'n'drop components. You
   * don't have to consume it on your own.
   *
   * @type {Promise<void>}
   */
  latestDragPromise: resolve(),
});
