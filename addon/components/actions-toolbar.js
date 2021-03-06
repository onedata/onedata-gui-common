/**
 * Collapsible toolbar of actions
 *
 * @module components/actions-toolbar
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/actions-toolbar';
import breakpointValues from 'onedata-gui-common/breakpoint-values';

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
   * @type {boolean}
   */
  dropdownOverModals: false,

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
  minimumFullWindowSize: breakpointValues.screenSm,

  /**
   * If true, then all actions toolbar elements will be rendered immediately
   * (by default are rendered on-demand).
   * @type {boolean}
   */
  renderImmediately: false,
});
