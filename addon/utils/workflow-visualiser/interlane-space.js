/**
 * Space between lanes. Allows creating new lanes.
 *
 * @module utils/workflow-visualiser/interlane-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';

export default VisualiserSpace.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/interlane-space',

  /**
   * @override
   */
  type: 'interlaneSpace',

  /**
   * @override
   */
  parent: null,

  /**
   * @override
   */
  siblingsType: 'lane',
});
