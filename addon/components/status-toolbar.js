/**
 * A component that displays information about some process status as icons. 
 * Each icon can have a subicon - icon, that is visible in the bottom right 
 * corner of the main status icon. It is possible to attach custom click
 * event handler by setting clickAction property for an icon component.
 * 
 * To enable tooltip, set hint property for an icon.
 * 
 * Examples:
 * ```
 * {{#status-toolbar as |toolbar|}}
 *   {{toolbar.icon 
 *     icon="space"
 *     status="done" 
 *     subIcon="checkbox"
 *     subIconClass="subicon"}}
 *   {{toolbar.icon
 *     icon="checkbox"
 *     hint="some tooltip text"
 *     status="inProgress"
 *     clickAction=(action "iconClick")}}
 * {{/status-toolbar}}
 * ```
 *
 * @module components/status-toolbar
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/status-toolbar';

export default Component.extend({
  layout,
  classNames: ['status-toolbar', 'clearfix'],
});
