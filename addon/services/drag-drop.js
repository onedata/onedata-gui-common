/**
 * Hides external implemetation of ember-drag-drop dragCoordinator service behind
 * our API.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { observer } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { getBy } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import browser, { BrowserName } from 'onedata-gui-common/utils/browser';
import dom from 'onedata-gui-common/utils/dom';

export default Service.extend({
  dragCoordinator: service(),

  /**
   * @public
   * @type {ComputedProperty<any>}
   */
  draggedElementModel: getBy(
    'dragCoordinator.currentDragObject',
    'dragCoordinator.currentDragObject.unwrappingKey'
  ),

  /**
   * @public
   * @type {DragEvent | null}
   */
  lastDragEvent: null,

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

  lastDragEventUpdater: observer(
    'dragCoordinator.currentDragEvent',
    function lastDragEventUpdater() {
      if (
        this.dragCoordinator.currentDragEvent &&
        this.dragCoordinator.currentDragEvent !== this.lastDragEvent
      ) {
        this.set('lastDragEvent', this.dragCoordinator.currentDragEvent);
        if (browser.name === BrowserName.Firefox) {
          // Firefox has broken offsetX/Y property value in drag events - are
          // always set to 0. Calculating them from scratch.
          const elementOffset = dom.offset(this.lastDragEvent.target);
          this.lastDragEvent.offsetX = this.lastDragEvent.pageX - elementOffset.left;
          this.lastDragEvent.offsetY = this.lastDragEvent.pageY - elementOffset.top;
        } else {
          // Getting offsetX/Y here to define their values. It turnes out, that
          // value of these properties is calculated at a time of theirs first get.
          // It is problematic, when the dragged element is moving on the view and
          // offsetX/Y differs depending on time. In our usecases the only correct
          // value is the value actual at the moment of the event creation. Hence
          // we get these values at the beginning of drag to freeze them.
          this.lastDragEvent?.offsetX;
          this.lastDragEvent?.offsetY;
        }
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.lastDragEventUpdater();
  },
});
