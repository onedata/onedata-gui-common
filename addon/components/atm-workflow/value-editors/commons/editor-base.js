import Component from '@ember/component';
import { observer, computed } from '@ember/object';

export default Component.extend({
  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager}
   */
  stateManager: undefined,

  /**
   * @virtual
   * @type {string}
   */
  editorId: undefined,

  /**
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null}
   */
  editorState: null,

  /**
   * @type {ComputedProperty<ValueEditorStateChangeListener>}
   */
  stateChangeListener: computed(function stateChangeListener() {
    return () => this.handleStateChange();
  }),

  editorStateSetter: observer(
    'stateManager',
    'editorId',
    function editorStateSetter() {
      const newEditorState =
        this.stateManager?.getValueEditorStateById(this.editorId) ?? null;
      if (this.editorState === newEditorState) {
        return;
      }

      if (this.editorState) {
        this.editorState.removeChangeListener(this.stateChangeListener);
      }

      if (newEditorState) {
        newEditorState.addChangeListener(this.stateChangeListener);
      }
      this.set('editorState', newEditorState);
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.editorStateSetter();
  },

  /**
   * @virtual
   * @returns {void}
   */
  handleStateChange() {},
});
