/**
 * Group value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../common';

/**
 * @typedef {'empty'|'idForm'|'selected'} GroupValueEditorStateMode
 * - `'empty'` means no group selected,
 * - `'idForm'` means showing form with ID input which allows user to reference
 *   group,
 * - `'selected'` means that user has selected some group and now it's info is
 *   visible.
 */

export default class GroupValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/group/editor`;

    /**
     * @private
     * @type {GroupValueEditorStateMode}
     */
    this.internalMode = this.value?.groupId ? 'selected' : 'empty';

    /**
     * Group provided by user using ID form.
     * @private
     * @type {AtmGroup}
     */
    this.internalIdFormGroup = this.value;
  }

  /**
   * @public
   * @returns {GroupValueEditorStateMode}
   */
  get mode() {
    return this.internalMode;
  }

  /**
   * @public
   * @returns {AtmGroup}
   */
  get idFormGroup() {
    return this.internalIdFormGroup;
  }

  /**
   * @public
   * @param {AtmGroup} newValue
   */
  set idFormGroup(newValue) {
    this.internalIdFormGroup = newValue;
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

    this.changeMode(this.value?.groupId ? 'selected' : 'empty');
  }

  /**
   * @private
   * @returns {void}
   */
  useIdFormValueAsValue() {
    this.value = this.idFormGroup;
  }

  /**
   * @private
   * @returns {void}
   */
  useValueAsIdFormValue() {
    this.idFormGroup = this.value;
  }

  /**
   * @private
   * @param {GroupValueEditorStateMode} newMode
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
    if (this.mode === 'empty' && newValue?.groupId) {
      this.changeMode('selected');
    } else if (this.mode === 'selected' && !newValue?.groupId) {
      this.changeMode('empty');
    }
  }

  /**
   * @override
   */
  getIsValid() {
    switch (this.mode) {
      case 'idForm':
        return validate(this.idFormGroup, this.atmDataSpec);
      case 'selected':
        return super.getIsValid();
      case 'empty':
      default:
        return false;
    }
  }
}
