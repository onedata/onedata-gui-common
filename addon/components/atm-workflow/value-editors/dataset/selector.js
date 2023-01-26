/**
 * A dataset selector component. Allows to trigger selecting datasets from some
 * external source (taken from `editorContext`) or providing dataset ID.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { Promise } from 'rsvp';
import Action from 'onedata-gui-common/utils/action';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/dataset/selector';

export default Component.extend({
  layout,
  tagName: 'a',
  classNames: ['dataset-value-editor-selector', 'action-link'],
  classNameBindings: ['isDisabled:disabled:clickable'],

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  atmDataSpec: undefined,

  /**
   * @virtual
   * @type {AtmValueEditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual
   * @type {(datasets: Array<AtmDatasets>) => void}
   */
  onDatasetsSelected: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onIdProvidingStarted: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowManyDatasets: false,

  /**
   * @type {boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  selectDatasetsAction: computed(
    'allowManyFiles',
    'editorContext.selectDatasets',
    function selectDatasetsAction() {
      const action = SelectDatasetsAction.create({
        ownerSource: this,
        allowManyDatasets: this.allowManyDatasets,
        selectDatasetsFunction: this.editorContext?.selectDatasets,
      });
      action.addExecuteHook((result) => {
        const selectedDatasets = result.result;
        if (selectedDatasets?.length) {
          this.onDatasetsSelected(selectedDatasets);
        }
      });
      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  provideDatasetIdAction: computed(
    'onIdProvidingStarted',
    function provideDatasetIdAction() {
      const action = ProvideDatasetIdAction.create({ ownerSource: this });
      action.addExecuteHook(() => {
        this.onIdProvidingStarted();
      });
      return action;
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  actionsArray: collect('selectDatasetsAction', 'provideDatasetIdAction'),

  isDisabledObserver: observer('isDisabled', function isDisabledObserver() {
    if (this.areActionsOpened) {
      this.set('areActionsOpened', false);
    }
  }),

  /**
   * @override
   */
  click() {
    this._super(...arguments);
    if (this.isDisabled) {
      return;
    }
    this.toggleProperty('areActionsOpened');
  },

  actions: {
    toggleActionsOpen(state) {
      if (this.isDisabled) {
        return;
      }
      this.set('areActionsOpened', state);
    },
  },
});

const SelectDatasetsAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.dataset.selector.actions.selectDatasets',

  /**
   * @virtual
   * @type {{ allowManyDatasets: boolean, selectDatasetsFunction?: (selectorConfig: DatasetsSelectorConfig) => void }}
   */
  context: undefined,

  /**
   * @override
   */
  className: 'select-datasets-action-trigger',

  /**
   * @type {boolean}
   */
  isPending: false,

  /**
   * @override
   */
  title: computed('allowManyDatasets', function title() {
    return this.t(`title.${this.allowManyDatasets ? 'multi' : 'single'}`);
  }),

  /**
   * @override
   */
  disabled: computed('selectDatasetsFunction', 'isPending', function disabled() {
    return !this.selectDatasetsFunction || this.isPending;
  }),

  /**
   * @override
   */
  tip: computed('selectDatasetsFunction', function tip() {
    if (!this.selectDatasetsFunction) {
      return this.t('disabledTip');
    }
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  allowManyDatasets: reads('context.allowManyDatasets'),

  /**
   * @type {((selectorConfig: DatsetsSelectorConfig) => void) | undefined}
   */
  selectDatasetsFunction: reads('context.selectDatasetsFunction'),

  /**
   * @override
   */
  async onExecute() {
    if (!this.selectDatasetsFunction) {
      return [];
    }

    try {
      this.set('isPending', true);
      return await new Promise((resolve) => {
        this.selectDatasetsFunction({
          allowMany: this.allowManyDatasets,
          onSelected: (datasets) => resolve(datasets),
          onCancelled: () => resolve([]),
        });
      });
    } finally {
      this.set('isPending', false);
    }
  },
});

const ProvideDatasetIdAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.dataset.selector.actions.provideDatasetId',

  /**
   * @override
   */
  className: 'provide-dataset-id-action-trigger',

  /**
   * @override
   */
  onExecute() {},
});
