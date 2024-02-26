/**
 * A status icon used in status-toolbar. For example of usage see
 * the status-toolbar component documentation.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';

import layout from 'onedata-gui-common/templates/components/status-toolbar/icon';

export default Component.extend({
  layout,
  classNames: ['status-toolbar-icon'],
  classNameBindings: [
    'status',
    'enabled::hidden',
    'clickAction:clickable',
  ],

  /**
   * Tooltip content
   * @type {string}
   */
  hint: null,

  /**
   * If false, component is hidden
   * @type {boolean}
   */
  enabled: true,

  /**
   * Icon name from one-icons font (without 'oneicon' prefix)
   * To inject.
   * @type {string}
   */
  icon: null,

  /**
   * Subicon name from one-icons font (without 'oneicon' prefix)
   * @type {string}
   */
  subIcon: null,

  /**
   * Subicon class
   * @type {string}
   */
  subIconClass: null,

  /**
   * Status, becomes a component class
   * To inject.
   * @type {string}
   */
  status: null,

  /**
   * Text placed in the center of the icon
   * @type {string}
   */
  innerText: null,

  /**
   * Text placed outside the icon
   * @type {string}
   */
  outerText: null,

  /**
   * Outer text placement relative to icon (left or right)
   * @type {string}
   */
  outerTextSide: 'right',

  /**
   * Click action
   * @type {Function}
   */
  clickAction: null,

  _innerTextPresent: computed('innerText', function getInnerTextPresent() {
    return this.get('innerText') != null;
  }),

  _outerTextPresent: computed('outerText', function getOuterTextPresent() {
    return this.get('outerText') != null;
  }),

  click() {
    const clickAction = this.get('clickAction');
    if (clickAction) {
      clickAction();
    }
  },
});
