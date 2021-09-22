/**
 * A component responsible for rendering capacity field.
 *
 * @module components/form-component/capacity-field
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/capacity-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['capacity-field'],

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  allowedUnits: reads('field.allowedUnits'),

  /**
   * @type {ComputedProperty<String>}
   */
  placeholder: reads('field.placeholder'),
});
