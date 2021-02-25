/**
 * An icon with addtional icon in the corner (eg. with x).
 * See dummy app for examples.
 * 
 * @module components/one-icon-tagged
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-icon-tagged';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['one-icon-tagged'],

  /**
   * @virtual
   * Name of big icon.
   * @type {string}
   */
  icon: undefined,

  /**
   * @virtual optional
   * Name of small (additional) icon.
   * @type {string}
   */
  tagIcon: 'x',

  /**
   * @virtual optional
   */
  iconClass: '',

  /**
   * @virtual optional
   */
  tagIconClass: '',

  /**
   * How the icon should be wrapped graphically.
   * One of: circle, icon, none.
   * @type {string}
   */
  shadowType: 'circle',

  /**
   * When `shadowType` is `icon` this will be the icon that is cutted from
   * main icon (some kind of negative mask).
   * @type {string}
   */
  shadowIcon: reads('tagIcon'),
});
