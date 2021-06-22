/**
 * Base class for all visualisers elements.
 *
 * @module utils/workflow-visualiser/visualiser-element
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {String}
   */
  __modelType: undefined,

  /**
   * @virtual
   * @type {String}
   */
  renderer: undefined,

  /**
   * One of: 'view', 'edit'
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {String}
   */
  id: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement|null}
   */
  parent: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * Special field to distinguish workflow elements from all other objects during
   * drag&drop.
   * @type {String}
   */
  __modelOrigin: 'workflowVisualiser',
});
