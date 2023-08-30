/**
 * Task - single job with progress.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { raw, or } from 'ember-awesome-macros';
import _ from 'lodash';

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
   * @type {Utils.WorkflowVisualiser.ParallelBox}
   */
  parent: undefined,

  /**
   * @virtual
   * @type {String}
   */
  lambdaId: undefined,

  /**
   * @virtual
   * @type {Models.AtmLambda|Models.AtmLambdaSnapshot} Type depends on the project
   */
  lambda: undefined,

  /**
   * @virtual
   * @type {RevisionNumber}
   */
  lambdaRevisionNumber: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  lambdaConfig: undefined,

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
   * @type {AtmTimeSeriesStoreConfig|null}
   */
  timeSeriesStoreConfig: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  resourceSpecOverride: undefined,

  /**
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  lambdaRevision: computed(
    'lambda',
    'lambdaRevisionNumber',
    function lambdaRevision() {
      return this.get(`lambda.revisionRegistry.${this.get('lambdaRevisionNumber')}`);
    }
  ),

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
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  timeSeriesStore: reads('visibleRun.timeSeriesStore'),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsInProcessing: or('visibleRun.itemsInProcessing', raw(0)),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsProcessed: or('visibleRun.itemsProcessed', raw(0)),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsFailed: or('visibleRun.itemsFailed', raw(0)),

  /**
   * @returns {Array<string>}
   */
  getUsedStoreSchemaIds() {
    const storeSchemaIdsFromArgs = this.argumentMappings
      ?.filter((mapping) =>
        mapping?.valueBuilder?.valueBuilderType === 'singleValueStoreContent' &&
        mapping.valueBuilder.valueBuilderRecipe
      )
      ?.map((mapping) => mapping.valueBuilder.valueBuilderRecipe) ?? [];

    const storeSchemaIdsFromResults = this.resultMappings
      ?.map((mapping) => mapping?.storeSchemaId)
      // If schemaId contains `_` it means that it is a special internal reference,
      // not an ID.
      ?.filter((storeSchemaId) => storeSchemaId && !storeSchemaId.includes('_')) ?? [];

    return _.uniq([...storeSchemaIdsFromArgs, ...storeSchemaIdsFromResults]);
  },
});
