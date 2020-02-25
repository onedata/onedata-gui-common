/**
 * A component responsible for rendering form fields group.
 *
 * @module components/form-component/form-fields-group
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/form-fields-group';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['form-fields-group'],

  /**
   * @type {ComputedProperty<Array<Utils.FormComponent.FormElement>>}
   */
  nestedFields: reads('field.fields'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isExpanded: reads('field.isExpanded'),
});
