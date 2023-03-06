/**
 * A one-atlas point component. Represents a place in a map with given x and y.
 * Typically, point is yielded from `one-atlas/position` component with
 * injected `positionX` and `positionY`.
 * Example of use can be found in one-atlas component.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';

import layout from 'onedata-gui-common/templates/components/one-atlas/point';

export default Component.extend({
  layout,
  classNames: ['one-atlas-point'],

  /**
   * Atlas parent component width.
   * To inject by one-atlas component.
   * @type {number}
   */
  atlasWidth: 0,

  /**
   * Atlas parent component height.
   * To inject by one-atlas component.
   * @type {number}
   */
  atlasHeight: 0,

  /**
   * Point x position on atlas (in px)
   * @virtual
   * @type {number}
   */
  positionX: undefined,

  /**
   * Point y position on atlas (in px)
   * @virtual
   * @type {number}
   */
  positionY: undefined,

  _positionObserver: observer('positionX', 'positionY', function () {
    this._applyPosition();
  }),

  didInsertElement() {
    this._super(...arguments);
    this._applyPosition();
  },

  /**
   * Applies calculated position to CSS properties
   */
  _applyPosition() {
    const {
      positionX,
      positionY,
      element,
    } = this.getProperties('positionX', 'positionY', 'element');

    element.style.top = `${positionY}px`;
    element.style.left = `${positionX}px`;
  },
});
