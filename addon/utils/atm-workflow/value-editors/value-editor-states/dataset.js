/**
 * Dataset value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../common';

/**
 * @typedef {'empty'|'idForm'|'selected'} DatasetValueEditorStateMode
 * - `'empty` means no dataset selected,
 * - `'idForm'` means showing form with ID input which allows user to reference
 *   dataset,
 * - `'selected'` means that user has selected some dataset and now it's info is
 *   visible.
 */

export default class DatasetValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/dataset/editor`;

    /**
     * @private
     * @type {DatasetValueEditorStateMode}
     */
    this.internalMode = this.value?.datasetId ? 'selected' : 'empty';

    /**
     * Dataset provided by user using ID form.
     * @private
     * @type {AtmDataset}
     */
    this.internalIdFormDataset = this.value;
  }

  /**
   * @public
   * @returns {DatasetValueEditorStateMode}
   */
  get mode() {
    return this.internalMode;
  }

  /**
   * @public
   * @returns {AtmDataset}
   */
  get idFormDataset() {
    return this.internalIdFormDataset;
  }

  /**
   * @public
   * @param {AtmDataset} newValue
   */
  set idFormDataset(newValue) {
    this.internalIdFormDataset = newValue;
    this.notifyChange();
  }

  /**
   * @public
   * @returns {void}
   */
  showIdForm() {
    if (this.mode === 'idForm') {
      return;
    }

    this.useValueAsIdFormValue();
    this.changeMode('idForm');
  }

  /**
   * @public
   * @returns {void}
   */
  acceptIdForm() {
    if (this.mode !== 'idForm') {
      return;
    }

    this.useIdFormValueAsValue();
    this.changeMode('selected');
  }

  /**
   * @public
   * @returns {void}
   */
  cancelIdForm() {
    if (this.mode !== 'idForm') {
      return;
    }

    this.changeMode(this.value?.datasetId ? 'selected' : 'empty');
  }

  /**
   * @private
   * @returns {void}
   */
  useIdFormValueAsValue() {
    this.value = this.idFormDataset;
  }

  /**
   * @private
   * @returns {void}
   */
  useValueAsIdFormValue() {
    this.idFormDataset = this.value;
  }

  /**
   * @private
   * @param {DatasetValueEditorStateMode} newMode
   * @returns {void}
   */
  changeMode(newMode) {
    if (this.internalMode === newMode) {
      return;
    }

    this.internalMode = newMode;
    this.notifyChange();
  }

  /**
   * @override
   */
  setValue(newValue) {
    super.setValue(newValue);
    if (this.mode === 'empty' && newValue?.datasetId) {
      this.changeMode('selected');
    } else if (this.mode === 'selected' && !newValue?.datasetId) {
      this.changeMode('empty');
    }
  }

  /**
   * @override
   */
  getIsValid() {
    switch (this.mode) {
      case 'idForm':
        return validate(this.idFormDataset, this.atmDataSpec);
      case 'selected':
        return super.getIsValid();
      case 'empty':
      default:
        return false;
    }
  }
}
