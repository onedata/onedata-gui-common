/**
 * A form responsible for showing and editing/creating tasks. It does not persists
 * data. Any changes are yielded using `onChange` callback.
 *
 * @module components/workflow-visualiser/taske-form
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/workflow-visualiser/task-form';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { tag, not, eq, raw, notEmpty, or, gt } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { computed, observer, getProperties, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import HiddenField from 'onedata-gui-common/utils/form-component/hidden-field';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import {
  getTargetStoreTypesForType,
  getTargetDataTypesForType,
  dataSpecToType,
} from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import cloneAsEmberObject from 'onedata-gui-common/utils/clone-as-ember-object';
import _ from 'lodash';
import {
  createTaskResourcesFields,
  serializeTaskResourcesFieldsValues,
} from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import storeContentUpdateOptionsEditors from 'onedata-gui-common/utils/atm-workflow/store-content-update-options-editor';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const createStoreDropdownOptionValue = '__createStore';
const leaveUnassignedDropdownOptionValue = '__leaveUnassigned';
const taskAuditLogDropdownOptionValue = '__taskAuditLog';
const workflowAuditLogDropdownOptionValue = '__workflowAuditLog';

const backendStoreIdsMappings = {
  [taskAuditLogDropdownOptionValue]: 'CURRENT_TASK_SYSTEM_AUDIT_LOG',
  [workflowAuditLogDropdownOptionValue]: 'WORKFLOW_SYSTEM_AUDIT_LOG',
};
const frontendStoreIdsMappings = _.invert(backendStoreIdsMappings);

const taskAuditLogStore = Store.create({
  id: taskAuditLogDropdownOptionValue,
  type: 'auditLog',
  config: {
    logContentDataSpec: {
      type: 'object',
      valueConstraints: {},
    },
  },
});
const workflowAuditLogStore = Store.create({
  id: workflowAuditLogDropdownOptionValue,
  type: 'auditLog',
  config: {
    logContentDataSpec: {
      type: 'object',
      valueConstraints: {},
    },
  },
});

export default Component.extend(I18n, {
  layout,
  classNames: ['workflow-visualiser-task-form', 'task-form'],
  classNameBindings: [
    'modeClass',
    'isDisabled:form-disabled:form-enabled',
  ],

  i18n: service(),
  media: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.taskForm',

  /**
   * One of: `'create'`, `'edit'`, `'view'`
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  definedStores: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  atmLambda: undefined,

  /**
   * @virtual
   * @type {RevisionNumber}
   */
  atmLambdaRevisionNumber: undefined,

  /**
   * Needed when `mode` is `'edit'` or `'view'`
   * @virtual optional
   * @type {Object}
   */
  task: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isShown: false,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  isDisabled: false,

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
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Array<Object>}
   */
  argumentStores: reads('definedStores'),

  /**
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  atmLambdaRevision: computed(
    'atmLambda.revisionRegistry',
    'atmLambdaRevisionNumber',
    function atmLambdaRevision() {
      const atmLambdaRevisionNumber = this.get('atmLambdaRevisionNumber');
      return atmLambdaRevisionNumber && this.get(
        `atmLambda.revisionRegistry.${atmLambdaRevisionNumber}`
      );
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  atmLambdaHasBatchMode: gt('atmLambdaRevision.preferredBatchSize', raw(1)),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  resultStores: computed('definedStores.[]', function resultStores() {
    const definedStores = this.get('definedStores') || [];
    return [taskAuditLogStore, workflowAuditLogStore]
      .concat(definedStores.toArray().compact());
  }),

  /**
   * Union of `argumentStores` and `resultStores`
   * @type {ComputedProperty<Array<Object>>}
   */
  allStores: computed('argumentStores.[]', 'resultStores.[]', function allStores() {
    const {
      argumentStores = [],
        resultStores = [],
    } = this.getProperties('argumentStores', 'resultStores');
    return [...argumentStores.toArray(), ...resultStores.toArray()].uniq();
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  passedFormValues: computed(
    'task.{name,argumentMappings,resultMappings,resourceSpecOverride}',
    'atmLambdaRevision',
    function passedStoreFormValues() {
      const {
        task,
        atmLambdaRevision,
      } = this.getProperties('task', 'atmLambdaRevision');
      return taskToFormData(task, atmLambdaRevision);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      nameField,
      argumentMappingsFieldsCollectionGroup,
      resultMappingsFieldsCollectionGroup,
      resourcesFieldsGroup,
    } = this.getProperties(
      'nameField',
      'argumentMappingsFieldsCollectionGroup',
      'resultMappingsFieldsCollectionGroup',
      'resourcesFieldsGroup'
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
        nameField,
        argumentMappingsFieldsCollectionGroup,
        resultMappingsFieldsCollectionGroup,
        resourcesFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    return TextField.create({
      component: this,
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  argumentMappingsFieldsCollectionGroup: computed(
    function argumentMappingsFieldsCollectionGroup() {
      const component = this;
      return FormFieldsCollectionGroup.extend({
        isVisible: notEmpty('value.__fieldsValueNames'),
        fieldFactoryMethod(uniqueFieldValueName) {
          return FormFieldsGroup.extend({
            label: reads('value.context.name'),
            addColonToLabel: not('component.media.isMobile'),
          }).create({
            name: 'argumentMapping',
            valueName: uniqueFieldValueName,
            component,
            fields: [
              HiddenField.create({ name: 'context' }),
              DropdownField.extend({
                options: computed(
                  'parent.value.context.{type,isOptional}',
                  function options() {
                    const argumentType = this.get('parent.value.context.type');
                    const argumentIsArray = this.get('parent.value.context.isArray');
                    const argumentIsOptional = this.get('parent.value.context.isOptional');
                    const opts =
                      getValueBuilderTypesForArgType(argumentType, argumentIsArray)
                      .map(vbType => ({ value: vbType }));
                    if (argumentIsOptional) {
                      opts.unshift({ value: leaveUnassignedDropdownOptionValue });
                    }
                    return opts;
                  }
                ),
              }).create({
                name: 'valueBuilderType',
              }),
              JsonField.extend({
                isVisible: eq('parent.value.valueBuilderType', raw('const')),
              }).create({
                name: 'valueBuilderConstValue',
              }),
              DropdownField.extend({
                isVisible: eq(
                  'parent.value.valueBuilderType',
                  raw('singleValueStoreContent')
                ),
                options: computed(
                  'component.argumentStores.@each.{type,name}',
                  'parent.value.context.type',
                  function options() {
                    const argumentType = this.get('parent.value.context.type');
                    const argumentStores = this.get('component.argumentStores') || [];
                    const possibleStores =
                      getSourceStoreForType(argumentStores, argumentType);
                    const opts = possibleStores
                      .sortBy('name')
                      .map(({ id, name }) => ({
                        value: id,
                        label: name,
                      }));
                    opts.unshift({
                      value: createStoreDropdownOptionValue,
                    });
                    return opts;
                  }
                ),
                valueChanged(value) {
                  if (value === createStoreDropdownOptionValue) {
                    const argumentType = this.get('parent.value.context.type');
                    component.createSourceStore(this, argumentType);
                  } else {
                    return this._super(...arguments);
                  }
                },
              }).create({
                component,
                name: 'valueBuilderStore',
              }),
            ],
          });
        },
        dumpDefaultValue() {
          const defaultValue = this.get('defaultValue');
          return defaultValue ?
            cloneAsEmberObject(defaultValue) : this._super(...arguments);
        },
      }).create({
        name: 'argumentMappings',
        addColonToLabel: false,
        isCollectionManipulationAllowed: false,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  resultMappingsFieldsCollectionGroup: computed(
    function resultMappingsFieldsCollectionGroup() {
      const component = this;
      return FormFieldsCollectionGroup.extend({
        isVisible: notEmpty('value.__fieldsValueNames'),
        fieldFactoryMethod(uniqueFieldValueName) {
          return FormFieldsGroup.extend({
            label: reads('value.context.name'),
            addColonToLabel: not('component.media.isMobile'),
            selectedTargetStore: computed(
              'value.targetStore',
              'component.resultStores.@each.id',
              function selectedTargetStore() {
                const targetStoreId = this.get('value.targetStore');
                return (this.get('component.resultStores') || []).findBy('id', targetStoreId);
              }
            ),
          }).create({
            name: 'resultMapping',
            valueName: uniqueFieldValueName,
            component,
            fields: [
              HiddenField.create({ name: 'context' }),
              DropdownField.extend({
                options: computed(
                  'parent.value.context.{type,isBatch}',
                  'component.resultStores.@each.{type,name}',
                  function options() {
                    const resultStores = this.get('component.resultStores') || [];
                    const resultType = this.get('parent.value.context.type');
                    const resultIsBatch = this.get('parent.value.context.isBatch');
                    const opts = getTargetStoresForType(resultStores, resultType, resultIsBatch)
                      .map(store => ({
                        value: get(store, 'id'),
                        label: get(store, 'name'),
                      }))
                      .sortBy('label');
                    opts.unshift({
                      value: createStoreDropdownOptionValue,
                    }, {
                      value: leaveUnassignedDropdownOptionValue,
                    });
                    return opts;
                  }
                ),
                optionsObserver: observer('options.[]', function optionsObserver() {
                  const {
                    options,
                    value,
                  } = this.getProperties('options', 'value');
                  if (!options.findBy('value', value)) {
                    // options[1] is "leaveUnassigned"
                    this.valueChanged(get(options[1], 'value'));
                  }
                }),
                valueChanged(value) {
                  if (value === createStoreDropdownOptionValue) {
                    const resultType = this.get('parent.value.context.type');
                    component.createTargetStore(this, resultType);
                  } else {
                    return this._super(...arguments);
                  }
                },
              }).create({
                component,
                name: 'targetStore',
              }),
              DropdownField.extend({
                isVisible: notEmpty('options'),
                options: computed(
                  'parent.selectedTargetStore',
                  function options() {
                    const selectedTargetStore = this.get('parent.selectedTargetStore');
                    return getDispatchFunctionsForStoreType((selectedTargetStore || {}).type)
                      .map(func => ({ value: func }));
                  }
                ),
                optionsObserver: observer('options.[]', function optionsObserver() {
                  scheduleOnce('afterRender', this, 'adjustValueForNewOptions');
                }),
                init() {
                  this._super(...arguments);
                  this.optionsObserver();
                },
                adjustValueForNewOptions() {
                  safeExec(this, () => {
                    const {
                      options,
                      value,
                    } = this.getProperties('options', 'value');
                    if ((!value || !options.findBy('value', value)) && options.length) {
                      this.valueChanged(get(options[0], 'value'));
                    }
                  });
                },
              }).create({
                component,
                name: 'dispatchFunction',
              }),
              storeContentUpdateOptionsEditors.timeSeries.formElement.extend({
                contentUpdateDataSpec: reads('parent.value.context.dataSpec'),
                storeConfig: reads('parent.selectedTargetStore.config'),
                isVisible: computed('parent.selectedTargetStore', function isVisible() {
                  const selectedTargetStore = this.get('parent.selectedTargetStore');
                  return selectedTargetStore && get(selectedTargetStore, 'type') === 'timeSeries';
                }),
              }).create({
                name: 'timeSeriesEditor',
              }),
            ],
          });
        },
        dumpDefaultValue() {
          const defaultValue = this.get('defaultValue');
          return defaultValue ?
            cloneAsEmberObject(defaultValue) : this._super(...arguments);
        },
      }).create({
        name: 'resultMappings',
        addColonToLabel: false,
        isCollectionManipulationAllowed: false,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  resourcesFieldsGroup: computed(function resourcesFieldsGroup() {
    return FormFieldsGroup.create({
      name: 'resources',
      addColonToLabel: false,
      fields: [
        ToggleField.create({
          name: 'overrideResources',
        }),
        FormFieldsGroup.extend({
          isVisible: or(not('isInViewMode'), 'valuesSource.resources.overrideResources'),
          isEnabled: reads('valuesSource.resources.overrideResources'),
          overrideResourcesObserver: observer(
            'valuesSource.resources.overrideResources',
            function overrideResourcesObserver() {
              const overrideResources = this.get('valuesSource.resources.overrideResources');
              const isModified = this.get('isModified');
              if (!overrideResources && isModified) {
                scheduleOnce('afterRender', this, 'reset');
              }
            }
          ),
          init() {
            this._super(...arguments);
            this.overrideResourcesObserver();
          },
        }).create({
          name: 'resourcesSections',
          classes: 'task-resources-fields',
          fields: createTaskResourcesFields({
            pathToGroup: 'resources.resourcesSections',
          }),
        }),
      ],
    });
  }),

  atmLambdaRevisionObserver: observer(
    'atmLambdaRevision',
    function atmLambdaRevisionObserver() {
      this.resetFormValues();
    }
  ),

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

  isShownObserver: observer('isShown', function isShownObserver() {
    const isShown = this.get('isShown');
    if (isShown) {
      this.resetFormValues();
    }
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
      atmLambdaRevision,
      allStores,
    } = this.getProperties('onChange', 'fields', 'mode', 'atmLambdaRevision', 'allStores');

    if (mode === 'view') {
      return;
    }

    onChange && onChange({
      data: formDataToTask(fields.dumpValue(), atmLambdaRevision, allStores),
      isValid: get(fields, 'isValid'),
    });
  },

  async createSourceStore(sourceStoreField, dataType) {
    const actionsFactory = this.get('actionsFactory');
    if (!actionsFactory || !sourceStoreField) {
      return;
    }

    const allowedStoreTypes = ['singleValue'];
    const allowedDataTypes = getSourceDataTypesForType(dataType);

    await this.createStoreForDropdown(
      sourceStoreField,
      allowedStoreTypes,
      allowedDataTypes
    );
  },

  async createTargetStore(targetStoreField, dataType) {
    const {
      actionsFactory,
      atmLambdaHasBatchMode,
    } = this.getProperties('actionsFactory', 'atmLambdaHasBatchMode');
    if (!actionsFactory || !targetStoreField) {
      return;
    }

    const allowedStoreTypes = getTargetStoreTypesForType(dataType, atmLambdaHasBatchMode);
    const allowedDataTypes = getTargetDataTypesForType(dataType);

    await this.createStoreForDropdown(
      targetStoreField,
      allowedStoreTypes,
      allowedDataTypes
    );
  },

  async createStoreForDropdown(dropdownField, allowedStoreTypes, allowedDataTypes) {
    const actionResult = await this.get('actionsFactory').createCreateStoreAction({
      allowedStoreTypes,
      allowedDataTypes,
    }).execute();
    const {
      status,
      result: newStore,
    } = getProperties(actionResult, 'status', 'result');

    if (status !== 'done' || !newStore) {
      return;
    }

    const newStoreId = get(newStore, 'id');
    if (get(dropdownField, 'options').mapBy('value').includes(newStoreId)) {
      dropdownField.valueChanged(newStoreId);
    }
  },

  actions: {
    formNativeSubmit(event) {
      event.preventDefault();
    },
  },
});

function taskToFormData(task, atmLambdaRevision) {
  const {
    name,
    argumentMappings,
    resultMappings,
    resourceSpecOverride,
  } = getProperties(
    task || {},
    'name',
    'argumentMappings',
    'resultMappings',
    'resourceSpecOverride'
  );

  const {
    name: lambdaName,
    preferredBatchSize,
    argumentSpecs,
    resultSpecs,
    resourceSpec,
  } = getProperties(
    atmLambdaRevision || {},
    'name',
    'preferredBatchSize',
    'argumentSpecs',
    'resultSpecs',
    'resourceSpec'
  );

  const formArgumentMappings = {
    __fieldsValueNames: [],
  };
  (argumentSpecs || []).forEach((argumentSpec, idx) => {
    const {
      name,
      dataSpec,
      isOptional,
      defaultValue,
    } = getProperties(
      argumentSpec || {},
      'name',
      'dataSpec',
      'isOptional',
      'defaultValue'
    );
    if (!name || !dataSpec) {
      return;
    }
    const existingMapping = (argumentMappings || []).findBy('argumentName', name);

    const valueName = `argument${idx}`;
    formArgumentMappings.__fieldsValueNames.push(valueName);
    const {
      type,
      isArray,
    } = dataSpecToType(dataSpec);
    let valueBuilderType = get(existingMapping || {}, 'valueBuilder.valueBuilderType');
    if (!valueBuilderType) {
      const hasDefaultValue = defaultValue !== undefined && defaultValue !== null;
      valueBuilderType = (isOptional || hasDefaultValue || existingMapping) ?
        leaveUnassignedDropdownOptionValue :
        getValueBuilderTypesForArgType(type, preferredBatchSize > 1)[0];
    }
    const valueBuilderRecipe = get(existingMapping || {}, 'valueBuilder.valueBuilderRecipe');
    const valueBuilderConstValue = valueBuilderType === 'const' ?
      JSON.stringify(valueBuilderRecipe, null, 2) : undefined;
    const valueBuilderStore = valueBuilderType === 'singleValueStoreContent' ?
      valueBuilderRecipe : undefined;
    formArgumentMappings[valueName] = createValuesContainer({
      context: {
        name,
        type,
        isArray,
        isOptional,
      },
      valueBuilderType,
      valueBuilderConstValue,
      valueBuilderStore,
    });
  });

  const formResultMappings = {
    __fieldsValueNames: [],
  };
  (resultSpecs || []).forEach((resultSpec, idx) => {
    const {
      name,
      dataSpec,
    } = getProperties(
      resultSpec || {},
      'name',
      'dataSpec',
    );
    if (!name || !dataSpec) {
      return;
    }
    const existingMapping = (resultMappings || []).findBy('resultName', name);
    const {
      storeSchemaId,
      storeContentUpdateOptions,
    } = getProperties(
      existingMapping || {},
      'storeSchemaId',
      'storeContentUpdateOptions'
    );
    const dispatchFunction = get(storeContentUpdateOptions || {}, 'function');

    const valueName = `result${idx}`;
    formResultMappings.__fieldsValueNames.push(valueName);
    const resultType = dataSpecToType(dataSpec).type;
    const timeSeriesEditor = resultType === 'timeSeriesMeasurements' ?
      storeContentUpdateOptionsEditors.timeSeries.storeContentUpdateOptionsToFormValues(storeContentUpdateOptions) :
      {};

    formResultMappings[valueName] = createValuesContainer({
      context: {
        name,
        dataSpec,
        type: resultType,
        isBatch: Boolean(preferredBatchSize > 1),
      },
      targetStore: frontendStoreIdsMappings[storeSchemaId] ||
        storeSchemaId ||
        leaveUnassignedDropdownOptionValue,
      dispatchFunction,
      timeSeriesEditor,
    });
  });

  return {
    name: name || lambdaName,
    argumentMappings: createValuesContainer(formArgumentMappings),
    resultMappings: createValuesContainer(formResultMappings),
    resources: generateResourcesFormData(resourceSpec, resourceSpecOverride),
  };
}

function generateResourcesFormData(resourceSpec, resourceSpecOverride) {
  return createValuesContainer({
    overrideResources: Boolean(resourceSpecOverride),
    resourcesSections: createValuesContainer({
      cpu: createValuesContainer({
        cpuRequested: getAtmLambdaResourceValue(
          resourceSpecOverride,
          resourceSpec,
          'cpuRequested'
        ),
        cpuLimit: getAtmLambdaResourceValue(
          resourceSpecOverride,
          resourceSpec,
          'cpuLimit'
        ),
      }),
      memory: createValuesContainer({
        memoryRequested: getAtmLambdaResourceValue(
          resourceSpecOverride,
          resourceSpec,
          'memoryRequested'
        ),
        memoryLimit: getAtmLambdaResourceValue(
          resourceSpecOverride,
          resourceSpec,
          'memoryLimit'
        ),
      }),
      ephemeralStorage: createValuesContainer({
        ephemeralStorageRequested: getAtmLambdaResourceValue(
          resourceSpecOverride,
          resourceSpec,
          'ephemeralStorageRequested'
        ),
        ephemeralStorageLimit: getAtmLambdaResourceValue(
          resourceSpecOverride,
          resourceSpec,
          'ephemeralStorageLimit'
        ),
      }),
    }),
  });
}

function formDataToTask(formData, atmLambdaRevision, stores) {
  const {
    name,
    argumentMappings,
    resultMappings,
    resources,
  } = getProperties(
    formData,
    'name',
    'argumentMappings',
    'resultMappings',
    'resources'
  );
  const {
    argumentSpecs,
    resultSpecs,
  } = getProperties(atmLambdaRevision || {}, 'argumentSpecs', 'resultSpecs');
  const {
    overrideResources,
    resourcesSections,
  } = getProperties(resources || {}, 'overrideResources', 'resourcesSections');

  const task = {
    name,
    argumentMappings: [],
    resultMappings: [],
  };

  (get(argumentMappings || {}, '__fieldsValueNames') || []).forEach((valueName, idx) => {
    const lambdaArgumentSpec = argumentSpecs && argumentSpecs[idx] || {};
    const argumentName = get(lambdaArgumentSpec, 'name');
    const {
      valueBuilderType,
      valueBuilderConstValue,
      valueBuilderStore,
    } = getProperties(
      get(argumentMappings, valueName) || {},
      'valueBuilderType',
      'valueBuilderConstValue',
      'valueBuilderStore'
    );

    if (
      !argumentName ||
      !valueBuilderType ||
      valueBuilderType === leaveUnassignedDropdownOptionValue
    ) {
      return;
    }

    const valueBuilder = {
      valueBuilderType,
    };
    if (valueBuilderType === 'const') {
      try {
        valueBuilder.valueBuilderRecipe = JSON.parse(valueBuilderConstValue);
      } catch (e) {
        valueBuilder.valueBuilderRecipe = null;
      }
    } else if (valueBuilderType === 'singleValueStoreContent') {
      valueBuilder.valueBuilderRecipe = valueBuilderStore;
    }

    task.argumentMappings.push({
      argumentName,
      valueBuilder,
    });
  });

  (get(resultMappings || {}, '__fieldsValueNames') || []).forEach((valueName, idx) => {
    const lambdaResultSpec = resultSpecs && resultSpecs[idx] || {};
    const resultName = get(lambdaResultSpec, 'name');
    const {
      targetStore: targetStoreId,
      dispatchFunction,
      timeSeriesEditor,
    } = getProperties(
      get(resultMappings, valueName) || {},
      'targetStore',
      'dispatchFunction',
      'timeSeriesEditor'
    );

    if (!targetStoreId || targetStoreId === leaveUnassignedDropdownOptionValue) {
      return;
    }

    const targetStore = stores.findBy('id', targetStoreId);
    const targetStoreType = targetStore && get(targetStore, 'type');
    const possibleDispatchFunctions = getDispatchFunctionsForStoreType(targetStoreType);

    if (!targetStoreType) {
      return;
    }

    const storeContentUpdateOptions = {
      type: getStoreContentUpdateOptionsType(targetStoreType),
    };
    if (targetStoreType === 'timeSeries') {
      Object.assign(
        storeContentUpdateOptions,
        storeContentUpdateOptionsEditors.timeSeries.formValuesToStoreContentUpdateOptions(
          timeSeriesEditor, { storeConfig: get(targetStore, 'config') }
        )
      );
    } else if (possibleDispatchFunctions.includes(dispatchFunction)) {
      storeContentUpdateOptions.function = dispatchFunction;
    }

    task.resultMappings.push({
      resultName,
      storeSchemaId: backendStoreIdsMappings[targetStoreId] || targetStoreId,
      storeContentUpdateOptions,
    });
  });

  if (overrideResources) {
    task.resourceSpecOverride = serializeTaskResourcesFieldsValues(resourcesSections);
  }

  return task;
}

function getAtmLambdaResourceValue(resourceSpecOverride, resourceSpec, propName) {
  const spec = resourceSpecOverride ? resourceSpecOverride : resourceSpec;
  const value = spec && spec[propName];
  return typeof value === 'number' ? String(value) : '';
}

function getValueBuilderTypesForArgType(argType, isArray) {
  if (!argType) {
    return [];
  }
  let builders;
  // TODO: VFS-7816 uncomment or remove future code
  // if (argType.endsWith('Store')) {
  //   return ['storeCredentials'];
  if (argType === 'onedatafsCredentials') {
    builders = ['onedatafsCredentials'];
  } else if (argType === 'timeSeriesMeasurements') {
    builders = ['const'];
  } else if (argType === 'object') {
    builders = [
      'iteratedItem',
      'singleValueStoreContent',
      'const',
      // TODO: VFS-7816 uncomment or remove future code
      // 'storeCredentials',
      'onedatafsCredentials',
    ];
  } else {
    builders = [
      'iteratedItem',
      'singleValueStoreContent',
      'const',
    ];
  }

  if (isArray) {
    builders = builders.filter(builder =>
      builder !== 'singleValueStoreContent' && builder !== 'onedatafsCredentials'
    );
  }
  return builders;
}

// TODO: VFS-7816 uncomment or remove future code
// function getStoreTypesForArgType(argType) {
//   if (!argType) {
//     return [];
//   } else if (argType.endsWith('Store')) {
//     return argType.slice(0, -('Store'.length));
//   } else if (argType === 'object') {
//     return [
//       'singleValue',
//       'list',
//       'map',
//       'treeForest',
//       'range',
//       'histogram',
//       'auditLog',
//     ];
//   }
//   return [];
// }

function getSourceDataTypesForType(type) {
  const sourceTypes = [type];
  switch (type) {
    case 'object':
      sourceTypes.push(
        'anyFile',
        'regularFile',
        'directory',
        'symlink',
        'dataset',
        'range'
      );
      break;
    case 'anyFile':
      sourceTypes.push('regularFile', 'directory', 'symlink');
      break;
  }
  return sourceTypes;
}

function getSourceStoreForType(availableStores, type) {
  const allowedDataTypes = getSourceDataTypesForType(type);
  return availableStores.filter(store => {
    const {
      type: storeType,
      readDataSpec,
    } = getProperties(store || {}, 'type', 'readDataSpec');
    if (!readDataSpec || storeType !== 'singleValue') {
      return false;
    }
    const dataType = dataSpecToType(readDataSpec).type;
    return allowedDataTypes.includes(dataType);
  });
}

function getTargetStoresForType(availableStores, type, hasBatchMode) {
  const allowedStoreTypes = getTargetStoreTypesForType(type, hasBatchMode);
  const allowedDataTypes = getTargetDataTypesForType(type);
  return availableStores.filter(store => {
    const {
      type: storeType,
      writeDataSpec,
    } = getProperties(store || {}, 'type', 'writeDataSpec');
    if (!writeDataSpec) {
      return false;
    }
    const dataType = dataSpecToType(writeDataSpec).type;
    return allowedStoreTypes.includes(storeType) && allowedDataTypes.includes(dataType);
  });
}

function getDispatchFunctionsForStoreType(storeType) {
  switch (storeType) {
    case 'list':
    case 'auditLog':
    case 'treeForest':
      return ['append', 'extend'];
    default:
      return [];
  }
}

function getStoreContentUpdateOptionsType(storeType) {
  return `${storeType}StoreContentUpdateOptions`;
}
