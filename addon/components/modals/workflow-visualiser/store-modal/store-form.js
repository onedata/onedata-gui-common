import Component from '@ember/component';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/store-form';
import { tag, getBy, conditional, eq, neq, raw, array, or, gt } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { computed, observer, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';

const storeTypes = [{
  value: 'list',
}, {
  value: 'map',
}, {
  value: 'treeForest',
}, {
  value: 'singleValue',
}, {
  value: 'range',
}, {
  value: 'histogram',
}, {
  value: 'auditLog',
}];

const dataTypes = [{
  value: 'integer',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'string',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'object',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'histogram',
  forbiddenIn: ['treeForest'],
}, {
  value: 'anyFile',
  forbiddenIn: ['histogram'],
}, {
  value: 'regularFile',
  forbiddenIn: ['histogram'],
}, {
  value: 'directory',
  forbiddenIn: ['histogram'],
}, {
  value: 'dataset',
  forbiddenIn: ['histogram'],
}, {
  value: 'archive',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'singleValueStore',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'listStore',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'mapStore',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'treeForestStore',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'rangeStore',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'histogramStore',
  forbiddenIn: ['treeForest', 'histogram'],
}, {
  value: 'onedatafsCredentials',
  forbiddenIn: ['treeForest', 'histogram'],
}];

export default Component.extend(I18n, {
  layout,
  classNames: ['store-form'],
  classNameBindings: ['modeClass'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.storeForm',

  /**
   * One of: `'create'`, `'edit'`, `'view'`
   * @type {String}
   */
  mode: undefined,

  /**
   * Needed when `mode` is `'edit'` or `'view'`
   * @virtual optional
   * @type {Object}
   */
  store: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Object} change
   *   ```
   *   {
   *     data: Object, // form data
   *     isValid: Boolean,
   *   }
   *   ```
   */
  onChange: notImplementedIgnore,

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Object>}
   */
  passedFormValues: computed(
    'store.{name,description,type}',
    function passedStoreFormValues() {
      return storeToFormData(this.get('store'));
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      nameField,
      descriptionField,
      typeField,
      genericStoreConfigFieldsGroup,
    } = this.getProperties(
      'nameField',
      'descriptionField',
      'typeField',
      'genericStoreConfigFieldsGroup'
    );

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      onValueChange() {
        this._super(...arguments);
        scheduleOnce('afterRender', this.get('component'), 'notifyAboutChange');
      },
    }).create({
      component: this,
      fields: [
        nameField,
        descriptionField,
        typeField,
        genericStoreConfigFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    return TextField
      .extend(defaultValueGenerator(this, raw('')))
      .create({
        name: 'name',
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextareaField>}
   */
  descriptionField: computed(function descriptionField() {
    return TextareaField
      .extend(defaultValueGenerator(this, raw('')))
      .create({
        name: 'description',
        isOptional: true,
        viewModeAsStaticText: true,
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  typeField: computed(function typeField() {
    return DropdownField
      .extend(defaultValueGenerator(this, 'options.firstObject.value'))
      .create({
        name: 'type',
        showSearch: false,
        options: storeTypes,
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  genericStoreConfigFieldsGroup: computed(function genericStoreConfigFieldsGroup() {
    const {
      dataTypeField,
      defaultValueField,
    } = this.getProperties(
      'dataTypeField',
      'defaultValueField'
    );
    return FormFieldsGroup.extend({
      isExpanded: neq('valuesSource.type', raw('range')),
      isVisible: or(eq('mode', raw('edit')), 'isExpanded'),
    }).create({
      name: 'genericStoreConfig',
      fields: [
        dataTypeField,
        defaultValueField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  dataTypeField: computed(function dataTypeField() {
    return DropdownField
      .extend(defaultValueGenerator(this, 'options.firstObject.value'), {
        isEnabled: gt(array.length('options'), raw(1)),
        options: computed('valuesSource.type', function options() {
          const storeType = this.get('valuesSource.type');
          return dataTypes.filter(({ forbiddenIn }) => !forbiddenIn.includes(storeType));
        }),
        storeTypeObserver: observer('valuesSource.type', function storeTypeObserver() {
          const {
            options,
            value,
          } = this.getProperties('options', 'value');
          if (value && !options.mapBy('value').includes(value)) {
            this.valueChanged(options[0].value);
          }
        }),
      })
      .create({
        name: 'dataType',
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  defaultValueField: computed(function defaultValueField() {
    return TextField
      .extend(defaultValueGenerator(this, raw('')))
      .create({
        name: 'defaultValue',
        isOptional: true,
      });
  }),

  formValuesUpdater: observer(
    'mode',
    'passedFormValues',
    function formValuesUpdater() {
      const {
        mode,
        fields,
      } = this.getProperties('mode', 'fields');
      if (mode === 'view') {
        fields.reset();
      }
    }
  ),

  formModeUpdater: observer('mode', function formModeUpdater() {
    const {
      mode,
      fields,
    } = this.getProperties('mode', 'fields');

    fields.changeMode(mode === 'view' ? 'view' : 'edit');
  }),

  init() {
    this._super(...arguments);

    this.formModeUpdater();
    this.get('fields').reset();
  },

  notifyAboutChange() {
    const {
      onChange,
      fields,
      mode,
    } = this.getProperties('onChange', 'fields', 'mode');

    if (mode === 'view') {
      return;
    }

    onChange({
      data: formDataToStore(fields.dumpValue()),
      isValid: get(fields, 'isValid'),
    });
  },
});

/**
 * Generates mixin-like object, that specifies default value for field. Value in "view"
 * and "edit" mode is taken from component, in "create" mode is equal to passed
 * `createDefaultValue`. It's result should be passed to *Field.extend.
 * @param {Components.Modals.WorkflowVisualiser.StoreModal.StoreForm} component
 * @param {any} createDefaultValue
 * @returns {Object}
 */
function defaultValueGenerator(component, createDefaultValue) {
  return {
    defaultValueSource: component,
    defaultValue: conditional(
      eq('defaultValueSource.mode', raw('create')),
      createDefaultValue,
      getBy('defaultValueSource', tag `passedFormValues.${'path'}`),
    ),
  };
}

function storeToFormData(store) {
  if (!store) {
    return {};
  }

  return getProperties(
    store,
    'name',
    'description',
    'type',
  );
}

function formDataToStore(formData) {
  return getProperties(
    formData,
    'name',
    'description',
    'type',
  );
}
