/**
 * A button-like element splited into two parts: text and menu toggle
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-pill-button';
import { conditional, raw } from 'ember-awesome-macros';

export default Component.extend({
  classNames: 'one-pill-button',
  classNameBindings: ['mobileMode:mobile-mode', 'theme'],
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

  /**
   * One of: 'default', 'light'
   * @type {String}
   */
  theme: 'default',

  /**
   * If true, then arrow will be replaced by dots
   * @type {Boolean}
   */
  useDots: false,

  arrowIcon: conditional('mobileMode', raw('arrow-up'), raw('arrow-down')),

  actions: {
    toggleActions(open) {
      const _open = (typeof open === 'boolean') ? open : !this.get('actionsOpen');
      this.set('actionsOpen', _open);
    },
  },
});
