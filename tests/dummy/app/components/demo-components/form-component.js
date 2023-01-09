import Component from '@ember/component';
import { computed, setProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { Promise } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
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
            }],
          }),
          DatetimeField.create({
            ownerSource: this,
            name: 'datetime',
            label: 'Datetime',
          }),
          FormFieldsCollectionGroup.extend({
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
          }),
          LoadingField.create({
            name: 'loading',
            label: 'Loading',
            loadingProxy: PromiseObject.create({
              promise: new Promise(() => {}),
            }),
            loadingText: 'Loading...',
          }),
          TagsField.extend({
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
          }),
        ],
      });
  }),

  isFormValid: reads('rootFieldsGroup.isValid'),

  lastChangedField: '',

  lastChangedValue: '',

  values: reads('rootFieldsGroup.valuesSource'),
});
