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
import { tag, not, eq, raw, getBy, notEmpty } from 'ember-awesome-macros';
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

export default Component.extend({
  layout,
  classNames: ['task-form'],
  classNameBindings: [
    'modeClass',
    'isDisabled:form-disabled:form-enabled',
  ],

  i18n: service(),

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
    } = this.getProperties(
      'nameField',
      'argumentMappingsFieldsCollectionGroup'
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

  argumentMappingsFieldsCollectionGroup: computed(
    function argumentMappingsFieldsCollectionGroup() {
      const component = this;
      return FormFieldsCollectionGroup.extend(defaultValueGenerator(this), {
        isVisible: notEmpty('value.__fieldsValueNames'),
        fieldFactoryMethod(uniqueFieldValueName) {
          return FormFieldsGroup.extend({
            label: reads('value.argumentName'),
          }).create({
            name: 'argumentMapping',
            valueName: uniqueFieldValueName,
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
                      opts.unshift({ value: 'leaveUnassigned' });
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
                isVisible: eq('parent.value.valueBuilderType', raw('storeCredentials')),
                options: computed(
                  'component.stores.@each.{type,name}',
                  'parent.value.argumentType',
                  function options() {
                    const argumentType = this.get('parent.value.argumentType');
                    const stores = this.get('component.stores') || [];
                    const possibleStoreTypes = getStoreTypesForArgType(argumentType);
                    return stores
                      .filter(({ type }) => possibleStoreTypes.includes(type))
                      .sortBy('name')
                      .map(({ id, name }) => ({
                        value: id,
                        label: name,
                      }));
                  }
                ),
              }).create({
                component,
                name: 'valueBuilderStore',
              }),
            ],
          });
        },
        dumpDefaultValue() {
          return this.get('defaultValue') || this._super(...arguments);
        },
      }).create({
        name: 'argumentMappings',
        addColonToLabel: false,
      });
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

  init() {
    this._super(...arguments);

    this.get('passedFormValues');
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
  } = getProperties(
    task || {},
    'name',
    'argumentMappings',
  );

  const {
    name: lambdaName,
    argumentSpecs,
  } = getProperties(atmLambda || {}, 'name', 'argumentSpecs');

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
        'leaveUnassigned' : getValueBuilderTypesForArgType(argumentType)[0];
    }
    const valueBuilderRecipe = get(existingMapping || {}, 'valueBuilder.valueBuilderRecipe');
    const valueBuilderConstValue = valueBuilderType === 'const' ?
      JSON.stringify(valueBuilderRecipe, null, 2) : undefined;
    const valueBuilderStore = valueBuilderType === 'storeCredentials' ?
      valueBuilderRecipe : undefined;
    formArgumentMappings[valueName] = {
      argumentName: name,
      argumentType,
      argumentIsOptional: isOptional,
      valueBuilderType,
      valueBuilderConstValue,
      valueBuilderStore,
    };
  });

  return {
    name: name || lambdaName,
    argumentMappings: formArgumentMappings,
  };
}

function formDataAndAtmLambdaToTask(formData, atmLambda) {
  const {
    name,
    argumentMappings,
  } = getProperties(
    formData,
    'name',
    'argumentMappings'
  );
  const {
    argumentSpecs,
  } = getProperties(atmLambda || {}, 'argumentSpecs');

  const taskArgumentMappings = [];
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

    if (!argumentName || !valueBuilderType || valueBuilderType === 'leaveUnassigned') {
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
    } else if (valueBuilderType === 'storeCredentials') {
      valueBuilder.valueBuilderRecipe = valueBuilderStore;
    }

    taskArgumentMappings.push({
      argumentName,
      valueBuilder,
    });
  });

  return {
    name,
    argumentMappings: taskArgumentMappings,
  };
}

function getValueBuilderTypesForArgType(argType) {
  if (argType.endsWith('Store')) {
    return ['storeCredentials'];
  } else if (argType === 'onedatafsCredentials') {
    return ['onedatafsCredentials'];
  } else if (argType === 'object') {
    return [
      'iteratedItem',
      'const',
      'storeCredentials',
      'onedatafsCredentials',
    ];
  }

  return [
    'iteratedItem',
    'const',
  ];
}

function getStoreTypesForArgType(argType) {
  if (argType.endsWith('Store')) {
    return argType.slice(0, -('Store'.length));
  } else if (argType === 'object') {
    return [
      'singleValue',
      'list',
      'map',
      'treeForest',
      'range',
      'histogram',
      'auditLog',
    ];
  }
  return [];
}
