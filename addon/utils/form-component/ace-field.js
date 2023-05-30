/**
 * An ACE editor form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { validator } from 'ember-cp-validations';
import FormField from 'onedata-gui-common/utils/form-component/form-field';

/**
 * @typedef {'json'|'xml'|'markdown'} AceFieldLang
 */

const defaultI18nPrefix = 'components.formComponent.aceField';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/ace-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @virtual
   * @type {AceFieldLang}
   */
  lang: undefined,

  /**
   * Map: editor component ID -> has error
   * @type {Object<string, boolean>}
   */
  hasErrorPerEditor: undefined,

  /**
   * @type {ComputedProperty<Object>}
   */
  anyEditorHasErrorValidator: computed(() => validator(function (value, options, model) {
    const field = model.field;
    const errorMsg = String(field.t(`${defaultI18nPrefix}.errors.invalidValue`));
    return Object.values(field.hasErrorPerEditor).includes(true) ? errorMsg : true;
  }, {
    dependentKeys: ['model.field.hasErrorPerEditor'],
  })),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('hasErrorPerEditor', {});
    this.registerInternalValidator('anyEditorHasErrorValidator');
  },

  /**
   * @param {string} editorId
   * @param {boolean} hasError
   * @returns {void}
   */
  changeEditorValidationState(editorId, hasError) {
    this.set('hasErrorPerEditor', {
      ...this.hasErrorPerEditor,
      [editorId]: hasError,
    });
  },
});
