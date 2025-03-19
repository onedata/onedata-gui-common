/**
 * Custom extension of ember-power-select.
 * This component is used to render custom option in dropdown before other predefined options.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from 'onedata-gui-common/templates/components/form-component/autocomplete-dropdown/one-custom-before-options';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  layout,
  classNameBindings: [
    'isHighlighted:highlighted',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.formComponent.autocompleteDropdown.oneCustomBeforeOptions',

  isHighlighted: false,

  actions: {
    onClick() {
      this.select.actions.close();
    },
    onMouseOver() {
      this.select.actions.highlight();
      this.set('isHighlighted', true);
    },

    onMouseOut() {
      this.set('isHighlighted', false);
    },
  },
});
