/**
 * An editor box layout common for all value editors.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/commons/editor-box';
import { translateAtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

export default Component.extend({
  layout,
  classNames: ['editor-box'],
  classNameBindings: ['atmDataTypeClassName'],
  attributeBindings: ['editorState.id:data-editor-id'],

  i18n: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null}
   */
  editorState: null,

  /**
   * @virtual optional
   * @type {() => void | null}
   */
  onRemove: null,

  /**
   * @virtual optional
   * @type {string | null}
   */
  removeConfirmationQuestion: null,

  /**
   * @type {boolean}
   */
  isRemoveConfirmationOpened: false,

  /**
   * @type {ComputedProperty<string>}
   */
  atmDataTypeClassName: computed(
    'editorState.atmDataSpec.type',
    function atmDataTypeClassName() {
      const type = this.editorState?.atmDataSpec?.type;
      return type ? `${dasherize(type)}-editor` : '';
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  translatedAtmDataSpecType: computed(
    'editorState.atmDataSpec.type',
    function translatedAtmDataSpecType() {
      return translateAtmDataSpecType(this.i18n, this.editorState?.atmDataSpec?.type);
    }
  ),

  actions: {
    remove() {
      if (this.isRemoveConfirmationOpened) {
        this.set('isRemoveConfirmationOpened', false);
      } else if (this.removeConfirmationQuestion) {
        this.set('isRemoveConfirmationOpened', true);
      } else {
        this.onRemove?.();
      }
    },
    confirmRemove() {
      this.set('isRemoveConfirmationOpened', false);
      this.onRemove?.();
    },
    closeRemoveConfirmation() {
      this.set('isRemoveConfirmationOpened', false);
    },
  },
});
