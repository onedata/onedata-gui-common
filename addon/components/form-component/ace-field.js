/**
 * A component responsible for rendering ACE editor field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/ace-field';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';

export default FieldComponentBase.extend({
  layout,
  classNames: ['ace-field'],

  /**
   * @type {ComputedProperty<AceFieldLang>}
   */
  lang: reads('field.lang'),

  /**
   * @type {ComputedProperty<string>}
   */
  aceMode: tag `ace/mode/${'lang'}`,

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.notifyEditorValidationState(false);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @param {boolean} hasErrors
   * @returns {void}
   */
  notifyEditorValidationState(hasErrors) {
    this.field.changeEditorValidationState(this.elementId, hasErrors);
  },

  actions: {
    editorReady(editor) {
      editor.addEventListener('blur', () => this.field.focusLost());
      editor.getSession().addEventListener('changeAnnotation', () => {
        const annotations = editor.getSession().getAnnotations();
        const errorAnnotations = annotations.filter(({ type }) => type === 'error');
        this.notifyEditorValidationState(errorAnnotations.length > 0);
      });
    },
  },
});
