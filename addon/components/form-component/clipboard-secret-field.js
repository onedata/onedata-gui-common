/**
 * A component responsible for rendering a secret field
 * with a copy button and a view/hide button.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/clipboard-secret-field';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';

export default FieldComponentBase.extend(I18n, {
  layout,
  classNames: ['clipboard-secret-field'],

  /**
   * @override
   */
  i18nPrefix: 'components.formComponent.clipboardSecretField',

  /**
   * @type {ComputedProperty<string>}
   */
  secret: reads('field.value'),

  /**
   * @type {ComputedProperty<string>}
   */
  displayedText: reads('field.displayedText'),

  /**
   * @type {ComputedProperty<number>}
   */
  textareaRows: reads('field.textareaRows'),

  /**
   * @type {boolean}
   */
  isSecretShown: false,

  actions: {
    toggleSecretShow() {
      this.toggleProperty('isSecretShown');
    },
  },
});
