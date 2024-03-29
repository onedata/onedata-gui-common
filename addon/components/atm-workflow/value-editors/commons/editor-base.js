/**
 * An editor component base class.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, computed } from '@ember/object';

export default Component.extend({
  tagName: '',

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
   * @virtual optional
   * @type {() => void | null}
   */
  onRemove: null,

  /**
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null}
   */
  editorState: null,

  /**
   * @type {boolean}
   */
  isDisabled: false,

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
      if (newEditorState) {
        this.handleStateChange();
      }
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
   * @override
   */
  willDestroyElement() {
    try {
      this.editorState?.removeChangeListener(this.stateChangeListener);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {void}
   */
  handleStateChange() {
    if (this.editorState && this.isDisabled !== this.editorState.isDisabled) {
      this.set('isDisabled', this.editorState.isDisabled);
    }
  },
});
