/**
 * Space between parallel boxes or tasks. Allows creating new elements.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';

export default VisualiserSpace.extend({
  /**
   * @override
   */
  __modelType: 'interblockSpace',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/interblock-space',

  /**
   * @type {Object}
   */
  siblingsTypePerParentType: Object.freeze({
    lane: 'parallelBox',
    parallelBox: 'task',
  }),

  /**
   * @override
   */
  siblingsType: computed(
    'siblingsTypePerParentType',
    'parent.__modelType',
    function siblingsType() {
      return this.siblingsTypePerParentType[this.parent?.__modelType];
    }
  ),
});
