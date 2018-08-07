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
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from '../templates/components/one-inline-editor';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['one-inline-editor'],
  classNameBindings: [
    '_inEditionMode:editor:static',
    '_whileSaving:saving',
    'controlledManually:manual'
  ],

  eventsBus: service(),

  /**
   * Input value (before edition).
   * @type {string}
   */
  value: undefined,

  /**
   * If set, state of the editor will change only on this property change
   * @type {boolean|undefined}
   */
  isEditing: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  editHint: undefined,

  /**
   * @type {boolean}
   */
  editOnClick: true,

  /**
   * If true, the value will be trimmed before saving
   * @type {boolean}
   */
  trimString: true,

  /**
   * @type {boolean}
   */
  showEmptyInfo: true,

  /**
   * @type {string}
   */
  inputClasses: '',

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
   * Action called when user wants to start/close editor.
   * @type {Function}
   * @param {string} state if true, user wants to open editor, otherwise close
   * @returns {undefined}
   */
  onEdit: notImplementedIgnore,

  /**
   * Automatically set to true if the component is rendered in one-collapsible-toolbar
   * @type {boolean}
   */
  isInToolbar: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  controlledManually: computed('isEditing', function () {
    return typeof this.get('isEditing') === 'boolean';
  }),

  resizeOnEdit: observer('_inEditionMode', function resizeOnEdit() {
    if (this.get('_inEditionMode')) {
      this.resizeToFitToolbar();
    } else {
      this.resetSize();
    }
  }),

  isEditingObserver: observer('isEditing', function () {
    const isEditing = this.get('isEditing');
    if (isEditing === true) {
      this.startEdition();
    } else if (isEditing === false) {
      this.stopEdition();
    }
  }),

  init() {
    this._super(...arguments);
    if (this.get('isEditing')) {
      this.isEditingObserver();
    }
  },

  didInsertElement() {
    if (this.get('isInToolbar')) {
      $(window).on(`resize.${this.element.id}`, () => {
        run(() => {
          if (this.get('_inEditionMode')) {
            this.resizeToFitToolbar();
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

  resizeToFitToolbar() {
    if (this.get('isInToolbar')) {
      const parentWidth = this.$().parent().width();
      const $toolbar = this.$().parent().find(
        '.one-collapsible-toolbar:not(.minimized)'
      );
      const toolbarWidth = $toolbar.width() || 0;
      const paddingRight = parseFloat(
        window.getComputedStyle(this.element)['padding-right']
      );
      this.$().width(parentWidth - toolbarWidth - paddingRight - (toolbarWidth ? 50 : 0));
    }
  },

  resetSize() {
    if (this.get('isInToolbar')) {
      this.$().width('auto');
    }
  },

  startEdition() {
    next(() => {
      safeExec(this, 'setProperties', {
        _inputValue: this.get('value'),
        _inEditionMode: true,
      });
      next(() => safeExec(this, () => this.$('input').focus().select()))
    });
  },

  stopEdition() {
    safeExec(this, 'set', '_inEditionMode', false);
  },

  actions: {
    startEdition() {
      const {
        editOnClick,
        onEdit,
        controlledManually,
      } = this.getProperties('editOnClick', 'onEdit', 'controlledManually');
      if (editOnClick) {
        onEdit(true);
        if (!controlledManually) {
          this.startEdition();
        }
      }
    },
    cancelEdition() {
      this.get('onEdit')(false);
      if (!this.get('controlledManually')) {
        this.stopEdition();
      }
    },
    saveEdition() {
      const {
        _inputValue,
        onSave,
        trimString,
        controlledManually,
      } = this.getProperties(
        '_inputValue',
        'onSave',
        'trimString',
        'controlledManually'
      );
      const preparedInputValue = trimString ? _inputValue.trim() : _inputValue;
      this.set('_whileSaving', true);
      onSave(preparedInputValue)
        .then(() => {
          if (!controlledManually) {
            this.stopEdition();
          }
          safeExec(this, 'set', '_inputValue', preparedInputValue);
        })
        .finally(() => {
          safeExec(this, 'set', '_whileSaving', false);
          if (this.get('isInToolbar')) {
            next(() => {
              this.get('eventsBus').trigger('one-inline-editor:resize');
            });
          }
        });
    },
  },
});
