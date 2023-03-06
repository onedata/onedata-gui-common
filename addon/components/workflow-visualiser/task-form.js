// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

/**
 * A form responsible for showing and editing/creating tasks. It does not persists
 * data. Any changes are yielded using `onChange` callback.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/workflow-visualiser/task-form';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import {
  tag,
  not,
  eq,
  raw,
  notEmpty,
  or,
} from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import {
  computed,
  observer,
  getProperties,
  get,
  setProperties,
  set,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import HiddenField from 'onedata-gui-common/utils/form-component/hidden-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import ClipboardField from 'onedata-gui-common/utils/form-component/clipboard-field';
import { scheduleOnce } from '@ember/runloop';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
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
import storeConfigEditors from 'onedata-gui-common/utils/atm-workflow/store-config-editors';
import { validator } from 'ember-cp-validations';
import {
  doesDataSpecFitToStoreRead,
  doesDataSpecFitToStoreWrite,
} from 'onedata-gui-common/utils/atm-workflow/store-config';
import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';
import cloneValue from 'onedata-gui-common/utils/form-component/clone-value';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';
import {
  AtmLambdaConfigEditor,
  rawValueToAtmLambdaConfigEditorValue,
  atmLambdaConfigEditorValueToRawValue,
  migrateAtmLambdaConfigEditorValueToNewSpecs,
} from 'onedata-gui-common/utils/atm-workflow/atm-task';

const createStoreDropdownOptionValue = '__createStore';
const leaveUnassignedDropdownOptionValue = '__leaveUnassigned';
const taskAuditLogDropdownOptionValue = '__taskAuditLog';
const workflowAuditLogDropdownOptionValue = '__workflowAuditLog';
const taskTimeSeriesDropdownOptionValue = '__taskTimeSeries';

const backendStoreIdsMappings = {
  [taskAuditLogDropdownOptionValue]: 'CURRENT_TASK_SYSTEM_AUDIT_LOG',
  [workflowAuditLogDropdownOptionValue]: 'WORKFLOW_SYSTEM_AUDIT_LOG',
  [taskTimeSeriesDropdownOptionValue]: 'CURRENT_TASK_TIME_SERIES',
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
   * @type {Utils.WorkflowVisualiser.Store|null}
   */
  timeSeriesStore: computed(function timeSeriesStore() {
    return Store.create({
      id: taskTimeSeriesDropdownOptionValue,
      type: 'timeSeries',
      config: {
        timeSeriesCollectionSchema: {
          timeSeriesSchemas: [],
        },
        dashboardSpec: null,
      },
    });
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Array<Object>}
   */
  argumentStores: reads('definedStores'),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  resultStores: computed(
    'definedStores.[]',
    'timeSeriesStore',
    function resultStores() {
      const {
        definedStores,
        timeSeriesStore,
      } = this.getProperties('definedStores', 'timeSeriesStore');

      const systemStores = [
        taskAuditLogStore,
        workflowAuditLogStore,
        timeSeriesStore,
      ];

      return [
        ...systemStores,
        ...(definedStores || []).toArray().compact(),
      ];
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isTimeSeriesStoreEnabled: reads(
    'fields.valuesSource.timeSeriesStoreSection.createTimeSeriesStore'
  ),

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
    'task.{name,argumentMappings,resultMappings,timeSeriesStoreConfig,resourceSpecOverride}',
    'atmLambda',
    'atmLambdaRevisionNumber',
    function passedStoreFormValues() {
      return taskToFormData(this.task, this.atmLambda, this.atmLambdaRevisionNumber);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not('component.isDisabled'),
      onValueChange(value, field) {
        this._super(...arguments);
        const component = this.get('component');

        // If something in time series store section is modified, refresh
        // calculated time series store definition.
        if (get(field, 'path').startsWith('timeSeriesStoreSection.')) {
          component.updateTimeSeriesStoreSchema();
        }

        scheduleOnce('afterRender', component, 'notifyAboutChange');
      },
    }).create({
      component: this,
      fields: [
        this.atmLambdaFieldsGroup,
        this.detailsFieldsGroup,
        this.lambdaConfigFields,
        this.argumentMappingsFieldsCollectionGroup,
        this.resultMappingsFieldsCollectionGroup,
        this.timeSeriesStoreSectionFields,
        this.resourcesFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  atmLambdaFieldsGroup: computed(function atmLambdaFieldsGroup() {
    const component = this;
    return FormFieldsGroup.create({
      name: 'atmLambda',
      classes: 'task-form-section',
      addColonToLabel: false,
      fields: [
        StaticTextField.create({
          name: 'atmLambdaName',
        }),
        DropdownField.extend({
          options: computed(
            'component.atmLambda.revisionRegistry',
            function options() {
              const atmLambda = this.component.atmLambda;
              const revisionNumbers = sortRevisionNumbers(
                Object.keys(atmLambda?.revisionRegistry || {})
              );
              return revisionNumbers
                .map((num) => ({ label: String(num), value: num }))
                .reverse();
            }
          ),
          onValueChange(value) {
            const currentRevisionNumber = this.value;
            this._super(...arguments);

            component.changeAtmLambdaRevisionNumber(
              currentRevisionNumber,
              value
            );
          },
        }).create({
          component,
          name: 'atmLambdaRevisionNumber',
        }),
        StaticTextField.extend({
          value: computed(
            'valuesSource.atmLambda.atmLambdaRevisionNumber',
            function value() {
              const atmLambda = component.atmLambda;
              const atmLambdaRevisionNumber =
                this.valuesSource?.atmLambda?.atmLambdaRevisionNumber;
              const atmLambdaRevision =
                atmLambda?.revisionRegistry?.[atmLambdaRevisionNumber];
              return atmLambdaRevision?.summary;
            }
          ),
          isVisible: reads('value'),
        }).create({
          name: 'atmLambdaSummary',
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  detailsFieldsGroup: computed(function detailsFieldsGroup() {
    return FormFieldsGroup.create({
      classes: 'task-form-section',
      addColonToLabel: false,
      name: 'details',
      fields: [
        ClipboardField.extend({
          isVisible: notEmpty('value'),
        }).create({ name: 'schemaId' }),
        TextField.create({ name: 'name' }),
      ],
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
                  'parent.value.context.{dataSpec,isOptional}',
                  function options() {
                    const dataSpec = this.get('parent.value.context.dataSpec');
                    const isOptional =
                      this.get('parent.value.context.isOptional');
                    const opts = getValueBuilderTypesForDataSpec(dataSpec)
                      .map(vbType => ({ value: vbType }));
                    if (isOptional) {
                      opts.unshift({ value: leaveUnassignedDropdownOptionValue });
                    }
                    return opts;
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
                    if (!this.options.find(({ value }) => value === this.value)) {
                      this.valueChanged(this.options[0]?.value);
                    }
                  });
                },
              }).create({
                classes: 'floating-field-label',
                name: 'valueBuilderType',
              }),
              AtmValueEditorField.extend({
                isVisible: eq('parent.value.valueBuilderType', raw('const')),
                atmDataSpec: reads('parent.value.context.dataSpec'),
              }).create({
                classes: 'floating-field-label',
                name: 'valueBuilderConstValue',
              }),
              DropdownField.extend({
                isVisible: eq(
                  'parent.value.valueBuilderType',
                  raw('singleValueStoreContent')
                ),
                options: computed(
                  'component.argumentStores.@each.{type,config,name}',
                  'parent.value.context.dataSpec',
                  function options() {
                    const dataSpec = this.get('parent.value.context.dataSpec');
                    const argumentStores = this.get('component.argumentStores') || [];
                    const possibleStores =
                      getSourceStoreForDataSpec(argumentStores, dataSpec);
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
                optionsObserver: observer('options.[]', function optionsObserver() {
                  scheduleOnce('afterRender', this, 'adjustValueForNewOptions');
                }),
                init() {
                  this._super(...arguments);
                  this.optionsObserver();
                },
                valueChanged(value) {
                  if (value === createStoreDropdownOptionValue) {
                    const dataSpec = this.get('parent.value.context.dataSpec');
                    component.createSourceStore(this, dataSpec);
                  } else {
                    return this._super(...arguments);
                  }
                },
                adjustValueForNewOptions() {
                  safeExec(this, () => {
                    if (!this.options.find(({ value }) => value === this.value)) {
                      this.valueChanged(undefined);
                    }
                  });
                },
              }).create({
                component,
                classes: 'floating-field-label',
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
        classes: 'task-form-section',
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
            classes: computed(
              'value.singleResultMappings.__fieldsValueNames.length',
              function classes() {
                return this.value.singleResultMappings?.__fieldsValueNames?.length ?
                  'has-mappings' : '';
              }
            ),
          }).create({
            fields: [
              HiddenField.create({ name: 'context' }),
              SingleResultMappingsCollectionGroup.extend({
                context: reads('parent.value.context'),
                component,
              }).create(),
            ],
            name: 'singleResult',
            valueName: uniqueFieldValueName,
          });
        },
        dumpDefaultValue() {
          const defaultValue = this.get('defaultValue');
          return defaultValue ?
            cloneAsEmberObject(defaultValue) : this._super(...arguments);
        },
      }).create({
        classes: 'task-form-section',
        name: 'resultMappings',
        addColonToLabel: false,
        isCollectionManipulationAllowed: false,
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  lambdaConfigFields: computed(function lambdaConfigFields() {
    return AtmLambdaConfigEditor.extend({
      isVisible: notEmpty('value.__fieldsValueNames'),
    }).create({
      classes: 'task-form-section',
      name: 'lambdaConfigSection',
      addColonToLabel: false,
      label: this.t('fields.lambdaConfigSection.label'),
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  timeSeriesStoreSectionFields: computed(function timeSeriesStoreSectionFields() {
    return FormFieldsGroup.create({
      classes: 'task-form-section',
      name: 'timeSeriesStoreSection',
      addColonToLabel: false,
      fields: [
        ToggleField.create({
          name: 'createTimeSeriesStore',
        }),
        storeConfigEditors.timeSeries.FormElement.extend({
          isExpanded: reads('parent.value.createTimeSeriesStore'),
        }).create({
          name: 'timeSeriesStoreConfig',
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  resourcesFieldsGroup: computed(function resourcesFieldsGroup() {
    return FormFieldsGroup.create({
      classes: 'task-form-section',
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
              const overrideResources =
                this.get('valuesSource.resources.overrideResources');
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
    'atmLambda',
    'atmLambdaRevisionNumber',
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
    this.updateTimeSeriesStoreSchema();
  },

  notifyAboutChange() {
    const {
      onChange,
      fields,
      mode,
    } = this.getProperties(
      'onChange',
      'fields',
      'mode',
    );

    if (mode === 'view') {
      return;
    }

    onChange && onChange({
      data: this.dumpToTask(),
      isValid: get(fields, 'isValid'),
    });
  },

  dumpToTask() {
    return formDataToTask(
      this.fields.dumpValue(),
      this.atmLambda,
      this.allStores
    );
  },

  updateTimeSeriesStoreSchema() {
    const timeSeriesStoreSectionField =
      this.get('fields').getFieldByPath('timeSeriesStoreSection.timeSeriesStoreConfig');
    if (!get(timeSeriesStoreSectionField, 'isValid')) {
      return;
    }

    const taskData = this.dumpToTask();
    const newConfig = get(taskData, 'timeSeriesStoreConfig') || {
      timeSeriesCollectionSchema: {
        timeSeriesSchemas: [],
      },
      dashboardSpec: null,
    };
    this.set('timeSeriesStore.config', newConfig);
  },

  async createSourceStore(sourceStoreField, dataSpec) {
    const actionsFactory = this.get('actionsFactory');
    if (!actionsFactory || !sourceStoreField) {
      return;
    }

    await this.createStoreForDropdown({
      dropdownField: sourceStoreField,
      allowedStoreTypes: ['singleValue'],
      allowedStoreReadDataSpec: dataSpec,
    });
  },

  async createTargetStore(targetStoreField, dataSpec) {
    const actionsFactory = this.get('actionsFactory');
    if (!actionsFactory || !targetStoreField) {
      return;
    }

    await this.createStoreForDropdown({
      dropdownField: targetStoreField,
      allowedStoreWriteDataSpec: dataSpec,
    });
  },

  async createStoreForDropdown({
    dropdownField,
    allowedStoreTypes,
    allowedStoreReadDataSpec,
    allowedStoreWriteDataSpec,
  }) {
    const actionResult = await this.get('actionsFactory').createCreateStoreAction({
      allowedStoreTypes,
      allowedStoreReadDataSpec,
      allowedStoreWriteDataSpec,
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

  /**
   * @param {RevisionNumber} currentRevisionNumber
   * @param {RevisionNumber} newRevisionNumber
   * @returns {void}
   */
  changeAtmLambdaRevisionNumber(currentRevisionNumber, newRevisionNumber) {
    const currentRevValues = this.fields.valuesSource;
    const newRevPlainValues =
      taskToFormData(this.task, this.atmLambda, newRevisionNumber);

    const currentRevision = this.atmLambda?.revisionRegistry?.[currentRevisionNumber];
    const newRevision = this.atmLambda?.revisionRegistry?.[newRevisionNumber];
    const propsToUpdateInCurrentRevision = {};

    const newArgumentMappings = migrateArgResRevision(
      currentRevision?.argumentSpecs ?? [],
      currentRevValues.argumentMappings,
      newRevision?.argumentSpecs ?? [],
      newRevPlainValues.argumentMappings
    );
    propsToUpdateInCurrentRevision.argumentMappings = newArgumentMappings;

    const newResultMappings = migrateArgResRevision(
      currentRevision?.resultSpecs ?? [],
      currentRevValues.resultMappings,
      newRevision?.resultSpecs ?? [],
      newRevPlainValues.resultMappings
    );
    propsToUpdateInCurrentRevision.resultMappings = newResultMappings;

    propsToUpdateInCurrentRevision.lambdaConfigSection =
      migrateAtmLambdaConfigEditorValueToNewSpecs(
        currentRevValues.lambdaConfigSection,
        newRevision.configParameterSpecs
      );

    if (!currentRevValues.resources.overrideResources) {
      set(
        currentRevValues.resources,
        'resourcesSections',
        newRevPlainValues.resources.resourcesSections
      );
    }

    setProperties(currentRevValues, propsToUpdateInCurrentRevision);
  },

  actions: {
    formNativeSubmit(event) {
      event.preventDefault();
    },
  },
});

function taskToFormData(task, atmLambda, atmLambdaRevisionNumber) {
  const {
    schemaId,
    name,
    argumentMappings,
    resultMappings,
    resourceSpecOverride,
    timeSeriesStoreConfig,
  } = getProperties(
    task || {},
    'schemaId',
    'name',
    'argumentMappings',
    'resultMappings',
    'resourceSpecOverride',
    'timeSeriesStoreConfig'
  );

  const atmLambdaRevision =
    atmLambda?.revisionRegistry?.[atmLambdaRevisionNumber] ?? {};
  const {
    name: atmLambdaName,
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

  const atmLambdaSection = createValuesContainer({
    atmLambdaName: atmLambdaName,
    atmLambdaRevisionNumber: atmLambdaRevisionNumber,
  });
  const detailsSection = createValuesContainer({
    schemaId,
    name: name || atmLambdaName,
  });

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
    let valueBuilderType = get(existingMapping || {}, 'valueBuilder.valueBuilderType');
    if (!valueBuilderType) {
      const hasDefaultValue = defaultValue !== undefined && defaultValue !== null;
      valueBuilderType = (isOptional || hasDefaultValue || existingMapping) ?
        leaveUnassignedDropdownOptionValue :
        getValueBuilderTypesForDataSpec(dataSpec)[0];
    }
    const valueBuilderRecipe =
      get(existingMapping || {}, 'valueBuilder.valueBuilderRecipe');
    const valueBuilderConstValue = atmRawValueToFormValue(
      valueBuilderType === 'const' ? valueBuilderRecipe : null
    );
    const valueBuilderStore = valueBuilderType === 'singleValueStoreContent' ?
      valueBuilderRecipe : undefined;
    formArgumentMappings[valueName] = createValuesContainer({
      context: {
        name,
        dataSpec,
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
  (resultSpecs || []).forEach((resultSpec, resultSpecIdx) => {
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

    const formSingleResultMappings = {
      __fieldsValueNames: [],
    };

    const existingMappings = resultMappings
      ?.filter((mapping) => mapping?.resultName === name && mapping?.storeSchemaId);
    existingMappings?.forEach((mapping, mappingIdx) => {
      const storeSchemaId = mapping.storeSchemaId;
      const dispatchFunction = mapping.storeContentUpdateOptions?.function;
      const valueName = `singleResultMapping${mappingIdx}`;
      formSingleResultMappings.__fieldsValueNames.push(valueName);

      const timeSeriesEditor = storeContentUpdateOptionsEditors.timeSeries
        .storeContentUpdateOptionsToFormValues(mapping?.storeContentUpdateOptions);
      formSingleResultMappings[valueName] = createValuesContainer({
        targetStore: frontendStoreIdsMappings[storeSchemaId] ?? storeSchemaId,
        dispatchFunction,
        timeSeriesEditor,
      });
    });

    const valueName = `singleResultMappings${resultSpecIdx}`;
    formResultMappings.__fieldsValueNames.push(valueName);

    formResultMappings[valueName] = createValuesContainer({
      context: {
        name,
        dataSpec,
      },
      singleResultMappings: formSingleResultMappings,
    });
  });

  const timeSeriesStoreSection = {
    createTimeSeriesStore: Boolean(timeSeriesStoreConfig),
    timeSeriesStoreConfig: storeConfigEditors.timeSeries.storeConfigToFormValues(
      timeSeriesStoreConfig
    ),
  };

  return {
    atmLambda: atmLambdaSection,
    details: detailsSection,
    argumentMappings: createValuesContainer(formArgumentMappings),
    resultMappings: createValuesContainer(formResultMappings),
    lambdaConfigSection: rawValueToAtmLambdaConfigEditorValue(
      task?.lambdaConfig,
      atmLambdaRevision?.configParameterSpecs
    ),
    timeSeriesStoreSection,
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

function formDataToTask(formData, atmLambda, stores) {
  const {
    atmLambda: formAtmLambda,
    details,
    argumentMappings,
    resultMappings,
    timeSeriesStoreSection,
    resources,
  } = getProperties(
    formData,
    'atmLambda',
    'details',
    'argumentMappings',
    'resultMappings',
    'timeSeriesStoreSection',
    'resources'
  );
  const atmLambdaId = atmLambda?.entityId;
  const atmLambdaRevisionNumber = formAtmLambda.atmLambdaRevisionNumber;
  const atmLambdaRevision = atmLambda?.revisionRegistry?.[atmLambdaRevisionNumber];
  const {
    argumentSpecs,
    resultSpecs,
  } = getProperties(atmLambdaRevision || {}, 'argumentSpecs', 'resultSpecs');
  const {
    overrideResources,
    resourcesSections,
  } = getProperties(resources || {}, 'overrideResources', 'resourcesSections');

  const task = {
    lambdaId: atmLambdaId,
    lambdaRevisionNumber: atmLambdaRevisionNumber,
    lambdaConfig: atmLambdaConfigEditorValueToRawValue(formData?.lambdaConfigSection),
    name: details.name,
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
      valueBuilder.valueBuilderRecipe = atmFormValueToRawValue(valueBuilderConstValue);
    } else if (valueBuilderType === 'singleValueStoreContent') {
      valueBuilder.valueBuilderRecipe = valueBuilderStore;
    }

    task.argumentMappings.push({
      argumentName,
      valueBuilder,
    });
  });

  resultMappings?.__fieldsValueNames.forEach((singleResultKey, idx) => {
    const lambdaResultSpec = resultSpecs && resultSpecs[idx] || {};
    const resultName = get(lambdaResultSpec, 'name');
    const singleResultMappings = resultMappings[singleResultKey]?.singleResultMappings;

    singleResultMappings?.__fieldsValueNames
      .map((singleMappingKey) => singleResultMappings[singleMappingKey])
      .forEach((mapping) => {
        const {
          targetStore: targetStoreId,
          dispatchFunction,
          timeSeriesEditor,
        } = mapping;

        if (!targetStoreId) {
          return;
        }

        const targetStore = stores.findBy('id', targetStoreId);
        const targetStoreType = targetStore && get(targetStore, 'type');
        const possibleDispatchFunctions =
          getDispatchFunctionsForStoreType(targetStoreType);

        if (!targetStoreType) {
          return;
        }

        const storeContentUpdateOptions = {
          type: getStoreContentUpdateOptionsType(targetStoreType),
        };
        if (targetStoreType === 'timeSeries') {
          Object.assign(
            storeContentUpdateOptions,
            storeContentUpdateOptionsEditors.timeSeries
            .formValuesToStoreContentUpdateOptions(
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
  });

  const {
    createTimeSeriesStore,
    timeSeriesStoreConfig,
  } = getProperties(
    timeSeriesStoreSection,
    'createTimeSeriesStore',
    'timeSeriesStoreConfig'
  );

  if (createTimeSeriesStore) {
    task.timeSeriesStoreConfig = storeConfigEditors.timeSeries.formValuesToStoreConfig(
      timeSeriesStoreConfig
    );
  } else {
    task.timeSeriesStoreConfig = null;
  }

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

function getValueBuilderTypesForDataSpec(dataSpec) {
  return !dataSpec?.type ? [] : [
    'iteratedItem',
    'singleValueStoreContent',
    'const',
  ];
}

function getSourceStoreForDataSpec(availableStores, dataSpec) {
  return availableStores.filter((store) => {
    const storeType = store && get(store, 'type');
    return storeType === 'singleValue' && doesDataSpecFitToStoreRead(dataSpec, store);
  });
}

function getTargetStoresForDataSpec(availableStores, dataSpec) {
  return availableStores.filter((store) => {
    return doesDataSpecFitToStoreWrite(dataSpec, store);
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

/**
 * Copies arguments/results values from `currentValues` (compatible with specs
 * from `fromSpecs`) into `newValues` (compatible with specs `toSpecs`). This operation
 * takes place when user changes revision of lambda and existing argument/result
 * setup has to be migrated into next revision's format with the smallest
 * possible data loss.
 * @param {Array<AtmLambdaArgumentSpec>|Array<AtmLambdaResultSpec>} fromSpecs
 * @param {Utils.FormComponent.ValuesContainer} currentValues values of arguments/results
 * (compatible with `fromSpecs`)
 * @param {Array<AtmLambdaArgumentSpec>|Array<AtmLambdaResultSpec>} toSpecs
 * @param {Utils.FormComponent.ValuesContainer} newValues values of arguments/results
 * (compatible with `toSpecs`)
 * @returns {Utils.FormComponent.ValuesContainer} reference to `newValues`
 */
function migrateArgResRevision(fromSpecs, currentValues, toSpecs, newValues) {
  const namesMapping = findArgResRevisionMigrationMapping(
    fromSpecs,
    toSpecs
  );

  for (const toFieldName of newValues.__fieldsValueNames) {
    const toName = newValues[toFieldName].context.name;
    const fromName = namesMapping[toName];
    if (!fromName) {
      continue;
    }
    for (const fromFieldName of currentValues.__fieldsValueNames) {
      if (currentValues[fromFieldName].context.name === fromName) {
        const newContext = newValues[toFieldName].context;
        set(
          newValues,
          toFieldName,
          cloneValue(currentValues[fromFieldName])
        );
        set(newValues[toFieldName], 'context', newContext);
        break;
      }
    }
  }
  return newValues;
}

/**
 * Tries to find the best data migration mapping from `fromSpecs` arguments/results
 * format to `toSpecs` arguments/results format. Such mapping can be later used
 * to migrate form values from one revision to another.
 * @param {Array<AtmLambdaArgumentSpec>|Array<AtmLambdaResultSpec>} fromSpecs
 * @param {Array<AtmLambdaArgumentSpec>|Array<AtmLambdaResultSpec>} toSpecs
 * @returns {Object<string, string|null>} keys are names from `toSpecs`, values are
 * names from `fromSpecs` or null if there is no clear migration to that specific
 * "to" spec.
 */
function findArgResRevisionMigrationMapping(fromSpecs, toSpecs) {
  const fromSpecsAsMap = _.keyBy(fromSpecs, 'name');
  const toSpecsAsMap = _.keyBy(toSpecs, 'name');
  const mapping = {};
  for (const toSpecName in toSpecsAsMap) {
    if (toSpecName in fromSpecsAsMap) {
      mapping[toSpecName] = toSpecName;
      delete toSpecsAsMap[toSpecName];
      delete fromSpecsAsMap[toSpecName];
    }
  }

  for (const toSpecName in toSpecsAsMap) {
    const toDataSpec = toSpecsAsMap[toSpecName].dataSpec;
    for (const fromSpecName in fromSpecsAsMap) {
      const fromDataSpec = fromSpecsAsMap[fromSpecName].dataSpec;
      if (_.isEqual(toDataSpec, fromDataSpec)) {
        mapping[toSpecName] = fromSpecName;
        delete toSpecsAsMap[toSpecName];
        delete fromSpecsAsMap[fromSpecName];
      }
    }
  }
  for (const toSpecName in toSpecsAsMap) {
    mapping[toSpecName] = null;
    delete toSpecsAsMap[toSpecName];
  }
  return mapping;
}

const SingleResultMappingsCollectionGroup = FormFieldsCollectionGroup.extend({
  /**
   * @type {Components.WorkflowVisualiser.TaskForm}
   * @virtual
   */
  component: undefined,

  /**
   * @type {Object}
   * @virtual
   */
  context: undefined,

  label: reads('context.name'),

  addColonToLabel: not('component.media.isMobile'),

  fieldFactoryMethod(uniqueFieldValueName) {
    return FormFieldsGroup.extend({
      selectedTargetStore: computed(
        'value.targetStore',
        'parent.component.resultStores.@each.id',
        function selectedTargetStore() {
          const targetStoreId = this.get('value.targetStore');
          return (this.get('parent.component.resultStores') || [])
            .findBy('id', targetStoreId);
        }
      ),
    }).create({
      name: 'singleResultMapping',
      valueName: uniqueFieldValueName,
      fields: [
        DropdownField.extend({
          options: computed(
            'parent.parent.{context.dataSpec,component.resultStores.@each.name,component.resultStores.@each.config}',
            function options() {
              const resultStores = this.get('parent.parent.component.resultStores') || [];
              const dataSpec = this.get('parent.parent.context.dataSpec');
              const opts =
                getTargetStoresForDataSpec(resultStores, dataSpec)
                .map(store => ({
                  value: get(store, 'id'),
                  label: get(store, 'name'),
                }))
                .sortBy('label');
              opts.unshift({
                value: createStoreDropdownOptionValue,
              });
              return opts;
            }
          ),
          optionsObserver: observer('options.[]', function optionsObserver() {
            scheduleOnce('afterRender', this, 'adjustValueForNewOptions');
          }),
          init() {
            this._super(...arguments);
            this.optionsObserver();
          },
          valueChanged(value) {
            if (value === createStoreDropdownOptionValue) {
              const dataSpec = this.get('parent.parent.context.dataSpec');
              this.parent?.parent?.component.createTargetStore(this, dataSpec);
            } else {
              return this._super(...arguments);
            }
          },
          adjustValueForNewOptions() {
            safeExec(this, () => {
              if (!this.options.find(({ value }) => value === this.value)) {
                this.valueChanged(null);
              }
            });
          },
        }).create({
          classes: 'floating-field-label',
          name: 'targetStore',
          customValidators: [
            validator(function (value, options, model) {
              const field = get(model, 'field');
              const notEnabledTsStoreSelected =
                value === taskTimeSeriesDropdownOptionValue &&
                !get(field, 'parent.parent.component.isTimeSeriesStoreEnabled');
              return notEnabledTsStoreSelected ?
                String(field.getTranslation('errors.notEnabledTsStoreSelected')) :
                true;
            }, {
              dependentKeys: [
                'model.field.parent.parent.component.isTimeSeriesStoreEnabled',
              ],
            }),
          ],
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
          classes: 'floating-field-label',
          name: 'dispatchFunction',
        }),
        storeContentUpdateOptionsEditors.timeSeries.FormElement.extend({
          contentUpdateDataSpec: reads('parent.parent.context.dataSpec'),
          storeConfig: reads('parent.selectedTargetStore.config'),
          isVisible: computed('parent.selectedTargetStore',
            function isVisible() {
              const selectedTargetStore = this.get(
                'parent.selectedTargetStore');
              return selectedTargetStore &&
                get(selectedTargetStore, 'type') === 'timeSeries';
            }),
          init() {
            this._super(...arguments);
            this.set('classes', `${this.get('classes')} floating-field-label`);
          },
        }).create({
          name: 'timeSeriesEditor',
        }),
      ],
    });
  },
  name: 'singleResultMappings',
});
