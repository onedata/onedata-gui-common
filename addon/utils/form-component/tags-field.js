import FormField from 'onedata-gui-common/utils/form-component/form-field';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/tags-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @public
   * @type {String}
   */
  tagEditorComponentName: 'tags-input/text-editor',

  /**
   * @public
   * @type {any}
   */
  tagEditorSettings: undefined,

  /**
   * @public
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
