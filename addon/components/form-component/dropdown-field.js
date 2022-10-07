/**
 * A component responsible for rendering dropdown field.
 *
 * @module components/form-component/dropdown-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/dropdown-field';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { array, raw } from 'ember-awesome-macros';

export default FieldComponentBase.extend({
  layout,
  classNames: ['dropdown-field'],

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: reads('field.preparedOptions'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showSearch: reads('field.showSearch'),

  /**
   * @type {ComputedProperty<String>}
   */
  placeholder: reads('field.placeholder'),

  /**
   * @type {ComputedProperty<FieldOption>}
   */
  selectedOption: array.findBy('preparedOptions', raw('value'), 'value'),

  /**
   * One-dropdown item matcher used by its search engine. Allows to search
   * options in FieldOption format.
   * @param {FieldOption} option
   * @param {String} term Query string
   * @returns {Number} -1 if option does not match term, >= 0 otherwise
   */
  matchDropdownOption(option, term) {
    const label = option && option.label || '';
    // Using `String()` in case of SafeString
    return String(label).toLowerCase().indexOf((term || '').trim().toLowerCase());
  },

  actions: {
    valueChanged(option) {
      this._super(get(option, 'value'));
    },
    triggerFocusLost() {
      const element = this.get('element');
      const trigger =
        element && element.querySelector('.ember-basic-dropdown-trigger');
      // Focus lost due to opening dropdown should be omitted
      if (!trigger || trigger.getAttribute('aria-expanded') !== 'true') {
        this.send('focusLost');
      }
    },
  },
});
