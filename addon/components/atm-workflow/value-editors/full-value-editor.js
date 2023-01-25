import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/full-value-editor';

export default Component.extend({
  classNames: ['full-value-editor'],
  layout,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager}
   */
  stateManager: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null>}
   */
  rootValueEditorState: computed('stateManager', function rootValueEditorState() {
    return this.stateManager?.rootValueEditorState ?? null;
  }),
});
