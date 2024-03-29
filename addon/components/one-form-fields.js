/**
 * Generate Bootstrap Form fields using lists of FieldTypes
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-form-fields';
import config from 'ember-get-config';
import { computed, get } from '@ember/object';

const {
  layoutConfig,
} = config;

/**
 * @typedef {Object} FieldType
 * @property {string} name
 * @property {string} type
 * @property {string} [format=undefined] special string formatting for static fields
 * @property {boolean} [disabled=undefined]
 * @property {boolean} [hidden=undefined]
 * @property {boolean} [optional=undefined]
 * @property {*} [defaultValue=undefined]
 * @property {string} [label=undefined]
 * @property {boolean} [nolabel=undefined] disable label for input
 * @property {string} [placeholder=undefined]
 * @property {string} [example=undefined]
 * @property {string} [tip=undefined]
 * @property {boolean} [notEditable=undefined] if true, field cannot be edited
 *   after switch from the form "show" mode to the "edition" mode
 * @property {number} [step=undefined] step in number inputs
 * @property {Array<Object>} [options=undefined] array of options for inputs like
 *   radio-group. Each option has fields: value, label
 * @property {string} [message=undefined] field message (typically an error message)
 * @property {boolean} [copyable=undefined] if true and field is static,
 *   it renders a clipboard line to copy value
 * @property {string} [rightText=undefined] text that will be shown on
 *     the right side of the input
 * @property {string} [lockHint=undefined] text that will be shown in tooltip
 *     after hovering locked icon (works only on disabled elements)
 * @property {number|object} [lt=undefined] 'lower than' bounding for number
 *   validator. May be a number or an object in format
 *   `{
 *      [property]: string,
 *      [number]: number
 *      [message]: string,
 *    }`
 *   where `property` is a name of some model property, which value should be used
 *   as an upper bound. If `number` is also provided, then value
 *   max(property-value, number) will be used. If property is not provided,
 *   then value falls back to number property. `message` is an i18n key, that
 *   will be translated and used as an error message.
 * @property {number|object} [lte=undefined] 'lower than or equal' bounding for
 *   number validator. For more information see description of `lt`.
 * @property {number|object} [gt=undefined] 'greater than' bounding for
 *   number validator. For more information see description of `lt`.
 * @property {number|object} [gte=undefined] 'greater than or equal' bounding for
 *   number validator. For more information see description of `lt`.
 */

export default Component.extend({
  layout,
  tagName: '',
  layoutConfig,

  /**
   * @type {ember-bootstrap.Components.FormGroup}
   */
  bsForm: null,

  /**
   * @type {Ember.Object}
   */
  formValues: null,

  /**
   * @type {FieldType}
   */
  fields: null,

  /**
   * @type {Array<{ prefix: string, fields: Array<FieldType> }>}
   * Array with fields grouped by prefix. If prefixes are not directly specified
   * by `prefix` field, then all fields are inside one group with prefix 'undefined'.
   */
  fieldsGroupedByPrefix: computed(
    'fields.@each.prefix',
    function fieldsGroupedByPrefix() {
      const fields = this.get('fields');

      const groups = [];
      let lastGroup = null;
      fields.forEach(field => {
        const fieldPrefix = get(field, 'prefix') || 'undefined';

        if (!lastGroup || lastGroup.prefix !== fieldPrefix) {
          lastGroup = {
            prefix: fieldPrefix,
            fields: [],
          };
          groups.push(lastGroup);
        }

        lastGroup.fields.push(field);
      });

      return groups;
    }
  ),

  actions: {
    inputChanged() {
      const inputChanged = this.get('inputChanged');
      if (inputChanged) {
        inputChanged(...arguments);
      }
    },
    onFocusOut() {
      const onFocusOut = this.get('onFocusOut');
      if (onFocusOut) {
        onFocusOut(...arguments);
      }
    },
  },
});
