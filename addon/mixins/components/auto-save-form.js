/**
 * Base for creating forms that submits data automatically with delay.
 * 
 * @module mixins/components/auto-save-form
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import EmberObject, { computed, get } from '@ember/object';
import { run, debounce, later, cancel } from '@ember/runloop';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const formSendDebounceTime = 4000;

export default Mixin.create({
  _window: window,

  /**
   * Action called on data send. The only arguments is an object with 
   * modified data.
   * @virtual
   * @type {Function}
   * @returns {Promise<undefined|any>} resolved value will be ignored
   */
  onSave: notImplementedReject,

  /**
   * Form send debounce time.
   * @type {number}
   */
  formSendDebounceTime: formSendDebounceTime,

  formStatus: '',

  /**
   * If true, form has some unsaved changes.
   * @type {boolean}
   */
  isDirty: false,

  /**
   * If true, some input have lost its focus since last save.
   * @type {boolean}
   */
  lostInputFocus: false,

  /**
   * Save debounce timer handle
   * @type {Array}
   */
  saveDebounceTimer: null,

  generateInitialData() {
    return EmberObject.create(this.get('configuration'));
  },

  /**
   * Fields errors.
   * @type {computed.Object}
   */
  formFieldsErrors: computed(
    'validations.errors.[]',
    'sourceFieldNames',
    function formFieldsErrors() {
      const sourceFieldNames = this.get('sourceFieldNames');
      const errors = this.get('validations.errors');
      const fieldsErrors = {};
      sourceFieldNames
        .forEach((fieldName) => {
          fieldsErrors[fieldName] =
            errors.find(i => i.attribute === ('formData.' + fieldName));
        });
      return fieldsErrors;
    }
  ),

  /**
   * Form data (has different format than the `data` property).
   * @type {Ember.Object}
   */
  formData: computed('data', {
    get() {
      return this.generateInitialData();
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Modification state of fields.
   * @type {Ember.Object}
   */
  formFieldsModified: computed(function formFieldsModified() {
    return EmberObject.create();
  }),

  /**
   * Page unload handler.
   * @type {ComputedProperty<Function>}
   */
  unloadHandler: computed(function unloadHandler() {
    return () => {
      this.scheduleSendChanges(false);
      this.sendChanges();
    };
  }),

  init() {
    this._super(...arguments);
    let {
      _window,
      unloadHandler,
    } = this.getProperties('_window', 'unloadHandler');
    _window.addEventListener('beforeunload', unloadHandler);
  },

  willDestroyElement() {
    try {
      let {
        _window,
        unloadHandler,
      } = this.getProperties('_window', 'unloadHandler');
      _window.removeEventListener('beforeunload', unloadHandler);
      unloadHandler();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Checks if modified values are valid and can be saved
   * @returns {boolean} true if values are valid, false otherwise
   */
  isValid() {
    let {
      formFieldsErrors,
      formFieldsModified: modified,
      formData,
      sourceFieldNames,
    } = this.getProperties(
      'formFieldsErrors',
      'formFieldsModified',
      'formData',
      'sourceFieldNames',
    );
    let isValid = true;
    sourceFieldNames.forEach(fieldName => {
      const isModified = modified.get(fieldName + 'Number') ||
        modified.get(fieldName + 'Enabled') ||
        modified.get(fieldName + 'Unit');
      if (formData.get(fieldName + 'Enabled') && isModified &&
        formFieldsErrors[fieldName]) {
        isValid = false;
      }
    });
    return isValid;
  },

  modifiedData() {
    const {
      formData,
      sourceFieldNames,
      formFieldsModified,
    } = this.getProperties(
      'formFieldsModified',
      'formData',
      'sourceFieldNames',
    );
    const data = {};
    sourceFieldNames.forEach(fieldName => {
      if (get(formFieldsModified, fieldName)) {
        data[fieldName] = Number(formData.get(fieldName));
      }
    });
    return data;
  },

  /**
   * Sends modified data.
   */
  sendChanges() {
    const {
      isDirty,
      onSave,
      formSavedInfoHideTimeout,
    } = this.getProperties(
      'isDirty',
      'onSave',
      'formSavedInfoHideTimeout'
    );
    if (isDirty && this.isValid()) {
      const data = this.modifiedData();
      if (Object.keys(data).length === 0) {
        return;
      }
      this.cleanModificationState();
      this.set('formStatus', 'saving');
      onSave(data).then(() => {
        if (!this.isDestroyed && !this.isDestroying) {
          this.set('formStatus', 'saved');
          later(this, () => {
            if (!this.isDestroyed && !this.isDestroying) {
              // prevent resetting state other than saved
              if (this.get('formStatus') === 'saved') {
                this.set('formStatus', '');
              }
            }
          }, formSavedInfoHideTimeout);
        }
      }).catch(() => {
        this.set('formStatus', 'failed');
        this.set('formData', this.generateInitialData());
        this.cleanModificationState();
      });
      this.setProperties({
        lostInputFocus: false,
        isDirty: false,
      });
    }
  },

  /**
   * Schedules changes send (with debounce).
   * @param {boolean} schedule If false, scheduled save will be canceled.
   */
  scheduleSendChanges(schedule = true) {
    const formSendDebounceTime = this.get('formSendDebounceTime');
    if (schedule === false) {
      this.cancelDebounceTimer();
    } else {
      const data = this.modifiedData();
      if (Object.keys(data).length > 0 && this.isValid()) {
        this.set('formStatus', 'modified');
        this.set(
          'saveDebounceTimer',
          debounce(this, 'sendChanges', formSendDebounceTime)
        );
        run.next(() => {
          if (!this.isValid()) {
            this.cancelDebounceTimer();
          }
        });
      } else {
        this.cancelDebounceTimer();
      }
    }
  },

  cancelDebounceTimer() {
    if (this.get('formStatus') === 'modified') {
      this.set('formStatus', '');
    }
    cancel(this.get('saveDebounceTimer'));
  },

  /**
   * Marks all fields as not modified.
   */
  cleanModificationState() {
    let formFieldsModified = this.get('formFieldsModified');
    Object.keys(formFieldsModified)
      .forEach((key) => formFieldsModified.set(key, false));
  },

  actions: {
    dataChanged(fieldName, eventOrValue) {
      const value = eventOrValue.target ? eventOrValue.target.value : eventOrValue;
      this.set('formData.' + fieldName, value);
      this.set('isDirty', true);
      this.set('formFieldsModified.' + fieldName, true);
    },
    lostFocus() {
      this.set('lostInputFocus', true);
      this.scheduleSendChanges();
    },
    forceSave() {
      this.scheduleSendChanges(false);
      this.sendChanges();
    },
    inputOnKeyUp(keyEvent) {
      switch (keyEvent.keyCode) {
        case 13:
          // enter
          return this.send('forceSave');
        default:
          break;
      }
    },
  },
});
