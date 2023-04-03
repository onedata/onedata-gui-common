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
   * Resolves when latest drag sequence executed dragend event. It helps to
   * solve issue with unmounting dragged component before `dragend` event
   * happened, which breaks down ember-drag-drop addon logic. You should always
   * wait for this promise to resolve before you consume information about
   * successful drop.
   *
   * @type {Promise<void>}
   */
  latestDragPromise: resolve(),
});
