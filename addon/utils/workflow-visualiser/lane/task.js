/**
 * Task - single job with progress.
 *
 * @module utils/workflow-visualiser/lane/task
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import { reads } from '@ember/object/computed';
import { raw, or, writable } from 'ember-awesome-macros';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  __modelType: 'task',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/task',

  /**
   * @virtual
   * @type {String}
   */
  lambdaId: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  argumentMappings: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  resultMappings: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  resourceSpecOverride: undefined,

  /**
   * @virtual
   * @type {ComputedProperty<String>}
   */
  instanceId: reads('visibleRun.instanceId'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  systemAuditLogStore: reads('visibleRun.systemAuditLogStore'),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsInProcessing: writable(or('visibleRun.itemsInProcessing', raw(0))),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsProcessed: writable(or('visibleRun.itemsProcessed', raw(0))),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsFailed: writable(or('visibleRunNo.itemsFailed', raw(0))),
});
