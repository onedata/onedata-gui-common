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
import { tag, not, eq, neq, raw, getBy, notEmpty, or } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { computed, observer, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
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

const createStoreDropdownOptionValue = '__createStore';
const leaveUnassignedDropdownOptionValue = '__leaveUnassigned';
const taskAuditLogDropdownOptionValue = '__taskAuditLog';
const workflowAuditLogDropdownOptionValue = '__workflowAuditLog';

const backendStoreIdsMappings = {
  [taskAuditLogDropdownOptionValue]: 'CURRENT_TASK_SYSTEM_AUDIT_LOG',
  [workflowAuditLogDropdownOptionValue]: 'WORKFLOW_SYSTEM_AUDIT_LOG',
};
const frontendStoreIdsMappings = _.invert(backendStoreIdsMappings);

const taskAuditLogStore = {
  id: taskAuditLogDropdownOptionValue,
  type: 'auditLog',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
};
const workflowAuditLogStore = {
  id: workflowAuditLogDropdownOptionValue,
  type: 'auditLog',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
};

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
   * @type {number}
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
   * @type {ComputedProperty<Array<Object>>}
   */
  resultStores: computed('definedStores.[]', function resultStores() {
    const definedStores = this.get('definedStores') || [];
    return [taskAuditLogStore, workflowAuditLogStore].concat(definedStores.toArray());
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
    return TextField
      .extend(defaultValueGenerator(this))
      .create({
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
      return FormFieldsCollectionGroup.extend(defaultValueGenerator(this), {
        isVisible: notEmpty('value.__fieldsValueNames'),
        fieldFactoryMethod(uniqueFieldValueName) {
          return FormFieldsGroup.extend({
            label: reads('value.argumentName'),
            addColonToLabel: not('component.media.isMobile'),
          }).create({
            name: 'argumentMapping',
            valueName: uniqueFieldValueName,
            component,
            fields: [
              DropdownField.extend({
                options: computed(
                  'parent.value.{argumentType,argumentIsBatch,argumentIsOptional}',
                  function options() {
                    const argumentType = this.get('parent.value.argumentType');
                    const argumentIsBatch = this.get('parent.value.argumentIsBatch');
                    const argumentIsOptional = this.get('parent.value.argumentIsOptional');
                    const opts =
                      getValueBuilderTypesForArgType(argumentType, argumentIsBatch)
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
                  'parent.value.{argumentType,argumentIsBatch}',
                  function options() {
                    const argumentType = this.get('parent.value.argumentType');
                    const argumentIsBatch = this.get('parent.value.argumentIsBatch');
                    const argumentStores = this.get('component.argumentStores') || [];
                    const possibleStores =
                      getSourceStoreForType(argumentStores, argumentType, argumentIsBatch);
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
                    const argumentType = this.get('parent.value.argumentType');
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
      return FormFieldsCollectionGroup.extend(defaultValueGenerator(this), {
        isVisible: notEmpty('value.__fieldsValueNames'),
        fieldFactoryMethod(uniqueFieldValueName) {
          return FormFieldsGroup.extend({
            label: reads('value.resultName'),
            addColonToLabel: not('component.media.isMobile'),
          }).create({
            name: 'resultMapping',
            valueName: uniqueFieldValueName,
            component,
            fields: [
              DropdownField.extend({
                options: computed(
                  'parent.value.{resultType,resultIsBatch}',
                  'component.resultStores.@each.{type,name}',
                  function options() {
                    const resultStores = this.get('component.resultStores') || [];
                    const resultType = this.get('parent.value.resultType');
                    const resultIsBatch = this.get('parent.value.resultIsBatch');
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
                    const resultType = this.get('parent.value.resultType');
                    const resultIsBatch = this.get('parent.value.resultIsBatch');
                    component.createTargetStore(this, resultType, resultIsBatch);
                  } else {
                    return this._super(...arguments);
                  }
                },
              }).create({
                component,
                name: 'targetStore',
              }),
              DropdownField.extend({
                isVisible: neq(
                  'parent.value.targetStore',
                  raw(leaveUnassignedDropdownOptionValue)),
                options: computed(
                  'component.resultStores.@each.id',
                  'parent.value.targetStore',
                  function options() {
                    const targetStoreId = this.get('parent.value.targetStore');
                    const targetStore =
                      (this.get('component.resultStores') || []).findBy('id', targetStoreId);
                    return getDispatchFunctionsForStoreType((targetStore || {}).type)
                      .map(func => ({ value: func }));
                  }
                ),
                optionsObserver: observer('options.[]', function optionsObserver() {
                  const {
                    options,
                    value,
                  } = this.getProperties('options', 'value');
                  if ((!value || !options.findBy('value', value)) && options.length) {
                    this.valueChanged(get(options[0], 'value'));
                  }
                }),
                init() {
                  this._super(...arguments);
                  this.optionsObserver();
                },
              }).create({
                component,
                name: 'dispatchFunction',
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
        ToggleField.extend(defaultValueGenerator(this)).create({
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
            cpuRequestedDefaultValueMixin: defaultValueGenerator(this),
            cpuLimitDefaultValueMixin: defaultValueGenerator(this),
            memoryRequestedDefaultValueMixin: defaultValueGenerator(this),
            memoryLimitDefaultValueMixin: defaultValueGenerator(this),
            ephemeralStorageRequestedDefaultValueMixin: defaultValueGenerator(this),
            ephemeralStorageLimitDefaultValueMixin: defaultValueGenerator(this),
          }),
        }),
      ],
    });
  }),

  atmLambdaRevisionObserver: observer(
    'atmLambdaRevision',
    function atmLambdaRevisionObserver() {
      this.get('fields').reset();
    }
  ),

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
    fields.reset();
  }),

  isShownObserver: observer('isShown', function isShownObserver() {
    const isShown = this.get('isShown');
    if (isShown) {
      this.get('fields').reset();
    }
  }),

  init() {
    this._super(...arguments);

    // Getting props to launch observers
    this.getProperties('passedFormValues', 'atmLambdaRevision');
    this.formModeUpdater();
  },

  notifyAboutChange() {
    const {
      onChange,
      fields,
      mode,
      atmLambdaRevision,
    } = this.getProperties('onChange', 'fields', 'mode', 'atmLambdaRevision');

    if (mode === 'view') {
      return;
    }

    onChange && onChange({
      data: formDataToTask(fields.dumpValue(), atmLambdaRevision),
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

  async createTargetStore(targetStoreField, dataType, isBatch) {
    const actionsFactory = this.get('actionsFactory');
    if (!actionsFactory || !targetStoreField) {
      return;
    }

    const allowedStoreTypes = getTargetStoreTypesForType(dataType, isBatch);
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

/**
 * @param {Components.WorkflowVisualiser.TaskForm} component
 * @param {any} createDefaultValue
 * @returns {Object}
 */
function defaultValueGenerator(component) {
  return {
    defaultValueSource: component,
    defaultValue: getBy('defaultValueSource', tag `passedFormValues.${'path'}`),
  };
}

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
    argumentSpecs,
    resultSpecs,
    resourceSpec,
  } = getProperties(
    atmLambdaRevision || {},
    'name',
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
      isBatch,
      isOptional,
      defaultValue,
    } = getProperties(
      argumentSpec || {},
      'name',
      'dataSpec',
      'isBatch',
      'isOptional',
      'defaultValue'
    );
    if (!name || !dataSpec) {
      return;
    }
    const existingMapping = (argumentMappings || []).findBy('argumentName', name);

    const valueName = `argument${idx}`;
    formArgumentMappings.__fieldsValueNames.push(valueName);
    const argumentType = dataSpecToType(dataSpec);
    let valueBuilderType = get(existingMapping || {}, 'valueBuilder.valueBuilderType');
    if (!valueBuilderType) {
      valueBuilderType = (isOptional || defaultValue !== undefined || existingMapping) ?
        leaveUnassignedDropdownOptionValue :
        getValueBuilderTypesForArgType(argumentType, isBatch)[0];
    }
    const valueBuilderRecipe = get(existingMapping || {}, 'valueBuilder.valueBuilderRecipe');
    const valueBuilderConstValue = valueBuilderType === 'const' ?
      JSON.stringify(valueBuilderRecipe, null, 2) : undefined;
    const valueBuilderStore = valueBuilderType === 'singleValueStoreContent' ?
      valueBuilderRecipe : undefined;
    formArgumentMappings[valueName] = {
      argumentName: name,
      argumentType,
      argumentIsBatch: isBatch,
      argumentIsOptional: isOptional,
      valueBuilderType,
      valueBuilderConstValue,
      valueBuilderStore,
    };
  });

  const formResultMappings = {
    __fieldsValueNames: [],
  };
  (resultSpecs || []).forEach((resultSpec, idx) => {
    const {
      name,
      dataSpec,
      isBatch,
    } = getProperties(
      resultSpec || {},
      'name',
      'dataSpec',
      'isBatch'
    );
    if (!name || !dataSpec) {
      return;
    }
    const existingMapping = (resultMappings || []).findBy('resultName', name);
    const {
      storeSchemaId,
      dispatchFunction,
    } = getProperties(existingMapping || {}, 'storeSchemaId', 'dispatchFunction');

    const valueName = `result${idx}`;
    formResultMappings.__fieldsValueNames.push(valueName);
    const resultType = dataSpecToType(dataSpec);

    formResultMappings[valueName] = {
      resultName: name,
      resultType,
      resultIsBatch: Boolean(isBatch),
      targetStore: frontendStoreIdsMappings[storeSchemaId] ||
        storeSchemaId ||
        leaveUnassignedDropdownOptionValue,
      dispatchFunction: dispatchFunction,
    };
  });

  return {
    name: name || lambdaName,
    argumentMappings: formArgumentMappings,
    resultMappings: formResultMappings,
    resources: generateResourcesFormData(resourceSpec, resourceSpecOverride),
  };
}

function generateResourcesFormData(resourceSpec, resourceSpecOverride) {
  return {
    overrideResources: Boolean(resourceSpecOverride),
    resourcesSections: {
      cpu: {
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
      },
      memory: {
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
      },
      ephemeralStorage: {
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
      },
    },
  };
}

function formDataToTask(formData, atmLambdaRevision) {
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
      targetStore,
      dispatchFunction,
    } = getProperties(
      get(resultMappings, valueName) || {},
      'targetStore',
      'dispatchFunction',
    );

    if (
      !targetStore ||
      !dispatchFunction ||
      targetStore === leaveUnassignedDropdownOptionValue
    ) {
      return;
    }

    task.resultMappings.push({
      resultName,
      storeSchemaId: backendStoreIdsMappings[targetStore] || targetStore,
      dispatchFunction,
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

function getValueBuilderTypesForArgType(argType, isBatch) {
  if (!argType) {
    return [];
    // TODO: VFS-7816 uncomment or remove future code
    // } else if (argType.endsWith('Store')) {
    //   return ['storeCredentials'];
  } else if (argType === 'onedatafsCredentials') {
    return ['onedatafsCredentials'];
  } else if (argType === 'object') {
    return [
      'iteratedItem',
      ...(isBatch ? [] : ['singleValueStoreContent']),
      'const',
      // TODO: VFS-7816 uncomment or remove future code
      // 'storeCredentials',
      'onedatafsCredentials',
    ];
  }

  return [
    'iteratedItem',
    ...(isBatch ? [] : ['singleValueStoreContent']),
    'const',
  ];
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
      sourceTypes.push('anyFile', 'regularFile', 'directory', 'symlink', 'dataset');
      break;
    case 'anyFile':
      sourceTypes.push('regularFile', 'directory', 'symlink');
      break;
  }
  return sourceTypes;
}

function getSourceStoreForType(availableStores, type, isBatch) {
  if (isBatch) {
    return [];
  }

  const allowedDataTypes = getSourceDataTypesForType(type);
  return availableStores.filter(store => {
    const {
      type: storeType,
      dataSpec,
    } = getProperties(store || {}, 'type', 'dataSpec');
    if (!dataSpec || storeType !== 'singleValue') {
      return false;
    }
    const dataType = dataSpecToType(dataSpec);
    return allowedDataTypes.includes(dataType);
  });
}

function getTargetStoresForType(availableStores, type, isBatch) {
  const allowedStoreTypes = getTargetStoreTypesForType(type, isBatch);
  const allowedDataTypes = getTargetDataTypesForType(type);
  return availableStores.filter(store => {
    const {
      type: storeType,
      dataSpec,
    } = getProperties(store || {}, 'type', 'dataSpec');
    if (!dataSpec) {
      return false;
    }
    const dataType = dataSpecToType(dataSpec);
    return allowedStoreTypes.includes(storeType) && allowedDataTypes.includes(dataType);
  });
}

function getDispatchFunctionsForStoreType(storeType) {
  switch (storeType) {
    case 'singleValue':
      return ['set'];
    case 'list':
    case 'auditLog':
      return ['append'];
      // TODO: VFS-7816 uncomment or remove future code
      // return ['append', 'prepend'];
      // case 'map':
    case 'treeForest':
      return ['append'];
      // TODO: VFS-7816 uncomment or remove future code
      // case 'histogram':
      //   return ['add'];
    default:
      return [];
  }
}
