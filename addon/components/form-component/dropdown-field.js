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

  actions: {
    valueChanged(option) {
      this._super(get(option, 'value'));
    },
    triggerFocusLost() {
      // Focus lost due to opening dropdown should be omitted
      if (this.$('.ember-basic-dropdown-trigger').attr('aria-expanded') !== 'true') {
        this.send('focusLost');
      }
    },
  },
});
