/**
 * A tags form field.
 *
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
   * @type {Boolean}
   */
  isClearButtonVisible: false,

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
   * @type {Number|undefined}
   */
  tagsLimit: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  sort: false,

  /**
   * @virtual optional
   * @param {any} value
   * @returns {Array<Tag>}
   */
  valueToTags(value) {
    return (value || []).map(val => ({ label: val }));
  },

  /**
   * @virtual optional
   * @param {Array<Tag>} tags
   * @returns {any}
   */
  tagsToValue(tags) {
    return tags.mapBy('label').uniq().compact();
  },

  /**
   * @virtual optional
   * @param {Array<Tag>} tags
   * @returns {Array<Tag>}
   */
  sortTags(tags) {
    return tags.slice(0).sortBy('label');
  },
});
