/**
 * An array item creator component base class.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['array-item-creator'],

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
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * @virtual
   * @type {(newItemEditors: Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>) => void}
   */
  onItemsCreated: undefined,

  /**
   * @type {ComputedProperty<AtmValueEditorContext>}
   */
  editorContext: reads('stateManager.editorContext'),
});
