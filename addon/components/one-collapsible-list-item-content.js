import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-collapsible-list-item-content';

/**
 * Item content class of the collapsible list. For example of use case see
 * components/one-collapsible-list.js.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  tagName: 'div',
  classNames: ['one-collapsible-list-item-content'],
  classNameBindings: ['isOpened:opened'],
  isOpened: false,
});
