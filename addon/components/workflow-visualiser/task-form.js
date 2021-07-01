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
import { tag, not, eq, neq, raw, getBy, notEmpty } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { computed, observer, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { dataSpecToType } from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import cloneAsEmberObject from 'onedata-gui-common/utils/clone-as-ember-object';

const createStoreDropdownOptionValue = '__createStore';
const leaveUnassignedDropdownOptionValue = '__leaveUnassigned';

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
  stores: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  atmLambda: undefined,

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
   * @type {ComputedProperty<Object>}
   */
  passedFormValues: computed(
    'task.{name,argumentMappings,resultMappings}',
    'atmLambda',
    function passedStoreFormValues() {
      const {
        task,
        atmLambda,
      } = this.getProperties('task', 'atmLambda');
      return taskAndAtmLambdaToFormData(task, atmLambda);
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
    } = this.getProperties(
      'nameField',
      'argumentMappingsFieldsCollectionGroup',
      'resultMappingsFieldsCollectionGroup'
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
                  'parent.value.{argumentType,argumentIsOptional}',
                  function options() {
                    const argumentType = this.get('parent.value.argumentType');
                    const argumentIsOptional = this.get('parent.value.argumentIsOptional');
                    const opts = getValueBuilderTypesForArgType(argumentType)
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
              // TODO: VFS-7816 uncomment or remove future code
              // DropdownField.extend({
              //   isVisible: eq('parent.value.valueBuilderType', raw('storeCredentials')),
              //   options: computed(
              //     'component.stores.@each.{type,name}',
              //     'parent.value.argumentType',
              //     function options() {
              //       const argumentType = this.get('parent.value.argumentType');
              //       const stores = this.get('component.stores') || [];
              //       const possibleStoreTypes = getStoreTypesForArgType(argumentType);
              //       return stores
              //         .filter(({ type }) => possibleStoreTypes.includes(type))
              //         .sortBy('name')
              //         .map(({ id, name }) => ({
              //           value: id,
              //           label: name,
              //         }));
              //     }
              //   ),
              // }).create({
              //   component,
              //   name: 'valueBuilderStore',
              // }),
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
                  'component.stores.@each.{type,name}',
                  function options() {
                    const stores = this.get('component.stores') || [];
                    const resultType = this.get('parent.value.resultType');
                    const resultIsBatch = this.get('parent.value.resultIsBatch');
                    const opts = getStoresForResType(stores, resultType, resultIsBatch)
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
                  'component.stores.@each.id',
                  'parent.value.targetStore',
                  function options() {
                    const targetStoreId = this.get('parent.value.targetStore');
                    const targetStore =
                      (this.get('component.stores') || []).findBy('id', targetStoreId);
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

  atmLambdaObserver: observer('atmLambda', function atmLambdaObserver() {
    this.get('fields').reset();
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

    this.getProperties('passedFormValues', 'atmLambda');
    this.formModeUpdater();
  },

  notifyAboutChange() {
    const {
      onChange,
      fields,
      mode,
      atmLambda,
    } = this.getProperties('onChange', 'fields', 'mode', 'atmLambda');

    if (mode === 'view') {
      return;
    }

    onChange && onChange({
      data: formDataAndAtmLambdaToTask(fields.dumpValue(), atmLambda),
      isValid: get(fields, 'isValid'),
    });
  },

  async createTargetStore(targetStoreField, dataType, isBatch) {
    const actionsFactory = this.get('actionsFactory');
    if (!actionsFactory || !targetStoreField) {
      return;
    }

    const allowedStoreTypes = getStoreTypesForResType(dataType, isBatch);
    const allowedDataTypes = getDataTypesForResType(dataType);

    const actionResult = await actionsFactory.createCreateStoreAction({
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
    if (get(targetStoreField, 'options').mapBy('value').includes(newStoreId)) {
      targetStoreField.valueChanged(newStoreId);
    }
  },

  actions: {
    onFormSubmitEvent(event) {
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

function taskAndAtmLambdaToFormData(task, atmLambda) {
  const {
    name,
    argumentMappings,
    resultMappings,
  } = getProperties(
    task || {},
    'name',
    'argumentMappings',
    'resultMappings'
  );

  const {
    name: lambdaName,
    argumentSpecs,
    resultSpecs,
  } = getProperties(atmLambda || {}, 'name', 'argumentSpecs', 'resultSpecs');

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
    const argumentType = dataSpecToType(dataSpec);
    let valueBuilderType = get(existingMapping || {}, 'valueBuilder.valueBuilderType');
    if (!valueBuilderType) {
      valueBuilderType = (isOptional || defaultValue !== undefined || existingMapping) ?
        leaveUnassignedDropdownOptionValue :
        getValueBuilderTypesForArgType(argumentType)[0];
    }
    const valueBuilderRecipe = get(existingMapping || {}, 'valueBuilder.valueBuilderRecipe');
    const valueBuilderConstValue = valueBuilderType === 'const' ?
      JSON.stringify(valueBuilderRecipe, null, 2) : undefined;
    // TODO: VFS-7816 uncomment or remove future code
    // const valueBuilderStore = valueBuilderType === 'storeCredentials' ?
    //   valueBuilderRecipe : undefined;
    formArgumentMappings[valueName] = {
      argumentName: name,
      argumentType,
      argumentIsOptional: isOptional,
      valueBuilderType,
      valueBuilderConstValue,
      // TODO: VFS-7816 uncomment or remove future code
      // valueBuilderStore,
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
      targetStore: storeSchemaId || leaveUnassignedDropdownOptionValue,
      dispatchFunction: dispatchFunction,
    };
  });

  return {
    name: name || lambdaName,
    argumentMappings: formArgumentMappings,
    resultMappings: formResultMappings,
  };
}

function formDataAndAtmLambdaToTask(formData, atmLambda) {
  const {
    name,
    argumentMappings,
    resultMappings,
  } = getProperties(
    formData,
    'name',
    'argumentMappings',
    'resultMappings'
  );
  const {
    argumentSpecs,
    resultSpecs,
  } = getProperties(atmLambda || {}, 'argumentSpecs', 'resultSpecs');

  const taskArgumentMappings = [];
  (get(argumentMappings || {}, '__fieldsValueNames') || []).forEach((valueName, idx) => {
    const lambdaArgumentSpec = argumentSpecs && argumentSpecs[idx] || {};
    const argumentName = get(lambdaArgumentSpec, 'name');
    const {
      valueBuilderType,
      valueBuilderConstValue,
      // TODO: VFS-7816 uncomment or remove future code
      // valueBuilderStore,
    } = getProperties(
      get(argumentMappings, valueName) || {},
      'valueBuilderType',
      'valueBuilderConstValue'
      // TODO: VFS-7816 uncomment or remove future code
      // 'valueBuilderStore'
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
      // TODO: VFS-7816 uncomment or remove future code
      // } else if (valueBuilderType === 'storeCredentials') {
      //   valueBuilder.valueBuilderRecipe = valueBuilderStore;
    }

    taskArgumentMappings.push({
      argumentName,
      valueBuilder,
    });
  });

  const taskResultMappings = [];
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

    taskResultMappings.push({
      resultName,
      storeSchemaId: targetStore,
      dispatchFunction,
    });
  });

  return {
    name,
    argumentMappings: taskArgumentMappings,
    resultMappings: taskResultMappings,
  };
}

function getValueBuilderTypesForArgType(argType) {
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
      'const',
      // TODO: VFS-7816 uncomment or remove future code
      // 'storeCredentials',
      'onedatafsCredentials',
    ];
  }

  return [
    'iteratedItem',
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

function getStoreTypesForResType(resultType, resultIsBatch) {
  const types = ['list'];
  if (!resultIsBatch) {
    types.push('singleValue');
  }
  if (
    ['anyFile', 'regularFile', 'directory', 'symlink', 'dataset'].includes(resultType)
  ) {
    types.push('treeForest');
  }
  return types;
}

function getDataTypesForResType(resultType) {
  const types = [resultType];
  switch (resultType) {
    // TODO: VFS-7816 uncomment or remove future code
    // case 'archive':
    case 'anyFile':
    case 'dataset':
      types.push('object');
      break;
    case 'regularFile':
    case 'directory':
    case 'symlink':
      types.push('anyFile', 'object');
      break;
  }
  return types;
}

function getStoresForResType(availableStores, resultType, resultIsBatch) {
  const allowedStoreTypes = getStoreTypesForResType(resultType, resultIsBatch);
  const allowedDataTypes = getDataTypesForResType(resultType);
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
      return ['append'];
      // TODO: VFS-7816 uncomment or remove future code
      // return ['append', 'prepend'];
      // case 'map':
    case 'treeForest':
      return ['append'];
      // TODO: VFS-7816 uncomment or remove future code
      // case 'histogram':
      // case 'auditLog':
      //   return ['add'];
    default:
      return [];
  }
}
