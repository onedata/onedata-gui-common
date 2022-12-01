/**
 * An editor component with "read" mode. At the beginning it displays `value`
 * as plain text. After click (direct on text or via 'start edition' button)
 * it changes to editor which triggers `onSave` action on edition approval.
 *
 * @module components/one-inline-editor
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
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
import { Promise, resolve } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { isEmpty } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,
  classNames: ['one-inline-editor'],
  classNameBindings: [
    '_inEditionMode:editor:static',
    '_whileSaving:saving',
    'controlledManually:manual',
    'hideEditIcons:without-edit-icons',
    'hideViewIcons:without-view-icons',
    'saveButtonDisabled:save-disabled',
  ],

  i18n: service(),
  eventsBus: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneInlineEditor',

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
   * @type {boolean}
   */
  hideEditIcons: false,

  /**
   * Hides icons visible in view mode (e.g. icon which starts edition).
   * @type {Boolean}
   */
  hideViewIcons: false,

  /**
   * If true. editor will not focus input on first render
   * @type {boolean}
   */
  ignoreInitialFocus: false,

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
   * Action called when the _inputValue is changed.
   * @type {Function}
   * @param {string} value
   * @returns {undefined}
   */
  onInputValueChanged: notImplementedIgnore,

  /**
   * Action called when input losts focus
   * @type {Function}
   * @returns {undefined}
   */
  onLostFocus: notImplementedIgnore,

  /**
   * Automatically set to true if the component is rendered in one-collapsible-toolbar
   * @type {boolean}
   */
  isInToolbar: false,

  /**
   * Turns to true after first render
   * @type {boolean}
   */
  isAfterInitialRender: false,

  /**
   * @type {string}
   */
  inputPlaceholder: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  staticPlaceholder: computed(function staticPlaceholder() {
    return this.t('notSet');
  }),

  isValueEmpty: isEmpty('value'),

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

  inputValueChangedObserver: observer(
    '_inputValue',
    function inputValueChangedObserver() {
      this.get('onInputValueChanged')(this.getEditedValue());
    }
  ),

  init() {
    this._super(...arguments);
    if (this.get('isEditing')) {
      this.isEditingObserver();
    }
    next(() => {
      // after component initialization fallback to default
      safeExec(this, 'set', 'isAfterInitialRender', true);
    });
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
    const {
      element,
      isInToolbar,
    } = this.getProperties('element', 'isInToolbar');
    if (isInToolbar) {
      const parentWidth = $(element.parentElement).width();
      const toolbar = element.parentElement.querySelector(
        '.one-collapsible-toolbar:not(.minimized)'
      );
      const toolbarWidth = toolbar && $(toolbar).width() || 0;
      const paddingRight = parseFloat(
        window.getComputedStyle(element)['padding-right']
      );
      $(element).width(
        parentWidth - toolbarWidth - paddingRight - (toolbarWidth ? 50 : 0)
      );
    }
  },

  resetSize() {
    const {
      element,
      isInToolbar,
    } = this.getProperties('element', 'isInToolbar');

    if (isInToolbar) {
      $(element).width('auto');
    }
  },

  startEdition() {
    const {
      ignoreInitialFocus,
      isAfterInitialRender,
    } = this.getProperties('ignoreInitialFocus', 'isAfterInitialRender');
    return new Promise((resolve, reject) => {
      next(() => {
        try {
          safeExec(this, 'setProperties', {
            _inputValue: this.get('value'),
            _inEditionMode: true,
          });
          next(() => {
            try {
              const element = this.get('element');
              const input = element && element.querySelector('input');
              if (!(ignoreInitialFocus && !isAfterInitialRender) && input) {
                safeExec(this, () => {
                  input.focus();
                  input.select();
                });
              }
            } catch (error) {
              reject(error);
            }
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  stopEdition() {
    safeExec(this, 'set', '_inEditionMode', false);
  },

  getEditedValue() {
    if (this.editorType === 'tags') {
      return this._inputValue ?? [];
    } else {
      const {
        _inputValue,
        trimString,
      } = this.getProperties('_inputValue', 'trimString');
      const stringValue = _inputValue || '';
      return trimString ? stringValue.trim() : stringValue;
    }
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
          return this.startEdition();
        } else {
          return resolve();
        }
      } else {
        return resolve();
      }
    },
    cancelEdition() {
      const {
        hideEditIcons,
        onEdit,
        controlledManually,
      } = this.getProperties(
        'hideEditIcons',
        'onEdit',
        'controlledManually'
      );
      // If cancel button is hidden, then canceling edition using any other
      // method should be blocked
      if (!hideEditIcons) {
        onEdit(false);
        if (!controlledManually) {
          this.stopEdition();
        }
      }
    },
    async saveEdition() {
      if (this.saveButtonDisabled) {
        return;
      }
      const {
        onSave,
        controlledManually,
      } = this.getProperties(
        'onSave',
        'controlledManually'
      );
      const preparedInputValue = this.getEditedValue();
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
