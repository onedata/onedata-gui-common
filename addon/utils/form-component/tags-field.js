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

  valueToTags(value) {
    return (value || []).map(val => ({ label: val }))
  },

  tagsToValue(tags) {
    return tags.mapBy('label').compact();
  },
})
