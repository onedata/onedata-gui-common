/**
 * A tags form field.
 * 
 * @module utils/form-component/tags-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/tags-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @virtual optional
   * @type {String}
   */
  tagEditorComponentName: 'tags-input/text-editor',

  /**
   * @virtual optional
   * @type {any}
   */
  tagEditorSettings: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  sort: false,

  /**
   * @public
   * @param {any} value
   * @returns {Array<Tag>}
   */
  valueToTags(value) {
    return (value || []).map(val => ({ label: val }))
  },

  /**
   * @public
   * @param {Array<Tag>} tags
   * @returns {any}
   */
  tagsToValue(tags) {
    return tags.mapBy('label').uniq().compact();
  },

  /**
   * @public
   * @param {Array<Tag>} tags
   * @returns {Array<Tag>}
   */
  sortTags(tags) {
    return tags.slice(0).sortBy('label');
  },
})
