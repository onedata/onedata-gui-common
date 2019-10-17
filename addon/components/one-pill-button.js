/**
 * A button-like element splited into two parts: text and menu toggle
 * 
 * @module components/one-pill-button
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-pill-button';
import { conditional, raw } from 'ember-awesome-macros';

export default Component.extend({
  classNames: 'one-pill-button',
  classNameBindings: ['mobileMode:mobile-mode'],
  layout,

  /**
   * @virtual
   * @type {Array<Action>}
   */
  menuItems: undefined,

  /**
   * @type {boolean}
   */
  mobileMode: false,

  arrowIcon: conditional('mobileMode', raw('arrow-up'), raw('arrow-down')),

  actions: {
    toggleActions(open) {
      const _open = (typeof open === 'boolean') ? open : !this.get('actionsOpen');
      this.set('actionsOpen', _open);
    },
  },
});
