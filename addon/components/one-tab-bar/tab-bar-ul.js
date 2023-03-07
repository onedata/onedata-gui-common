/**
 * Auto-horizontal-resizable container element for `tab-bar-li` components.
 * It is not scrollable - for scrolling `one-tab-bar` uses
 * `tab-bar-ul-container` component.
 *
 * Something like this:
 * ```
 * tab1 | tab2 | tab3
 * ```
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-ul';

export default Component.extend({
  layout,
  tagName: 'ul',
  attributeBindings: ['style'],
  classNames: ['tab-bar-ul', 'nav', 'nav-tabs'],
});
