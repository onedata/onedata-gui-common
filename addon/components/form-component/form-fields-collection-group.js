/**
 * A component responsible for rendering form fields collection group.
 *
 * @module components/form-component/form-fields-collection-group
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormFieldsGroup from 'onedata-gui-common/components/form-component/form-fields-group';
import layout from '../../templates/components/form-component/form-fields-collection-group';
import { reads } from '@ember/object/computed';

export default FormFieldsGroup.extend({
  layout,
  classNames: ['form-fields-collection-group'],

  /**
   * @type {ComputedProperty<String>}
   */
  addButtonText: reads('field.addButtonText'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isCollectionManipulationAllowed: reads('field.isCollectionManipulationAllowed'),

  actions: {
    addField() {
      this.get('field').addNewField();
    },
    removeField(field) {
      this.get('field').removeField(field);
    },
  },
});
