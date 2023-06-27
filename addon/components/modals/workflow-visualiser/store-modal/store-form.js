/**
 * A form responsible for showing and editing/creating stores. It does not persists
 * data. Any changes are yielded using `onChange` callback.
 *
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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  computed,
  observer,
  getProperties,
  get,
  set,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import storeConfigEditors from 'onedata-gui-common/utils/atm-workflow/store-config-editors';
import {
  FormElement as DataSpecEditor,
  formValuesToDataSpec,
  dataSpecToFormValues,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import { isAtmDataSpecMatchingFilters } from 'onedata-gui-common/utils/atm-workflow/data-spec/filters';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';
import {
  getDataSpecForStoreDefaultValue,
  canStoreTypeHaveDefaultValue,
} from 'onedata-gui-common/utils/atm-workflow/store-config';

const storeTypes = Object.freeze([
  'list',
  'treeForest',
  'singleValue',
  'range',
  'auditLog',
  'timeSeries',
  'exception',
]);

const storeSpecificAllowedDataSpecTypes = Object.freeze({
  treeForest: ['file', 'dataset'],
  range: ['range'],
  timeSeries: ['timeSeriesMeasurement'],
});

const storeSpecificForbiddenDataSpecTypes = Object.freeze({
  auditLog: ['file', 'dataset'],
});

const storeTypesExpandingArrays = [
  'list',
  'treeForest',
  'auditLog',
  'timeSeries',
  'exception',
];

const storeTypesUnavailableToEdition = ['exception'];

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
   * @virtual optional
   * @type {AtmDataSpec|undefined}
   */
  allowedStoreReadDataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmDataSpec|undefined}
   */
  allowedStoreWriteDataSpec: undefined,

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  effAllowedStoreTypes: computed(
    'allowedStoreReadDataSpec',
    'allowedStoreWriteDataSpec',
    'allowedStoreTypes',
    'mode',
    function effAllowedStoreTypes() {
      const {
        allowedStoreReadDataSpec,
        allowedStoreWriteDataSpec,
        allowedStoreTypes,
      } = this.getProperties(
        'allowedStoreReadDataSpec',
        'allowedStoreWriteDataSpec',
        'allowedStoreTypes'
      );

      let effAllowedTypes = storeTypes;

      if (this.mode !== 'view') {
        effAllowedTypes = effAllowedTypes.filter((type) =>
          !storeTypesUnavailableToEdition.includes(type)
        );
      }

      if (allowedStoreTypes && allowedStoreTypes.length) {
        effAllowedTypes = effAllowedTypes.filter((type) =>
          allowedStoreTypes.includes(type)
        );
      }

      if (allowedStoreReadDataSpec && allowedStoreReadDataSpec.type) {
        effAllowedTypes = effAllowedTypes.filter((storeType) =>
          isDataSpecValidForStoreConfig(allowedStoreReadDataSpec, storeType)
        );
      }

      if (allowedStoreWriteDataSpec && allowedStoreWriteDataSpec.type) {
        effAllowedTypes = effAllowedTypes.filter((storeType) => {
          let isOk = isDataSpecValidForStoreConfig(allowedStoreWriteDataSpec, storeType);
          if (
            !isOk &&
            allowedStoreWriteDataSpec.type === 'array' &&
            storeTypesExpandingArrays.includes(storeType)
          ) {
            isOk = isDataSpecValidForStoreConfig(
              allowedStoreWriteDataSpec.itemDataSpec,
              storeType
            );
          }
          return isOk;
        });
      }

      return effAllowedTypes;
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag`mode-${'mode'}`,

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
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup.extend({
      i18nPrefix: tag`${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not('component.isDisabled'),
      onValueChange() {
        this._super(...arguments);
        scheduleOnce('afterRender', this.get('component'), 'notifyAboutChange');
      },
    }).create({
      component: this,
      fields: [
        this.idField,
        this.instanceIdField,
        this.nameField,
        this.descriptionField,
        this.typeField,
        this.dataSpecField,
        this.defaultValueField,
        this.timeSeriesStoreConfigFieldsGroup,
        this.needsUserInputField,
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
   * @type {ComputedProperty<Utils.FormComponent.FormElement>}
   */
  dataSpecField: computed(function dataSpecField() {
    const field = DataSpecEditor.extend({
      isVisible: and(
        neq('valuesSource.type', raw('range')),
        neq('valuesSource.type', raw('timeSeries'))
      ),
      dataSpecFilters: computed(
        'valuesSource.type',
        function dataSpecFilters() {
          return this.get('component').calculateEffDataSpecFilters(
            this.get('valuesSource.type')
          );
        }
      ),
      storeTypeObserver: observer('valuesSource.type', function storeTypeObserver() {
        scheduleOnce('afterRender', this, 'adjustValueForSelectedStoreType');
      }),
      adjustValueForSelectedStoreType() {
        safeExec(this, () => {
          const storeType = this.get('valuesSource.type');
          const {
            value,
            component,
          } = this.getProperties('value', 'component');
          const dataSpec = formValuesToDataSpec(value);
          const newDataSpecFilters = component.calculateEffDataSpecFilters(storeType);
          if (!isAtmDataSpecMatchingFilters(dataSpec, newDataSpecFilters)) {
            this.valueChanged(dataSpecToFormValues(null));
          }
        });
      },
    }).create({
      component: this,
      name: 'dataSpec',
    });
    return field;
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  defaultValueField: computed(function defaultValueField() {
    return AtmValueEditorField.extend({
      isVisible: and(
        not(and('isInViewMode', not('value.hasValue'))),
        computed('valuesSource.type', function canHaveDefaultValue() {
          return canStoreTypeHaveDefaultValue(this.valuesSource?.type);
        }),
      ),
      atmDataSpecField: computed('parent.fields.[]', function atmDataSpecField() {
        return this.parent?.fields.find((field) => field.name === 'dataSpec') ?? null;
      }),
      atmDataSpec: computed(
        'valuesSource.type',
        'atmDataSpecField.{isValid,value,isVisible}',
        function atmDataSpec() {
          if (
            !this.atmDataSpecField ||
            (!this.atmDataSpecField.isValid && this.atmDataSpecField.isVisible)
          ) {
            return null;
          }
          const storeFromCurrentForm = formDataToStore(this.parent.dumpValue());
          return getDataSpecForStoreDefaultValue(storeFromCurrentForm);
        }
      ),
    }).create({
      name: 'defaultValue',
      classes: 'nowrap-on-desktop',
      isOptional: true,
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
      isEnabled: computed('valuesSource.type', function isEnabled() {
        return canStoreTypeHaveDefaultValue(this.valuesSource?.type);
      }),
      storeTypeObserver: observer('valuesSource.type', function storeTypeObserver() {
        // For stores incapable of having default value, change field value to `false`.
        if (!canStoreTypeHaveDefaultValue(this.valuesSource?.type) && this.value) {
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

  calculateEffDataSpecFilters(storeType) {
    const {
      allowedStoreReadDataSpec,
      allowedStoreWriteDataSpec,
    } = this.getProperties(
      'allowedStoreReadDataSpec',
      'allowedStoreWriteDataSpec',
    );

    const filters = [];

    if (allowedStoreReadDataSpec) {
      filters.push({
        filterType: 'typeOrSubtype',
        types: [allowedStoreReadDataSpec],
      });
    }
    if (allowedStoreWriteDataSpec) {
      const typeOrSupertypeFilter = {
        filterType: 'typeOrSupertype',
        types: [allowedStoreWriteDataSpec],
      };
      const arrayItemDataSpec = allowedStoreWriteDataSpec.type === 'array' &&
        allowedStoreWriteDataSpec?.itemDataSpec;
      if (arrayItemDataSpec && storeTypesExpandingArrays.includes(storeType)) {
        typeOrSupertypeFilter.types.push(arrayItemDataSpec);
      }
      filters.push(typeOrSupertypeFilter);
    }

    if (storeType in storeSpecificAllowedDataSpecTypes) {
      filters.push({
        filterType: 'typeOrSubtype',
        types: storeSpecificAllowedDataSpecTypes[storeType]
          .map((type) => ({ type })),
      });
    }
    if (storeType in storeSpecificForbiddenDataSpecTypes) {
      filters.push({
        filterType: 'forbiddenType',
        types: storeSpecificForbiddenDataSpecTypes[storeType]
          .map((type) => ({ type })),
      });
    }

    return filters;
  },
});

function storeToFormData(store, { defaultType }) {
  if (!store) {
    return createValuesContainer({
      name: '',
      description: '',
      type: defaultType,
      dataSpec: dataSpecToFormValues(null),
      defaultValue: atmRawValueToFormValue(null, true),
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
    defaultValue: atmRawValueToFormValue(defaultInitialContent, true),
    needsUserInput: Boolean(requiresInitialContent),
  };

  // Time series and range stores don't have data spec
  if (type !== 'range' && type !== 'timeSeries') {
    formData.dataSpec = dataSpecToFormValues(
      config?.logContentDataSpec || config?.itemDataSpec
    );
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
    dataSpec: formDataSpec,
    defaultValue: formDefaultValue,
    timeSeriesStoreConfig,
    needsUserInput,
  } = getProperties(
    formData,
    'name',
    'description',
    'type',
    'dataSpec',
    'defaultValue',
    'timeSeriesStoreConfig',
    'needsUserInput'
  );

  const store = {
    name,
    description,
    type,
    requiresInitialContent: Boolean(needsUserInput),
  };

  if (!canStoreTypeHaveDefaultValue(type)) {
    store.defaultInitialContent = null;
  } else {
    store.defaultInitialContent = atmFormValueToRawValue(formDefaultValue);
  }
  // Time series and range stores don't have data spec
  if (type !== 'timeSeries' && type !== 'range') {
    const dataSpec = formValuesToDataSpec(formDataSpec);
    store.config = type === 'auditLog' ? {
      logContentDataSpec: dataSpec,
    } : {
      itemDataSpec: dataSpec,
    };
  } else if (type === 'timeSeries') {
    // Time series store has its own custom configuration field
    store.config = storeConfigEditors.timeSeries.formValuesToStoreConfig(
      get(timeSeriesStoreConfig, 'configEditor')
    );
  }

  return store;
}

function isDataSpecValidForStoreConfig(dataSpec, storeType) {
  if (!dataSpec || !dataSpec.type) {
    return true;
  }

  if (storeType in storeSpecificAllowedDataSpecTypes) {
    return storeSpecificAllowedDataSpecTypes[storeType].includes(dataSpec.type);
  }

  return true;
}
