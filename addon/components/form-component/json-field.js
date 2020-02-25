/**
 * A component responsible for rendering JSON field.
 *
 * @module components/form-component/json-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/json-field';

export default FieldComponentBase.extend({
  layout,
  classNames: ['json-field'],

  actions: {
    valueChanged({ value }) {
      this._super(value);
    },
  },
});
