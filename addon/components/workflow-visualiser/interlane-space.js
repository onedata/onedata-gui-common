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
import { computed } from '@ember/object';
import { or, not } from 'ember-awesome-macros';

export default VisualiserSpace.extend({
  layout,
  classNames: ['workflow-visualiser-interlane-space'],
  classNameBindings: ['isFullViewSpace:full-view-space'],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.InterlaneSpace>}
   */
  interlaneSpace: reads('elementModel'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isFullViewSpace: not(or(
    'interlaneSpace.elementBefore',
    'interlaneSpace.elementAfter'
  )),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createLaneAction: computed(
    'actionsFactory',
    'interlaneSpace',
    function createLaneAction() {
      const {
        actionsFactory,
        interlaneSpace,
      } = this.getProperties('actionsFactory', 'interlaneSpace');

      return actionsFactory.createCreateLaneAction({
        createLaneCallback: newElementProps => interlaneSpace.addElement(newElementProps),
      });
    }
  ),
});
