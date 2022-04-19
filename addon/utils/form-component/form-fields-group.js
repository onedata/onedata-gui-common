/**
 * A container for multiple fields. Allows to manage state of many fields at
 * once.
 *
 * @module utils/form-component/form-fields-group
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import { computed, observer, set, get, getProperties } from '@ember/object';
import { array, raw, isEmpty } from 'ember-awesome-macros';
import _ from 'lodash';
import cloneValue from 'onedata-gui-common/utils/form-component/clone-value';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

export default FormElement.extend({
  /**
   * @override
   */
  isGroup: true,

  /**
   * @override
   */
  fieldComponentName: 'form-component/form-fields-group',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @override
   */
  areValidationClassesEnabled: false,

  /**
   * Changing value of isExpand will show/hide group with animation.
   * NOTE: isVisible and isExpanded are fully separated and work independently.
   * Group is visible only when `isVisible` and `isExpanded` are both true.
   * @virtual optional
   * @type {boolean}
   */
  isExpanded: true,

  /**
   * Controls source of data used in `dumpDefaultValue` method.
   * When true: it will use default values from nested fields.
   * When false: it will use `defaultValue` property. If it is undefined, then
   * default values of nested fields will be used.
   * @virtual optional
   * @type {boolean}
   */
  isDefaultValueIgnored: true,

  /**
   * Set by `fieldsModeObserver`
   * @type {String}
   */
  modeWhenNoFields: 'edit',

  /**
   * @override
   */
  isModified: array.isAny('fields', raw('isModified')),

  /**
   * @override
   */
  mode: computed('fields.length', 'fieldMode', 'modeWhenNoFields', function mode() {
    const {
      fields,
      fieldsMode,
      modeWhenNoFields,
    } = this.getProperties('fields', 'fieldsMode', 'modeWhenNoFields');
    return (fields || []).length ? fieldsMode : modeWhenNoFields;
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  fieldsMode: computed('fields.@each.mode', function fieldsMode() {
    const fields = this.get('fields') || [];
    if (fields.length) {
      return fields.uniqBy('mode').length > 1 ? 'mixed' : get(fields[0], 'mode');
    } else {
      return undefined;
    }
  }),

  /**
   * @override
   */
  isValid: isEmpty('invalidFields'),

  /**
   * @override
   */
  invalidFields: computed(
    'isVisible',
    'isExpanded',
    'fields.@each.invalidFields',
    function invalidFields() {
      const {
        isVisible,
        isExpanded,
        fields,
      } = this.getProperties('isVisible', 'isExpanded', 'fields');

      return (isVisible && isExpanded) ?
        _.flatten(fields.mapBy('invalidFields')) : [];
    }
  ),

  fieldsModeObserver: observer('fieldsMode', function fieldsModeObserver() {
    const {
      fieldsMode,
      modeWhenNoFields: oldModeWhenNoFields,
    } = this.getProperties('fieldsMode', 'modeWhenNoFields');
    let newModeWhenNoFields = oldModeWhenNoFields;
    switch (fieldsMode) {
      case 'view':
        newModeWhenNoFields = 'view';
        break;
      case undefined: {
        if (oldModeWhenNoFields && oldModeWhenNoFields !== 'mixed') {
          break;
        }
      }
      /* falls through */
      case 'edit':
      case 'mixed':
      default:
        newModeWhenNoFields = 'edit';
        break;
    }
    this.set('modeWhenNoFields', newModeWhenNoFields);
  }),

  init() {
    this._super(...arguments);
    this.fieldsModeObserver();
  },

  /**
   * @override
   */
  changeMode(mode) {
    const fields = this.get('fields');
    if (get(fields, 'length')) {
      fields.invoke('changeMode', mode);
    } else {
      this.set('modeWhenNoFields', mode);
    }
  },

  /**
   * @override
   */
  markAsNotModified() {
    this.get('fields').invoke('markAsNotModified');
  },

  /**
   * @override
   */
  markAsModified() {
    this.get('fields').invoke('markAsModified');
  },

  /**
   * @override
   */
  dumpDefaultValue() {
    const {
      defaultValue,
      isDefaultValueIgnored,
      fields,
    } = this.getProperties('defaultValue', 'isDefaultValueIgnored', 'fields');

    if (!isDefaultValueIgnored && defaultValue !== undefined) {
      return cloneValue(defaultValue);
    } else {
      return fields.reduce((valuesContainer, field) => {
        const {
          valueName,
          isValueless,
        } = getProperties(field, 'valueName', 'isValueless');
        const fieldDefaultValue = field.dumpDefaultValue();
        if (!isValueless && fieldDefaultValue !== undefined) {
          set(valuesContainer, valueName, fieldDefaultValue);
        }
        return valuesContainer;
      }, createValuesContainer());
    }
  },

  /**
   * @override
   */
  dumpValue() {
    return this.get('fields').reduce((valuesContainer, field) => {
      if (!get(field, 'isValueless')) {
        set(valuesContainer, get(field, 'valueName'), field.dumpValue());
      }
      return valuesContainer;
    }, createValuesContainer());
  },

  /**
   * @override
   */
  useCurrentValueAsDefault() {
    const {
      isDefaultValueIgnored,
      fields,
    } = this.getProperties('isDefaultValueIgnored', 'fields');

    if (!isDefaultValueIgnored) {
      this.set('defaultValue', this.dumpValue());
    } else {
      fields.invoke('useCurrentValueAsDefault');
    }
  },

  /**
   * @override
   */
  getFieldByPath(relativePath) {
    if (!relativePath) {
      return null;
    } else {
      const dotPosition = relativePath.indexOf('.');
      const fields = this.get('fields');
      if (dotPosition !== -1) {
        const thisLevelFieldName = relativePath.slice(0, dotPosition);
        const nestedLevelsFieldPath = relativePath.slice(dotPosition + 1);
        const field = fields.findBy('name', thisLevelFieldName);
        if (field) {
          return field.getFieldByPath(nestedLevelsFieldPath);
        } else {
          return null;
        }
      } else {
        return fields.findBy('name', relativePath) || null;
      }
    }
  },
});
