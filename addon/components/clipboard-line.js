/**
 * An inline input with copy to clipboard button
 *
 * @module components/clipboard-line
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/clipboard-line';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  layout,
  classNames: ['clipboard-line'],
  classNameBindings: ['size'],

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
   * @type {number}
   */
  textareaRows: 5,

  clipboardBtnClass: computed('type', function clipboardBtnClass() {
    return `clipboard-btn-${this.get('type')}`;
  }),
});
