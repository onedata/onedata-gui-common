/**
 * A form responsible for showing and editing/creating lanes. It does not persists
 * data. Any changes are yielded using `onChange` callback.
 *
 * @module components/modals/workflow-visualiser/lane-modal/lane-form
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../templates/components/modals/workflow-visualiser/lane-modal/lane-form';
import { tag, getBy, raw, conditional, eq, not, or } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { computed, observer, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';

const createStoreDropdownOptionValue = '__createStore';

export default Component.extend(I18n, {
  layout,
  classNames: ['lane-form'],
  classNameBindings: [
    'modeClass',
    'isDisabled:form-disabled:form-enabled',
  ],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.laneModal.laneForm',

  /**
   * One of: `'create'`, `'edit'`, `'view'`
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.Store>}
   */
  stores: undefined,

  /**
   * Needed when `mode` is `'create'` or `'edit'`
   * @virtual optional
   * @type {Utils.Action}
   */
  createStoreAction: undefined,

  /**
   * Needed when `mode` is `'edit'` or `'view'`
   * @virtual optional
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  lane: undefined,

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
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Object>}
   */
  passedFormValues: computed(
    'lane.{name,storeIteratorSpec}',
    function passedStoreFormValues() {
      return laneToFormData(this.get('lane'));
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      nameField,
      iteratorOptionsFieldsGroup,
    } = this.getProperties(
      'nameField',
      'iteratorOptionsFieldsGroup'
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
        iteratorOptionsFieldsGroup,
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
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  iteratorOptionsFieldsGroup: computed(function iteratorOptionsFieldsGroup() {
    const {
      sourceStoreField,
      strategyField,
      batchOptionsFieldsGroup,
    } = this.getProperties(
      'sourceStoreField',
      'strategyField',
      'batchOptionsFieldsGroup'
    );

    return FormFieldsGroup.create({
      name: 'iteratorOptions',
      addColonToLabel: false,
      fields: [
        sourceStoreField,
        strategyField,
        batchOptionsFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  sourceStoreField: computed(function sourceStoreField() {
    const component = this;
    return DropdownField
      // using options.1 becase options.firstObject is the "createStore" item
      .extend(defaultValueGenerator(this, 'options.1.value'), {
        options: computed('component.stores.@each.name', function options() {
          const storeOptions = (this.get('component.stores') || []).map(store => {
            const {
              id,
              name,
            } = getProperties(store, 'id', 'name');
            return {
              value: id,
              label: name,
            };
          }).sortBy('label');
          return [{
            value: createStoreDropdownOptionValue,
          }, ...storeOptions];
        }),
        valueChanged(value) {
          if (value === createStoreDropdownOptionValue) {
            component.createSourceStore();
          } else {
            return this._super(...arguments);
          }
        },
      })
      .create({
        component,
        name: 'sourceStore',
        showSearch: false,
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  strategyField: computed(function strategyField() {
    return DropdownField
      .extend(defaultValueGenerator(this, 'options.firstObject.value'))
      .create({
        component: this,
        name: 'strategy',
        showSearch: false,
        options: [{
          value: 'serial',
        }, {
          value: 'batch',
        }],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  batchOptionsFieldsGroup: computed(function batchOptionsFieldsGroup() {
    return FormFieldsGroup.extend({
      isExpanded: eq('valuesSource.iteratorOptions.strategy', raw('batch')),
      isVisible: or(eq('mode', raw('edit')), 'isExpanded'),
    }).create({
      name: 'batchOptions',
      fields: [
        this.get('batchSizeField'),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.NumberField>}
   */
  batchSizeField: computed(function batchSizeField() {
    return NumberField
      .extend(defaultValueGenerator(this, raw('100')))
      .create({
        name: 'batchSize',
        integer: true,
        gt: 0,
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
      data: formDataToLane(fields.dumpValue()),
      isValid: get(fields, 'isValid'),
    });
  },

  async createSourceStore() {
    const {
      sourceStoreField,
      createStoreAction,
    } = this.getProperties('sourceStoreField', 'createStoreAction');

    if (!createStoreAction) {
      return;
    }

    const actionResult = await createStoreAction.execute();
    const {
      status,
      result: newStore,
    } = getProperties(actionResult, 'status', 'result');

    if (status === 'done' && newStore) {
      sourceStoreField.valueChanged(get(newStore, 'id'));
    }
  },
});

/**
 * Generates mixin-like object, that specifies default value for field. Value in "view"
 * and "edit" mode is taken from component, in "create" mode is equal to passed
 * `createDefaultValue`. It's result should be passed to *Field.extend.
 * @param {Components.Modals.WorkflowVisualiser.LaneModal.LaneForm} component
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

function laneToFormData(lane) {
  const {
    name,
    storeIteratorSpec,
  } = getProperties(lane || {}, 'name', 'storeIteratorSpec');
  const {
    strategy,
    storeSchemaId,
  } = getProperties(storeIteratorSpec || {}, 'strategy', 'storeSchemaId');
  const {
    type,
    batchSize,
  } = getProperties(strategy || {}, 'type', 'batchSize');

  return {
    name,
    iteratorOptions: {
      sourceStore: storeSchemaId,
      strategy: type,
      batchOptions: type === 'batch' ? {
        batchSize,
      } : undefined,
    },
  };
}

function formDataToLane(formData) {
  const {
    name,
    iteratorOptions,
  } = getProperties(
    formData,
    'name',
    'iteratorOptions',
  );
  const {
    sourceStore,
    strategy,
    batchOptions,
  } = getProperties(
    iteratorOptions || {},
    'sourceStore',
    'strategy',
    'batchOptions',
  );
  const batchSize = get(batchOptions || {}, 'batchSize');

  const storeIteratorSpec = {
    strategy: {
      type: strategy,
    },
    storeSchemaId: sourceStore !== createStoreDropdownOptionValue ? sourceStore : null,
  };

  if (strategy === 'batch') {
    storeIteratorSpec.strategy.batchSize = Number.parseInt(batchSize) || undefined;
  }

  return {
    name,
    storeIteratorSpec,
  };
}
