import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/tags-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['tags-field'],

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tags: computed('value.[]', 'field', function tags() {
    const {
      value,
      field,
    } = this.getProperties('value', 'field');

    return field.valueToTags(value);
  }),

  /**
   * @type {CompuedProperty<String>}
   */
  tagEditorComponentName: reads('field.tagEditorComponentName'),

  /**
   * @type {CompuedProperty<any>}
   */
  tagEditorSettings: reads('field.tagEditorSettings'),

  /**
   * @type {CompuedProperty<boolean>}
   */
  sort: reads('field.sort'),

  actions: {
    valueChanged(tags) {
      const {
        sort,
        field,
      } = this.getProperties('sort', 'field');

      if (sort) {
        tags = field.sortTags(tags);
      }

      const value = field.tagsToValue(tags);
      this._super(value);
    },
  },
});
