import Component from '@ember/component';
import { computed, setProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';

export default Component.extend({
  rootFieldsGroup: computed(function rootFieldsGroup() {
    const component = this;
    return FormFieldsRootGroup
      .extend({
        onValueChange(value, field) {
          this._super(...arguments);
          setProperties(component, {
            lastChangedField: get(field, 'name'),
            lastChangedValue: value,
          });
        },
      })
      .create({
        fields: [
          TextField.create({
            ownerSource: this,
            name: 'name',
            label: 'Name',
            defaultValue: 'someName',
          }),
          TextField.create({
            ownerSource: this,
            name: 'surname',
            label: 'Surname',
          }),
          RadioField.create({
            ownerSource: this,
            name: 'age',
            label: 'Age',
            options: [{
              name: 'child',
              value: 0,
              label: 'Child',
            }, {
              name: 'adult',
              value: 1,
              label: 'Adult',
            }]
          }),
        ]
      });
  }),

  isFormValid: reads('rootFieldsGroup.isValid'),

  lastChangedField: '',

  lastChangedValue: '',

  values: reads('rootFieldsGroup.valuesSource'),
});
