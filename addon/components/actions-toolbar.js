/**
 * Collapsible toolbar of actions
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/actions-toolbar';
import config from 'ember-get-config';

const {
  screenSm,
} = config.breakpoints;

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {Array<AspectAction>}
   */
  actionsArray: Object.freeze([]),

  /**
   * If set, it will control state of toolbar collapse
   * @type {boolean|undefined}
   */
  isMinimized: undefined,

  /**
   * @type {boolean}
   */
  dropdownPlacement: 'bottom-left',

  /**
   * @type {string}
   */
  toolbarClasses: 'btn-toolbar',

  /**
   * @type {string}
   */
  toolbarToggleClasses: '',

  /**
   * @type {number}
   */
  minimumFullWindowSize: screenSm,

  /**
   * If true, then all actions toolbar elements will be rendered immediately
   * (by default are rendered on-demand).
   * @type {boolean}
   */
  renderImmediately: false,
});
