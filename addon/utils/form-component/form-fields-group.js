import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import EmberObject, { computed, observer, set, get } from '@ember/object';
import { A } from '@ember/array';
import { array, raw, isEmpty } from 'ember-awesome-macros';
import _ from 'lodash';

export default FormElement.extend({
  /**
   * @override
   */
  isGroup: true,

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
  invalidFields: computed('fields.@each.invalidFields', function invalidFields() {
    return _.flatten(this.get('fields').mapBy('invalidFields'));
  }),

  fieldsParentSetter: observer('fields.@each.parent', function fieldsParentSetter() {
    const fields = this.get('fields');

    if (fields) {
      fields
        .rejectBy('parent', this)
        .setEach('parent', this);
    }
  }),

  init() {
    this._super(...arguments);

    this.fieldsParentSetter();
  },

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
      set(valuesAggregator, get(field, 'name'), field.dumpDefaultValue());
      return valuesAggregator;
    }, EmberObject.create());
  },

  /**
   * @override
   */
  dumpValue() {
    return this.get('fields').reduce((valuesAggregator, field) => {
      set(valuesAggregator, get(field, 'name'), field.dumpValue());
      return valuesAggregator;
    }, EmberObject.create());
  },
})
