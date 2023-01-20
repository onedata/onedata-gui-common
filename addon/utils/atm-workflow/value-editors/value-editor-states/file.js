import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

/**
 * @typedef {'empty'|'idForm'|'selected'} FileValueEditorStateMode
 */

export default class FileValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/file/editor`;
    if (!this.value) {
      this.value = {
        file_id: '',
      };
    }

    /**
     * @private
     * @type {FileValueEditorStateMode}
     */
    this.internalMode = this.value?.file_id ? 'selected' : 'empty';

    /**
     * @private
     * @type {AtmFile}
     */
    this.internalIdFormFile = this.value;
  }

  /**
   * @public
   * @returns {FileValueEditorStateMode}
   */
  get mode() {
    return this.internalMode;
  }

  /**
   * @public
   * @returns {AtmFile}
   */
  get idFormFile() {
    return this.internalIdFormFile;
  }

  /**
   * @public
   * @param {AtmFile} newValue
   */
  set idFormFile(newValue) {
    this.internalIdFormFile = newValue;
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

    this.changeMode(this.value?.file_id ? 'selected' : 'empty');
  }

  /**
   * @private
   * @returns {void}
   */
  useIdFormValueAsValue() {
    this.value = this.idFormFile;
  }

  /**
   * @private
   * @returns {void}
   */
  useValueAsIdFormValue() {
    this.idFormFile = this.value;
  }

  /**
   * @private
   * @param {FileValueEditorStateMode} newMode
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
    if (this.mode === 'empty' && newValue?.file_id) {
      this.changeMode('selected');
    }
  }

  /**
   * @override
   */
  getIsValid() {
    switch (this.mode) {
      case 'idForm':
        return validate(this.idFormFile, this.atmDataSpec);
      case 'selected':
        return super.getIsValid();
      case 'empty':
      default:
        return false;
    }
  }
}
