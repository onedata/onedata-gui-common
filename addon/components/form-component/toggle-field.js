/**
 * A component responsible for rendering toggle field.
 *
 * @module components/form-component/toggle-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/toggle-field';

export default FieldComponentBase.extend({
  layout,
  classNames: ['toggle-field'],
});
