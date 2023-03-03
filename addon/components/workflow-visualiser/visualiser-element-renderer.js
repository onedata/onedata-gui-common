/**
 * Renders visualiser element depending on renderer setting.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/visualiser-element-renderer';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  elementModel: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  elementRenderer: reads('elementModel.renderer'),
});
