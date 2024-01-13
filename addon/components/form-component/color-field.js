/**
 * A component responsible for rendering color field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from 'onedata-gui-common/templates/components/form-component/color-field';

export default FieldComponentBase.extend({
  layout,
  classNames: ['color-field'],
});
