/**
 * A component responsible for rendering JSON field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/json-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['json-field'],

  /**
   * @type {ComputedProperty<SafeString>}
   */
  placeholder: reads('field.placeholder'),

  actions: {
    valueChanged({ value }) {
      this._super(value);
    },
  },
});
