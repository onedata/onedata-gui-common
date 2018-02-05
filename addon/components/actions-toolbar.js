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

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {Array<AspectAction>}
   */
  actionsArray: Object.freeze([]),
});
