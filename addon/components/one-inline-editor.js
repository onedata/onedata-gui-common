/**
 * And editor component with "read" mode. At the beginning it displays `value`
 * as plain text. After click (direct on text or via 'start edition' button)
 * it changes to editor which triggers `onSave` action on edition approval.
 *
 * @module components/one-inline-editor
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { next } from '@ember/runloop';
import layout from '../templates/components/one-inline-editor';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { Promise } from 'rsvp';

export default Component.extend({
  layout,
  classNames: ['one-inline-editor'],
  classNameBindings: ['_inEditionMode:editor:static', '_whileSaving:saving'],

  /**
   * Input value (before edition).
   * @type {string}
   */
  value: undefined,

  /**
   * Values used by input while edition.
   * @type {string}.
   */
  _inputValue: '',

  /**
   * If true, input is shown instead of plain text.
   * @type {boolean}
   */
  _inEditionMode: false,

  /**
   * If true (in edition mode), spinner is shown instead of action buttons.
   * @type {boolean}
   */
  _whileSaving: false,

  /**
   * Action called on save.
   * @type {Function}
   * @param {string} newValue
   * @returns {Promise}
   */
  onSave: () => new Promise(() => {
    throw new Error('Not implemented')
  }),

  actions: {
    startEdition() {
      this.setProperties({
        _inputValue: this.get('value'),
        _inEditionMode: true,
      });
      next(() => safeExec(this, () => this.$('input').focus().select()));
    },
    cancelEdition() {
      this.set('_inEditionMode', false);
    },
    saveEdition() {
      const {
        _inputValue,
        onSave,
      } = this.getProperties('_inputValue', 'onSave');
      this.set('_whileSaving', true);
      onSave(_inputValue)
        .then(() => safeExec(this, 'set', '_inEditionMode', false))
        .finally(() => safeExec(this, 'set', '_whileSaving', false));
    },
  },
});
