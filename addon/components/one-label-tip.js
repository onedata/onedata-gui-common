/**
 * Inserts 'help' icon with tooltip
 * Typical usage:
 * ```
 * {{one-label-tip title="tooltip text"}}
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-label-tip';
import { tag } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['one-label-tip'],

  /**
   * @virtual optional
   * @type {String}
   */
  tooltipClass: '',

  /**
   * Text used in tooltip
   * @type {string}
   */
  title: '',

  /**
   * Icon used as a tooltip trigger (from oneicons icons set)
   * @type {string}
   */
  icon: 'sign-question-rounded',

  /**
   * Placement of the tooltip
   * @type {string}
   */
  placement: 'top',

  /**
   * The event(s) that should trigger the tooltip
   * @type {string}
   */
  triggerEvents: 'hover',

  tooltipClassInternal: tag `one-label-tooltip ${'tooltipClass'}`,

  /**
   * In mobile mode, it's better to not propagate click event from tip.
   * @param {Event} clickEvent
   */
  click(clickEvent) {
    clickEvent.preventDefault();
  },
});
