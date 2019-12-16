import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import EmberObject, { computed, set, get } from '@ember/object';
import { A } from '@ember/array';
import { array, raw, isEmpty } from 'ember-awesome-macros';
import _ from 'lodash';

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
   * @public
   * @type {boolean}
   */
  isExpanded: true,

  /**
   * @override
   */
  fields: computed(() => A()),

  /**
   * @override
   */
  isModified: array.isAny('fields', raw('isModified')),

  /**
   * @override
   */
  mode: computed('fields.@each.mode', function mode() {
    const fields = this.get('fields');

    if (fields && fields.length) {
      return fields.mapBy('mode').uniq().length > 1 ?
        'mixed' : get(fields.objectAt(0), 'mode');
    } else {
      return undefined;
    }
  }),

  /**
   * @override
   */
  isEnabled: array.isAny('fields', raw('isEnabled')),

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

  /**
   * @override
   */
  changeMode(mode) {
    this.get('fields').invoke('changeMode', mode);
  },

  /**
   * @override
   */
  enable() {
    this.get('fields').invoke('enable');
  },

  /**
   * @override
   */
  disable() {
    this.get('fields').invoke('disable');
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
    return this.get('fields').reduce((valuesAggregator, field) => {
      set(valuesAggregator, get(field, 'valueName'), field.dumpDefaultValue());
      return valuesAggregator;
    }, EmberObject.create());
  },

  /**
   * @override
   */
  dumpValue() {
    return this.get('fields').reduce((valuesAggregator, field) => {
      set(valuesAggregator, get(field, 'valueName'), field.dumpValue());
      return valuesAggregator;
    }, EmberObject.create());
  },

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
})
