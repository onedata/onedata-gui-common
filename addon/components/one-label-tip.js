import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-label-tip';

/**
 * Inserts 'help' icon with tooltip
 * Typical usage: 
 * ```
 * {{one-label-tip title="tooltip text"}}
 * ```
 * 
 * @module components/one-label-tip
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['one-label-tip'],

  /**
   * Text used in tooltip
   * @type {string}
   */
  title: '',

  /**
   * Icon used as a tooltip trigger (from oneicons icons set)
   * @type {string}
   */
  icon: 'sign-question',

  /**
   * Placement of the tooltip 
   * @type {string}
   */
  placement: 'top',

  /**
   * Placement of the tooltip arrow
   * @type {string}
   */
  arrowPlacement: 'right',

  /**
   * The event(s) that should trigger the tooltip
   * @type {string}
   */
  triggerEvents: 'hover',
});
