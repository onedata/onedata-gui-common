/**
 * Includes properties and methods, which allows to obtain workflow-related data.
 * Created by workflow-visualiser and used internally by actions-factory to
 * provide necessary data to the actions.
 *
 * @module utils/workflow-visualiser/workflow-data-provider
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { reject } from 'rsvp';

export default EmberObject.extend({
  /**
   * @type {Components.WorkflowVisualiser}
   */
  visualiserComponent: undefined,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: reads('visualiserComponent.workflow'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: reads('visualiserComponent.definedStores'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ExecutionDataFetcher>}
   */
  executionDataFetcher: reads('visualiserComponent.executionDataFetcher'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @param {AtmStoreContentBrowseOptions} browseOptions
   * @returns {Promise<AtmStoreContentBrowseResult|null>}
   */
  getStoreContent(store, browseOptions) {
    const executionDataFetcher = this.get('executionDataFetcher');
    if (!executionDataFetcher) {
      console.error(
        'util:workflow-visualiser/workflow-data-provider#getStoreContent: executionDataFetcher is not set',
      );
      return reject();
    }
    const storeInstanceId = store && get(store, 'instanceId');
    if (!storeInstanceId) {
      console.error(
        'util:workflow-visualiser/workflow-data-provider#getStoreContent: provided store does not have instance id',
      );
      return reject();
    }
    return executionDataFetcher.fetchStoreContent(storeInstanceId, browseOptions);
  },

  /**
   * @param {string} taskInstanceId
   * @returns {{ task: Utils.WorkflowVisualiser.Lane.Task, runNumber: number } | null}
   */
  getTaskRunForInstanceId(taskInstanceId) {
    const allTasks = this.get('visualiserComponent.elementsCache')?.task || [];
    for (const task of allTasks) {
      for (const run of Object.values(get(task, 'runsRegistry') || {})) {
        if (run?.instanceId === taskInstanceId) {
          return { task, runNumber: run.runNumber };
        }
      }
    }
    return null;
  },
});
