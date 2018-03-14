/**
 * An editor component with "read" mode. At the beginning it displays `value`
 * as plain text. After click (direct on text or via 'start edition' button)
 * it changes to editor which triggers `onSave` action on edition approval.
 *
 * @module components/one-inline-editor
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { run, next } from '@ember/runloop';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from '../templates/components/one-inline-editor';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['one-inline-editor'],
  classNameBindings: ['_inEditionMode:editor:static', '_whileSaving:saving'],

  eventsBus: service(),

  /**
   * Input value (before edition).
   * @type {string}
   */
  value: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  editHint: undefined,

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
  onSave: notImplementedReject,

  /**
   * Automatically set to true if the component is rendered in one-collapsible-toolbar
   * @type {boolean}
   */
  isInToolbar: false,

  resizeOnEdit: observer('_inEditionMode', function resizeOnEdit() {
    if (this.get('_inEditionMode')) {
      this.resizeToFit();
    } else {
      this.resetSize();
    }
  }),

  didInsertElement() {
    const isInToolbar = (this.$().parent().find('.one-collapsible-toolbar').length > 0);
    this.set('isInToolbar', isInToolbar);

    if (isInToolbar) {
      $(window).on(`resize.${this.element.id}`, () => {
        run(() => {
          if (this.get('_inEditionMode')) {
            this.resizeToFit();
          }
        });
      });
    }
  },

  willDestroyElement() {
    if (this.get('isInToolbar')) {
      run(() => {
        $(window).off(`resize.${this.element.id}`);
      });
    }
  },

  resizeToFit() {
    const parentWidth = this.$().parent().width();
    const $toolbar = this.$().parent().find('.one-collapsible-toolbar:not(.minimized)');
    const toolbarWidth = $toolbar.width() || 0;
    const paddingRight = parseFloat(
      window.getComputedStyle(this.element)['padding-right']
    );
    this.$().width(parentWidth - toolbarWidth - paddingRight - (toolbarWidth ? 50 : 0));
  },

  resetSize() {
    this.$().width('auto');
  },

  actions: {
    startEdition() {
      next(() => {
        safeExec(this, 'setProperties', {
          _inputValue: this.get('value'),
          _inEditionMode: true,
        });
        next(() => safeExec(this, () => this.$('input').focus().select()))
      });
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
        .finally(() => safeExec(this, 'set', '_whileSaving', false))
        .finally(() => {
          if (this.get('isInToolbar')) {
            next(() => {
              this.get('eventsBus').trigger('one-inline-editor:resize');
            });
          }
        });
    },
  },
});
