// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Provides viewer and editor of QoS parameters for storage (but is pretty
 * universal an may by used in the future for another similiar problems)
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  get,
  set,
  getProperties,
  computed,
  observer,
} from '@ember/object';
import { A } from '@ember/array';
import { array, raw, not } from 'ember-awesome-macros';
import { later } from '@ember/runloop';
import _ from 'lodash';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import layout from '../templates/components/qos-params-editor';
import QosParamRecord, {
  defaultValidate as defaultQosParamRecordValidate,
} from 'onedata-gui-common/utils/qos-param-record';

const nodeClearDelay = 500;

// TODO: VFS-9695 This components needs a refactor to be more generic, because it is used
// not only for QoS but also for eg. metadata key-value editor.
// It also needs refactor to be more DDAU (edited data is not taken from external source),
// because sometimes we need to reset/change its values from outside.

export default Component.extend(I18n, {
  layout,

  classNames: ['qos-params-editor'],
  classNameBindings: ['mode'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.qosParamsEditor',

  /**
   * @virtual
   * @type {Object}
   */
  layoutConfig: undefined,

  /**
   * @virtual optional
   * Validator for key and value of QosParamRecord. See `QosParamRecord` for details.
   * @type {Function}
   */
  validateKey: defaultQosParamRecordValidate,

  /**
   * One of `show`, `create`, `edit`
   * @virtual
   * @type {string}
   */
  mode: 'show',

  /**
   * TODO: VFS-9695 A hack to force re-generate editor values when this property changes.
   * @virtual optional
   */
  lastResetTime: undefined,

  /**
   * @type {boolean}
   */
  isFormOpened: true,

  /**
   * Object, that representes key-value pairs with qos parameters.
   * @virtual
   * @type {Object}
   */
  qosParams: undefined,

  /**
   * @type {Function}
   * @param {Object} data changes state object. Has fields `isValid` and
   * `qosParams`.
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * @virtual optional
   * Parameters with these keys can't be removed or modified.
   * @type {Ember.ComputedProperty <Array<String>>}
   */
  readonlyKeys: undefined,

  /**
   * `qosParams` converted to an array of QosParamRecord
   * @type {Ember.ComputedProperty<Array<QosParamRecord>>}
   */
  paramRecords: computed('qosParams', function paramRecords() {
    const qosParams = this.get('qosParams') || {};
    return Object.keys(qosParams).map(key => ({
      key,
      value: qosParams[key],
    }));
  }),

  /**
   * The same as `paramRecords`, but for edition purposes.
   * @type {Ember.ComputedProperty<Ember.A<QosParamRecord>>}
   */
  paramEditRecords: computed(function paramEditRecords() {
    return A();
  }),

  /**
   * `paramEditRecords` without records, that are considered as unavailable
   * (are removed).
   * @type {Ember.ComputedProperty<Ember.A<QosParamRecord>>}
   */
  activeParamEditRecords: array.rejectBy('paramEditRecords', raw('isRemoved')),

  /**
   * If true, all records handled by editor are correct.
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: not(array.isAny('activeParamEditRecords', raw('hasKeyError'))),

  modeObserver: observer(
    'mode',
    'lastResetTime',
    'isFormOpened',
    function modeObserver() {
      if (this.mode !== 'show') {
        this.initEditRecords();
      }
    }
  ),

  init() {
    this._super(...arguments);

    this.modeObserver();
  },

  initEditRecords() {
    // Depending on `mode`, clone existing params or use clear array as a state
    // of editor.
    let editRecords;
    if (this.mode === 'edit') {
      editRecords = A(this.paramRecords.map(obj => QosParamRecord.create(
        obj, { validateKey: this.validateKey }
      )));
    } else {
      editRecords = A();
    }
    this.addEmptyEditRecord(editRecords, true);
    this.set('paramEditRecords', editRecords);
    this.markDuplicates();
  },

  /**
   * Creates new, empty record that will be appended to the array of
   * `QosParamRecord`s.
   * @param {Array<QosParamRecord>} [recordsArray=undefined] destination array
   *   for new record. If no array is provided, `paramEditRecords` will be used.
   * @param {boolean} [disableAnimation=false] if true, creating animation
   *   will be disabled
   * @returns {QosParamRecord} created record
   */
  addEmptyEditRecord(recordsArray = undefined, disableAnimation = false) {
    if (!recordsArray) {
      recordsArray = this.get('paramEditRecords');
    }

    const newRecord = QosParamRecord.create({
      isEditingKey: true,
      disableCreateAnimation: disableAnimation,
      validateKey: this.get('validateKey'),
    });
    recordsArray.pushObject(newRecord);

    return newRecord;
  },

  /**
   * Removes last edition record, if the one before last record has an empty key.
   * This operation is made to make sure, that only one empty record is at the end
   * of the form.
   * @returns {boolean} true, if last record has been removed
   */
  removeLastEditRecordIfNeeded() {
    const editRecords = this.get('activeParamEditRecords');
    const editRecordsLength = get(editRecords, 'length');
    const oneBeforeLastRecord = editRecords.objectAt(editRecordsLength - 2);
    const lastRecord = editRecords.objectAt(editRecordsLength - 1);

    if (oneBeforeLastRecord &&
      get(oneBeforeLastRecord, 'key') == '' &&
      get(lastRecord, 'isEmpty')) {
      this.removeEditRecord(lastRecord);
      return true;
    } else {
      return false;
    }
  },

  /**
   * Marks record as removed. It will be removed from `paramEditRecords` after
   * `nodeClearDelay` ms
   * @param {QosParamRecord} record
   */
  removeEditRecord(record) {
    set(record, 'isRemoved', true);
    later(this, 'removeEditRecordNode', record, nodeClearDelay);
  },

  /**
   * Removes qos record permanently. Should be used only via `removeEditRecord`
   * method
   * @param {QosParamRecord} record
   * @returns {Ember.A<QosParamRecord>} new version of qos records
   */
  removeEditRecordNode(record) {
    return safeExec(
      this,
      () => this.get('paramEditRecords').removeObject(record)
    );
  },

  /**
   * Marks edition records as duplicates if some of them has the same key.
   * @returns {undefined}
   */
  markDuplicates() {
    const editRecords = this.get('activeParamEditRecords');
    const keys = editRecords.mapBy('key').without('');
    const keyOccurences = _.countBy(keys);
    const duplicatedKeys = Object.keys(keyOccurences)
      .filter(key => get(keyOccurences, key) > 1);
    editRecords.forEach(record => set(
      record,
      'isDuplicate',
      duplicatedKeys.includes(get(record, 'key'))
    ));
  },

  /**
   * Removes all empty qos records from the end of the form except the first one,
   * that is after record with non empty key.
   * @returns {undefined}
   */
  removeEmptyEditRecordsFromEnd() {
    const editRecords = this.get('activeParamEditRecords');
    const editRecordsLength = get(editRecords, 'length');

    for (let i = editRecordsLength - 2; i >= 0; i--) {
      const prevRecord = editRecords.objectAt(i);
      const record = editRecords.objectAt(i + 1);

      if (get(prevRecord, 'key') === '' && get(record, 'isEmpty')) {
        this.removeEditRecord(record);
      } else {
        break;
      }
    }
  },

  /**
   * Propagates information about values change with onChange virtual method.
   * @returns {undefined}
   */
  notifyChange() {
    const {
      isValid,
      activeParamEditRecords,
      onChange,
    } = this.getProperties('isValid', 'activeParamEditRecords', 'onChange');
    let qosParams;
    if (isValid) {
      qosParams = activeParamEditRecords
        .filterBy('key')
        .reduce((obj, record) => {
          const {
            key,
            value,
          } = getProperties(record, 'key', 'value');
          obj[key] = value;
          return obj;
        }, {});
    } else {
      qosParams = null;
    }
    const notificationData = {
      isValid,
      qosParams,
    };
    onChange(notificationData);
  },

  actions: {
    keyEdit(record) {
      const {
        isEditingKey,
        hasKeyError,
        key,
      } = getProperties(record, 'isEditingKey', 'hasKeyError', 'key');
      if (!(isEditingKey && (hasKeyError || key === ''))) {
        set(record, 'isEditingKey', !isEditingKey);
      }
    },
    keyChanged(record, key) {
      const editRecords = this.get('activeParamEditRecords');
      const editRecordsLength = get(editRecords, 'length');
      const recordIndex = editRecords.indexOf(record);

      set(record, 'key', key);

      if (recordIndex === editRecordsLength - 1 && key !== '') {
        this.addEmptyEditRecord();
      } else {
        this.removeLastEditRecordIfNeeded(record);
      }
      this.markDuplicates();
      this.notifyChange();
      return resolve();
    },
    inputLostFocus(fieldName, record) {
      const {
        hasKeyError,
        key,
      } = getProperties(record, 'hasKeyError', 'key');
      if (fieldName === 'key' && !hasKeyError && key !== '') {
        set(record, 'isEditingKey', false);
      }
      // Empty records are preserved until focus lost
      this.removeEmptyEditRecordsFromEnd();
    },
    valueChanged(record, event) {
      set(record, 'value', event.target.value);
      // If value is empty, then some empty record may be removed from the end
      this.removeLastEditRecordIfNeeded(record);
      this.notifyChange();
    },
    removeRecord(record) {
      this.removeEditRecord(record);
      this.removeEmptyEditRecordsFromEnd();
      this.markDuplicates();
      this.notifyChange();
    },
  },
});
