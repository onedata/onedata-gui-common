import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import EmberObject, { set, get } from '@ember/object';

export default FormFieldsGroup.extend({
  /**
   * @override
   */
  i18nPrefix: undefined,

  /**
   * @virtual
   * @override
   */
  ownerSource: undefined,

  /**
   * @override
   */
  path: '',

  /**
   * @override
   */
  valuesSource: undefined,

  init() {
    if (!this.get('valuesSource')) {
      this.reset();
    }

    this._super(...arguments);
  },

  /**
   * @override
   */
  onValueChange(value, field) {
    if (field === this) {
      this.set('valuesSource', value);
    } else {
      const valuePath = `valuesSource.${get(field, 'valuePath')}`;

      // Construct EmberObjects across `path` if not exist
      let targetValuesObject = this;
      valuePath.split('.').slice(0, -1).forEach(pathElement => {
        let nextTargetValuesObject = get(targetValuesObject, pathElement);
        if (!nextTargetValuesObject) {
          nextTargetValuesObject = EmberObject.create();
          set(targetValuesObject, pathElement, nextTargetValuesObject);
        }
        targetValuesObject = nextTargetValuesObject;
      })

      this.set(valuePath, value);
    }

    field.markAsModified();
  },

  /**
   * @override
   */
  onFocusLost(field) {
    field.markAsModified();
  }
});
