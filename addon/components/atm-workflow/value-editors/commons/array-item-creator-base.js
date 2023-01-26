import Component from '@ember/component';
import { reads } from '@ember/object/computed';

export default Component.extend({
  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager}
   */
  stateManager: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  itemAtmDataSpec: undefined,

  /**
   * @virtual optional
   */
  isDisabled: false,

  /**
   * @virtual
   * @type {(newItemEditors: Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>) => void}
   */
  onItemsCreated: undefined,

  /**
   * @type {ComputedProperty<ValueEditorContext>}
   */
  editorContext: reads('stateManager.editorContext'),
});
