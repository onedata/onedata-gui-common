/**
 * A component responsible for rendering radio field.
 *
 * @module components/form-component/radio-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/radio-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['radio-field'],

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: reads('field.preparedOptions'),
});
