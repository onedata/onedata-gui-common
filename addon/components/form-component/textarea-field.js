/**
 * A component responsible for rendering textarea fields.
 *
 * @module components/form-component/textarea-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/textarea-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['textarea-field'],

  /**
   * @type {ComputedProperty<SafeString>}
   */
  placeholder: reads('field.placeholder'),

  /**
   * @type {ComputedProperty<number|null>}
   */
  rows: reads('field.rows'),

  /**
   * @type {ComputedProperty<number|null>}
   */
  cols: reads('field.cols'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  showsStaticTextInViewMode: reads('field.showsStaticTextInViewMode'),
});
