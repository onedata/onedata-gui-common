/**
 * Creates a simple checkbox control with custom styles.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneCheckboxBase from 'onedata-gui-common/components/one-checkbox-base';
import layout from 'onedata-gui-common/templates/components/one-checkbox';

export default OneCheckboxBase.extend({
  layout,
  classNames: ['one-checkbox'],
});
