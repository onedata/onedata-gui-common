import Component from '@ember/component';
import { computed, setProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { Promise } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import StaticUserField from 'onedata-gui-common/utils/form-component/static-user-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import CustomValueDropdownField from 'onedata-gui-common/utils/form-component/custom-value-dropdown-field';
import {
  Tag as RecordTag,
  removeExcessiveTags,
} from 'onedata-gui-common/components/tags-input/model-selector-editor';
import { resolve } from 'rsvp';
import _ from 'lodash';

const modelSelectorSource = {
  group: _.times(10, i => ({
    name: `Group ${i}`,
  })),
  provider: _.times(10, i => ({
    name: `Oneprovider ${i}`,
  })),
};

export default Component.extend({
  isFormInfoShown: true,
  isDuplicatedFieldShown: true,

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
        ownerSource: this,
        fields: [
          this.nameField,
          this.surnameField,
          this.dropdownField,
          this.customValueDropdownField,
          this.radioField,
          this.datetimeField,
          this.addButtonField,
          this.loadingField,
          this.tagsField,
          this.staticTextField,
          this.staticUserField,
        ],
      });
  }),

  nameField: computed(function nameField() {
    return TextField.create({
      ownerSource: this,
      name: 'name',
      label: 'Name',
      defaultValue: 'someName',
    });

  }),

  surnameField: computed(function surnameField() {
    return TextField.create({
      ownerSource: this,
      name: 'surname',
      label: 'Surname',
    });
  }),

  radioField: computed(function radioField() {
    return RadioField.create({
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
      }],
    });
  }),

  datetimeField: computed(function datetimeField() {
    return DatetimeField.create({
      ownerSource: this,
      name: 'datetime',
      label: 'Datetime',
    });
  }),

  addButtonField: computed(function addButtonField() {
    return FormFieldsCollectionGroup.extend({
      fieldFactoryMethod(createdFieldsCounter) {
        return TextField.create({
          name: 'textField',
          valueName: `textField${createdFieldsCounter}`,
        });
      },
    }).create({
      addButtonText: 'Add',
      name: 'textCollection',
      label: 'Text collection',
    });
  }),

  loadingField: computed(function loadingField() {
    return LoadingField.create({
      name: 'loading',
      label: 'Loading',
      loadingProxy: PromiseObject.create({
        promise: new Promise(() => {}),
      }),
      loadingText: 'Loading...',
    });
  }),

  tagsField: computed(function tagsField() {
    return TagsField.extend({
      valueToTags(value) {
        return (value || [])
          .map(val => RecordTag.create({
            ownerSource: this,
            value: val,
          }));
      },
      tagsToValue(tags) {
        return removeExcessiveTags(tags).mapBy('value').uniq()
          .compact();
      },
    }).create({
      name: 'records',
      label: 'Records',
      tagEditorSettings: {
        models: [{
          name: 'group',
          getRecords: () => resolve(modelSelectorSource['group']),
        }, {
          name: 'provider',
          getRecords: () =>
            resolve(modelSelectorSource['provider']),
        }],
      },
      tagEditorComponentName: 'tags-input/model-selector-editor',
      defaultValue: [],
    });
  }),

  staticUserField: computed(function staticUserField() {
    return StaticUserField
      .extend({
        value: reads('ownerSource.user'),
      })
      .create({
        name: 'user',
        label: 'User',
      });
  }),

  staticTextField: computed(function staticTextField() {
    return StaticTextField.create({
      name: 'staticText',
      label: 'Static text',
      text: 'Excepteur voluptate magna ad quis culpa anim do proident ullamco sint. Non exercitation non eu ipsum reprehenderit sunt. Enim cillum anim aute consectetur do laborum dolor consectetur veniam sunt.',
    });
  }),

  dropdownField: computed(function dropdownField() {
    return DropdownField.create({
      name: 'someOptions',
      label: 'Few options',
      // uncomment to see static mode
      // value: 'one',
      // mode: 'view',
      options: [{
          value: 'one',
          name: 'one',
          icon: 'browser-file',
          label: 'One',
        },
        {
          value: 'two',
          name: 'two',
          icon: 'browser-directory',
          label: 'Two',
        },
        {
          value: 'three',
          name: 'three',
          icon: 'browser-dataset',
          label: 'Three',
        },
      ],
    });
  }),

  customValueDropdownField: computed(function customValueDropdownField() {
    return CustomValueDropdownField.create({
      name: 'customInputOptions',
      label: 'Custom input dropdown',
      isCustomInputOptionIconShown: true,
      // uncomment to see static mode
      // value: 'one',
      // mode: 'view',
      options: [{
          value: 'one',
          name: 'one',
          icon: 'browser-file',
          label: 'One',
        },
        {
          value: 'two',
          name: 'two',
          icon: 'browser-directory',
          label: 'Two',
        },
        {
          value: 'three',
          name: 'three',
          icon: 'browser-dataset',
          label: 'Three',
        },
      ],
    });
  }),

  user: computed(function user() {
    return {
      entityId: 'dummy_user_id',
      fullName: 'Jan Kowalski',
      username: 'kowalski',
    };
  }),

  isFormValid: reads('rootFieldsGroup.isValid'),

  lastChangedField: '',

  lastChangedValue: '',

  values: reads('rootFieldsGroup.valuesSource'),
});
