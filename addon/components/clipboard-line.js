/**
 * An inline input with copy to clipboard button
 *
 * @module components/clipboard-line
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/clipboard-line';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { tag } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import animateCss from 'onedata-gui-common/utils/animate-css';

export default Component.extend(I18n, {
  layout,
  classNames: ['clipboard-line'],
  classNameBindings: ['size', 'typeClass'],

  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.clipboardLine',

  /**
   * @virtual
   * @type {string}
   */
  value: '',

  /**
   * @virtual
   * @type {string}
   */
  label: '',

  /**
   * @virtual optional
   * Use "sm" for small input and button, otherwise will use default sizes
   * @type {string}
   */
  size: undefined,

  /**
   * @virtual optional
   * One of: input, textarea
   * @type {string}
   */
  type: 'input',

  /**
   * @virtual optional
   * @type {string}
   */
  inputClass: undefined,

  /**
   * @virtual optional
   * @type {Function}
   */
  notify: notImplementedIgnore,

  /**
   * If provided, this string is copied to clipboard instead of displayed `value`
   * @virtual optional
   * @type {String}
   */
  rawValue: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  buttonTip: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  enableValueTip: false,

  /**
   * @type {number}
   */
  textareaRows: 5,

  typeClass: tag `clipboard-line-${'type'}`,

  clipboardBtnClass: computed('type', function clipboardBtnClass() {
    return `clipboard-btn-${this.get('type')}`;
  }),

  actions: {
    notify() {
      const {
        element,
        type,
        notify,
      } = this.getProperties('element', 'type', 'notify');
      if (type === 'html') {
        animateCss(element.querySelector('.html-content-container'), 'pulse-mint');
      }
      return notify(...arguments);
    },
  },
});
