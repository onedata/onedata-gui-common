import Component from '@ember/component';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/store-form';
import { tag, getBy, conditional, eq, neq, raw, array, or, gt } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { computed, observer, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import {
  typeToDataSpec,
  dataSpecToType,
} from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import { validator } from 'ember-cp-validations';

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

const defaultRangeStart = 0;
const defaultRangeStep = 1;

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
      rangeStoreConfigFieldsGroup,
      needsUserInputField,
    } = this.getProperties(
      'nameField',
      'descriptionField',
      'typeField',
      'genericStoreConfigFieldsGroup',
      'rangeStoreConfigFieldsGroup',
      'needsUserInputField'
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
        rangeStoreConfigFieldsGroup,
        needsUserInputField,
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

  rangeStoreConfigFieldsGroup: computed(function rangeStoreConfigFieldsGroup() {
    const {
      rangeStartField,
      rangeEndField,
      rangeStepField,
    } = this.getProperties(
      'rangeStartField',
      'rangeEndField',
      'rangeStepField'
    );
    return FormFieldsGroup.extend({
      isExpanded: eq('valuesSource.type', raw('range')),
      isVisible: or(eq('mode', raw('edit')), 'isExpanded'),
    }).create({
      name: 'rangeStoreConfig',
      fields: [
        rangeStartField,
        rangeEndField,
        rangeStepField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.NumberField>}
   */
  rangeStartField: computed(function rangeStartField() {
    return NumberField
      .extend(defaultValueGenerator(this, raw(String(defaultRangeStart))))
      .create({
        name: 'rangeStart',
        integer: true,
        customValidators: [
          validator(function (value, options, model) {
            const field = get(model, 'field');
            const fieldPath = get(field, 'path');
            const parsedValue = parseRangeNumberString(value);
            const rangeEnd = parseRangeNumberString(
              get(model, 'valuesSource.rangeStoreConfig.rangeEnd')
            );
            const rangeStep = parseRangeNumberString(
              get(model, 'valuesSource.rangeStoreConfig.rangeStep')
            );
            if (
              Number.isNaN(parsedValue) ||
              Number.isNaN(rangeEnd) ||
              Number.isNaN(rangeStep) ||
              rangeStep === 0
            ) {
              return true;
            }

            if (rangeStep > 0 && parsedValue >= rangeEnd) {
              return String(field.t(`${fieldPath}.errors.gteEndForPositiveStep`));
            } else if (rangeStep < 0 && parsedValue <= rangeEnd) {
              return String(field.t(`${fieldPath}.errors.lteEndForNegativeStep`));
            }
            return true;
          }, {
            dependentKeys: [
              'model.valuesSource.rangeStoreConfig.rangeEnd',
              'model.valuesSource.rangeStoreConfig.rangeStep',
            ],
          }),
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.NumberField>}
   */
  rangeEndField: computed(function rangeEndField() {
    return NumberField
      .extend(defaultValueGenerator(this, raw('')))
      .create({
        name: 'rangeEnd',
        integer: true,
        customValidators: [
          validator(function (value, options, model) {
            const field = get(model, 'field');
            const fieldPath = get(field, 'path');
            const parsedValue = parseRangeNumberString(value);
            const rangeStart = parseRangeNumberString(
              get(model, 'valuesSource.rangeStoreConfig.rangeStart')
            );
            const rangeStep = parseRangeNumberString(
              get(model, 'valuesSource.rangeStoreConfig.rangeStep')
            );
            if (
              Number.isNaN(parsedValue) ||
              Number.isNaN(rangeStart) ||
              Number.isNaN(rangeStep) ||
              rangeStep === 0
            ) {
              return true;
            }

            if (rangeStep > 0 && parsedValue <= rangeStart) {
              return String(field.t(`${fieldPath}.errors.lteStartForPositiveStep`));
            } else if (rangeStep < 0 && parsedValue >= rangeStart) {
              return String(field.t(`${fieldPath}.errors.gteStartForPositiveStep`));
            }
            return true;
          }, {
            dependentKeys: [
              'model.valuesSource.rangeStoreConfig.rangeStart',
              'model.valuesSource.rangeStoreConfig.rangeStep',
            ],
          }),
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.NumberField>}
   */
  rangeStepField: computed(function rangeEndField() {
    return NumberField
      .extend(defaultValueGenerator(this, raw(String(defaultRangeStep))))
      .create({
        name: 'rangeStep',
        integer: true,
        customValidators: [
          validator('exclusion', {
            allowBlank: true,
            in: ['0'],
          }),
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  needsUserInputField: computed(function needsUserInputField() {
    return ToggleField
      .extend(defaultValueGenerator(this, raw(false)))
      .create({
        name: 'needsUserInput',
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

  const {
    name,
    description,
    type,
    dataSpec,
    defaultInitialValue,
    requiresInitialValue,
  } = getProperties(
    store,
    'name',
    'description',
    'type',
    'dataSpec',
    'defaultInitialValue',
    'requiresInitialValue'
  );

  const formData = {
    name,
    description,
    type,
    needsUserInput: Boolean(requiresInitialValue),
  };

  switch (type) {
    case 'range': {
      const {
        start,
        end,
        step,
      } = getProperties(
        defaultInitialValue || {},
        'start',
        'end',
        'step'
      );

      formData.rangeStoreConfig = {
        rangeStart: String(typeof start === 'number' ? start : defaultRangeStart),
        rangeEnd: String(end),
        rangeStep: String(typeof step === 'number' ? step : defaultRangeStep),
      };
      break;
    }
    default:
      formData.genericStoreConfig = {
        dataType: dataSpec && dataSpecToType(dataSpec) || undefined,
        defaultValue: defaultInitialValue,
      };
      break;
  }

  return formData;
}

function formDataToStore(formData) {
  const {
    name,
    description,
    type,
    genericStoreConfig,
    rangeStoreConfig,
    needsUserInput,
  } = getProperties(
    formData,
    'name',
    'description',
    'type',
    'genericStoreConfig',
    'rangeStoreConfig',
    'needsUserInput'
  );

  const store = {
    name,
    description,
    type,
    requiresInitialValue: Boolean(needsUserInput),
  };

  switch (type) {
    case 'range': {
      const {
        rangeStart,
        rangeEnd,
        rangeStep,
      } = getProperties(
        rangeStoreConfig || {},
        'rangeStart',
        'rangeEnd',
        'rangeStep'
      );

      store.defaultInitialValue = {
        start: Number(rangeStart),
        end: Number(rangeEnd),
        step: Number(rangeStep),
      };
      break;
    }
    default: {
      const {
        dataType,
        defaultValue,
      } = getProperties(genericStoreConfig || {}, 'dataType', 'defaultValue');

      Object.assign(store, {
        dataSpec: dataType && typeToDataSpec(dataType) || undefined,
        defaultInitialValue: defaultValue || '',
      });
      break;
    }
  }

  return store;
}

function parseRangeNumberString(rangeNumberString) {
  const stringAsNumber = Number(rangeNumberString);
  return Number.isInteger(stringAsNumber) &&
    rangeNumberString &&
    rangeNumberString.trim().length ?
    stringAsNumber : NaN;
}
