// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

/**
 * A form responsible for showing and editing/creating stores. It does not persists
 * data. Any changes are yielded using `onChange` callback.
 *
 * @module components/modals/workflow-visualiser/store-modal/store-form
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/store-form';
import {
  tag,
  eq,
  neq,
  raw,
  or,
  not,
  and,
  isEmpty,
  notEmpty,
} from 'ember-awesome-macros';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { computed, observer, getProperties, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { validator } from 'ember-cp-validations';
import storeConfigEditors from 'onedata-gui-common/utils/atm-workflow/store-config-editors';
import {
  FormElement as DataSpecEditor,
  formValuesToDataSpec,
  dataSpecToFormValues,
  dataSpecTypes,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const storeTypes = [
  'list',
  'treeForest',
  'singleValue',
  'range',
  'auditLog',
  'timeSeries',
];

const dataTypesForbiddenForAllStores = [
  'onedatafsCredentials',
];

const dataTypesForbiddenPerStoreType = {
  treeForest: [
    'integer',
    'string',
    'object',
    'range',
    'timeSeriesMeasurement',
  ],
  range: dataSpecTypes.without('range'),
  timeSeries: dataSpecTypes.without('timeSeriesMeasurement'),
};

const defaultRangeStart = 0;
const defaultRangeStep = 1;

export default Component.extend(I18n, {
  layout,
  classNames: ['store-form'],
  classNameBindings: [
    'modeClass',
    'isDisabled:form-disabled:form-enabled',
  ],

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
   * @type {Array<String>|undefined}
   */
  allowedDataTypes: undefined,

  /**
   * @type {Array<String>|undefined}
   */
  allowedStoreTypes: undefined,

  /**
   * Needed when `mode` is `'create'` or `'edit'`
   * @virtual optional
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
   * @virtual optional
   * @type {Boolean}
   */
  isDisabled: false,

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  effAllowedStoreTypes: computed(
    'allowedStoreTypes',
    'allowedDataTypes',
    function effAllowedStoreTypes() {
      const {
        allowedDataTypes,
        allowedStoreTypes,
      } = this.getProperties('allowedDataTypes', 'allowedStoreTypes');

      let effAllowedTypes = storeTypes;
      if (allowedStoreTypes && allowedStoreTypes.length) {
        effAllowedTypes = effAllowedTypes.filter((type) =>
          allowedStoreTypes.includes(type)
        );
      }
      if (allowedDataTypes && allowedDataTypes.length) {
        effAllowedTypes = effAllowedTypes.filter((type) => {
          const forbiddenDataTypes = dataTypesForbiddenPerStoreType[type] || [];
          return _.difference(allowedDataTypes, forbiddenDataTypes).length > 0;
        });
      }
      return effAllowedTypes;
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Object>}
   */
  passedFormValues: computed(
    'store.{name,description,type,dataType,defaultInitialContent,requiresInitialContent}',
    'effAllowedStoreTypes',
    function passedStoreFormValues() {
      const {
        store,
        effAllowedStoreTypes,
      } = this.getProperties('store', 'effAllowedStoreTypes');

      const defaultStoreType = effAllowedStoreTypes[0];
      return storeToFormData(store, {
        defaultType: defaultStoreType,
        allowedDataTypes: this.calculateEffAllowedDataTypes(defaultStoreType),
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      idField,
      instanceIdField,
      nameField,
      descriptionField,
      typeField,
      genericStoreConfigFieldsGroup,
      rangeStoreConfigFieldsGroup,
      timeSeriesStoreConfigFieldsGroup,
      needsUserInputField,
    } = this.getProperties(
      'idField',
      'instanceIdField',
      'nameField',
      'descriptionField',
      'typeField',
      'genericStoreConfigFieldsGroup',
      'rangeStoreConfigFieldsGroup',
      'timeSeriesStoreConfigFieldsGroup',
      'needsUserInputField'
    );

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not('component.isDisabled'),
      onValueChange() {
        this._super(...arguments);
        scheduleOnce('afterRender', this.get('component'), 'notifyAboutChange');
      },
    }).create({
      component: this,
      fields: [
        idField,
        instanceIdField,
        nameField,
        descriptionField,
        typeField,
        genericStoreConfigFieldsGroup,
        rangeStoreConfigFieldsGroup,
        timeSeriesStoreConfigFieldsGroup,
        needsUserInputField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ClipboardField>}
   */
  idField: computed(function idField() {
    return ClipboardField
      .extend({
        isVisible: and(neq('component.mode', raw('create')), notEmpty('value')),
      }).create({
        component: this,
        name: 'id',
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ClipboardField>}
   */
  instanceIdField: computed(function instanceIdField() {
    return ClipboardField
      .extend({
        isVisible: and(eq('component.mode', raw('view')), notEmpty('value')),
      }).create({
        component: this,
        name: 'instanceId',
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    return TextField.extend({
      isVisible: or(neq('component.mode', raw('view')), notEmpty('value')),
    }).create({
      component: this,
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextareaField>}
   */
  descriptionField: computed(function descriptionField() {
    return TextareaField.extend({
        isVisible: not(and('isInViewMode', isEmpty('value'))),
      })
      .create({
        name: 'description',
        isOptional: true,
        showsStaticTextInViewMode: true,
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  typeField: computed(function typeField() {
    const component = this;
    return DropdownField.extend({
      options: computed(
        'component.effAllowedStoreTypes',
        function options() {
          return this.get('component.effAllowedStoreTypes').map((type) => ({
            value: type,
          }));
        }
      ),
    }).create({
      name: 'type',
      showSearch: false,
      component,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  genericStoreConfigFieldsGroup: computed(function genericStoreConfigFieldsGroup() {
    const {
      dataSpecField,
      defaultValueField,
    } = this.getProperties(
      'dataSpecField',
      'defaultValueField'
    );
    return FormFieldsGroup.extend({
      isExpanded: and(
        neq('valuesSource.type', raw('range')),
        neq('valuesSource.type', raw('timeSeries'))
      ),
      isVisible: or(eq('mode', raw('edit')), 'isExpanded'),
    }).create({
      name: 'genericStoreConfig',
      fields: [
        dataSpecField,
        defaultValueField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormElement>}
   */
  dataSpecField: computed(function dataSpecField() {
    const field = DataSpecEditor.extend({
      allowedTypes: computed(
        'component.allowedDataTypes',
        'valuesSource.type',
        function allowedTypes() {
          return this.get('component').calculateEffAllowedDataTypes(
            this.get('valuesSource.type')
          );
        }
      ),
    }).create({
      component: this,
      name: 'dataSpec',
    });
    get(field.getFieldByPath('valueConstraints'), 'fields')
      .forEach((constraintsField) => set(
        constraintsField,
        'classes',
        `${get(constraintsField, 'classes') || ''} nowrap-on-desktop`
      ));
    return field;
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  defaultValueField: computed(function defaultValueField() {
    return JsonField.extend({
      isVisible: not(and('isInViewMode', isEmpty('value'))),
    }).create({
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
    return NumberField.create({
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
    return NumberField.create({
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
    return NumberField.create({
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
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  timeSeriesStoreConfigFieldsGroup: computed(function timeSeriesStoreConfigFieldsGroup() {
    return FormFieldsGroup.extend({
      isExpanded: eq('valuesSource.type', raw('timeSeries')),
      isVisible: or(eq('mode', raw('edit')), 'isExpanded'),
    }).create({
      name: 'timeSeriesStoreConfig',
      fields: [
        storeConfigEditors.timeSeries.FormElement.create({
          name: 'configEditor',
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  needsUserInputField: computed(function needsUserInputField() {
    return ToggleField.extend({
      isEnabled: neq('valuesSource.type', raw('timeSeries')),
      storeTypeObserver: observer('valuesSource.type', function storeTypeObserver() {
        // For time series store change value to `false`
        if (this.get('valuesSource.type') === 'timeSeries' && this.get('value')) {
          this.valueChanged(false);
        }
      }),
    }).create({
      name: 'needsUserInput',
    });
  }),

  formValuesUpdater: observer(
    'mode',
    'passedFormValues',
    function formValuesUpdater() {
      if (this.get('mode') === 'view') {
        this.resetFormValues();
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

    this.resetFormValues();
    this.formModeUpdater();
  },

  resetFormValues() {
    const {
      fields,
      passedFormValues,
    } = this.getProperties('fields', 'passedFormValues');

    set(fields, 'valuesSource', passedFormValues);
    fields.useCurrentValueAsDefault();
    fields.reset();
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

  calculateEffAllowedDataTypes(storeType) {
    const allowedDataTypes = this.get('allowedDataTypes') || dataSpecTypes;
    const forbiddenDataTypes = [
      ...(dataTypesForbiddenPerStoreType[storeType] || []),
      ...dataTypesForbiddenForAllStores,
    ];
    return allowedDataTypes.filter((type) => !forbiddenDataTypes.includes(type));
  },
});

function storeToFormData(store, { defaultType, allowedDataTypes }) {
  if (!store) {
    return createValuesContainer({
      name: '',
      description: '',
      type: defaultType,
      genericStoreConfig: createValuesContainer({
        dataSpec: dataSpecToFormValues(null, { allowedTypes: allowedDataTypes }),
        defaultValue: '',
      }),
      rangeStoreConfig: createValuesContainer({
        rangeStart: String(defaultRangeStart),
        rangeEnd: '',
        rangeStep: String(defaultRangeStep),
      }),
      timeSeriesStoreConfig: createValuesContainer({
        configEditor: storeConfigEditors.timeSeries.storeConfigToFormValues(null),
      }),
      needsUserInput: false,
    });
  }

  const {
    schemaId,
    instanceId,
    name,
    description,
    type,
    writeDataSpec,
    config,
    defaultInitialContent,
    requiresInitialContent,
  } = getProperties(
    store,
    'schemaId',
    'instanceId',
    'name',
    'description',
    'type',
    'writeDataSpec',
    'config',
    'defaultInitialContent',
    'requiresInitialContent'
  );

  const formData = {
    id: schemaId,
    instanceId,
    name,
    description,
    type,
    needsUserInput: Boolean(requiresInitialContent),
  };

  switch (type) {
    case 'range': {
      const {
        start,
        end,
        step,
      } = getProperties(
        defaultInitialContent || {},
        'start',
        'end',
        'step'
      );

      formData.rangeStoreConfig = createValuesContainer({
        rangeStart: String(typeof start === 'number' ? start : defaultRangeStart),
        rangeEnd: String(end),
        rangeStep: String(typeof step === 'number' ? step : defaultRangeStep),
      });
      break;
    }
    default:
      formData.genericStoreConfig = createValuesContainer({
        dataSpec: dataSpecToFormValues(writeDataSpec, { allowedTypes: allowedDataTypes }),
        defaultValue: [undefined, null].includes(defaultInitialContent) ?
          '' : JSON.stringify(defaultInitialContent, null, 2),
      });
      break;
  }

  formData.timeSeriesStoreConfig = createValuesContainer({
    configEditor: storeConfigEditors.timeSeries.storeConfigToFormValues(
      type === 'timeSeries' ? config : null
    ),
  });

  return createValuesContainer(formData);
}

function formDataToStore(formData) {
  const {
    name,
    description,
    type,
    genericStoreConfig,
    rangeStoreConfig,
    timeSeriesStoreConfig,
    needsUserInput,
  } = getProperties(
    formData,
    'name',
    'description',
    'type',
    'genericStoreConfig',
    'rangeStoreConfig',
    'timeSeriesStoreConfig',
    'needsUserInput'
  );

  const store = {
    name,
    description,
    type,
    requiresInitialContent: Boolean(needsUserInput),
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

      store.defaultInitialContent = {
        start: Number(rangeStart),
        end: Number(rangeEnd),
        step: Number(rangeStep),
      };
      break;
    }
    case 'timeSeries':
      store.config = storeConfigEditors.timeSeries.formValuesToStoreConfig(
        get(timeSeriesStoreConfig, 'configEditor')
      );
      break;
    default: {
      const {
        dataSpec,
        defaultValue,
      } = getProperties(
        genericStoreConfig || {},
        'dataSpec',
        'defaultValue'
      );

      const writeDataSpec = formValuesToDataSpec(dataSpec);
      let defaultInitialContent = null;
      if (defaultValue && defaultValue.trim()) {
        try {
          defaultInitialContent = JSON.parse(defaultValue);
        } catch (e) {
          defaultInitialContent = null;
        }
      }

      const config = type === 'auditLog' ? {
        logContentDataSpec: writeDataSpec,
      } : {
        itemDataSpec: writeDataSpec,
      };

      Object.assign(store, {
        config,
        defaultInitialContent,
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
