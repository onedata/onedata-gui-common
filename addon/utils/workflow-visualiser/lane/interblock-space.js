/**
 * Space between parallel boxes or tasks. Allows creating new elements.
 *
 * @module utils/workflow-visualiser/lane/interblock-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import { getBy } from 'ember-awesome-macros';

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
  siblingsType: getBy('siblingsTypePerParentType', 'parent.__modelType'),
});
