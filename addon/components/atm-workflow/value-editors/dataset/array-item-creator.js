/**
 * An array item creator dedicated for creating dataset items.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/dataset/array-item-creator';
import ArrayItemCreatorBase from '../commons/array-item-creator-base';

export default ArrayItemCreatorBase.extend(I18n, {
  layout,
  classNames: ['dataset-array-item-creator'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.dataset.arrayItemCreator',

  /**
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.Dataset | null}
   */
  idProvidingEditorState: null,

  /**
   * @type {() => void}
   */
  handleIdProvidingEditorChangeFunction: undefined,

  isDisabledObserver: observer('isDisabled', function isDisabledObserver() {
    if (this.idProvidingEditorState) {
      this.idProvidingEditorState.isDisabled = this.isDisabled;
    }
  }),

  init() {
    this._super(...arguments);
    this.set(
      'handleIdProvidingEditorChangeFunction',
      this.handleIdProvidingEditorChange.bind(this)
    );
  },

  /**
   * @returns {void}
   */
  handleIdProvidingEditorChange() {
    if (!this.idProvidingEditorState || !this.stateManager) {
      return;
    }

    switch (this.idProvidingEditorState.mode) {
      case 'selected': {
        const dataset = this.idProvidingEditorState.value;
        const newItemEditorState =
          this.stateManager.createValueEditorState(this.itemAtmDataSpec, dataset);
        this.onItemsCreated?.([newItemEditorState]);
        this.hideIdProvidingEditor();
        break;
      }
      case 'empty':
        this.hideIdProvidingEditor();
        break;
    }
  },

  /**
   * @returns {void}
   */
  showIdProvidingEditor() {
    if (this.idProvidingEditorState || !this.stateManager) {
      return;
    }

    const idProvidingEditorState =
      this.stateManager.createValueEditorState(this.itemAtmDataSpec);
    idProvidingEditorState.showIdForm();
    idProvidingEditorState.addChangeListener(this.handleIdProvidingEditorChangeFunction);
    this.set('idProvidingEditorState', idProvidingEditorState);
  },

  /**
   * @returns {void}
   */
  hideIdProvidingEditor() {
    if (!this.idProvidingEditorState || !this.stateManager) {
      return;
    }

    this.idProvidingEditorState
      .removeChangeListener(this.handleIdProvidingEditorChangeFunction);
    this.stateManager.destroyValueEditorStateById(this.idProvidingEditorState.id);
    this.set('idProvidingEditorState', null);
  },

  actions: {
    datasetsSelected(selectedDatasets) {
      if (!this.stateManager || !selectedDatasets.length) {
        return;
      }

      const newItemEditorStates = selectedDatasets.map((dataset) =>
        this.stateManager.createValueEditorState(this.itemAtmDataSpec, dataset)
      );
      this.onItemsCreated?.(newItemEditorStates);
    },
    idProvidingStarted() {
      this.showIdProvidingEditor();
    },
    idProvidingCancelled() {
      this.hideIdProvidingEditor();
    },
  },
});
