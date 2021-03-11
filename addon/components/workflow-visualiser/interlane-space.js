/**
 * Space between lanes. Allows creating new lanes.
 *
 * @module components/workflow-visualiser/interlane-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserSpace from 'onedata-gui-common/components/workflow-visualiser/visualiser-space';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/interlane-space';
import { reads } from '@ember/object/computed';

export default VisualiserSpace.extend({
  layout,
  classNames: ['workflow-visualiser-interlane-space'],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  interlaneSpace: reads('elementModel'),

  actions: {
    addLane() {
      const defaultNameTranslationKey = 'components.workflowVisualiser.nameForNew.lane';
      this.get('interlaneSpace').addElement({
        type: 'lane',
        name: String(this.t(defaultNameTranslationKey, {}, { usePrefix: false })),
        tasks: [],
      });
    },
  },
});
