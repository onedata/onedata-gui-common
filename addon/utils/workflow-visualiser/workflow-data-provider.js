/**
 * Includes properties and methods, which allows to obtain workflow-related data.
 * Created by workflow-visualiser and used internally by actions-factory to
 * provide necessary data to the actions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { reject } from 'rsvp';
import { runsRegistryToSortedArray } from 'onedata-gui-common/utils/workflow-visualiser/run-utils';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import generateId from 'onedata-gui-common/utils/generate-id';

/**
 * @typedef {`store-${string}`} AtmStoreTimeSeriesCollectionReference
 * Reference to a time series collection attached to specific time series store.
 * String after the prefix is a store schema ID.
 */

/**
 * @typedef {`task-${string}`} AtmTaskTimeSeriesCollectionReference
 * Reference to a time series collection attached to specific task. String after
 * the prefix is a task schema ID.
 */

/**
 * @typedef {
 *   AtmStoreTimeSeriesCollectionReference |
 *   AtmTaskTimeSeriesCollectionReference
 * } AtmTimeSeriesCollectionReference
 */

/**
 * @typedef {Map<AtmTimeSeriesCollectionReference, Utils.WorkflowVisualiser.Store>} AtmTimeSeriesCollectionReferencesMap
 */

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

  /**
   * @returns {AtmValuePresenterContext|undefined}
   */
  getStoreContentPresenterContext() {
    return this.executionDataFetcher?.getStoreContentPresenterContext();
  },

  /**
   * @param {number|null} [runNumber]
   * @returns {AtmTimeSeriesCollectionReferencesMap}
   */
  getTimeSeriesCollectionReferencesMap(runNumber = null) {
    const referencesMap = new Map();

    // Add references to defined time series stores (don't depend on run number).
    this.definedStores
      .filter((store) => store.type === 'timeSeries')
      .forEach((store) => referencesMap.set(`store-${store.schemaId}`, store));

    // Add references to task time series stores (depend on run number).
    const tasks = this.get('visualiserComponent.elementsCache')?.task || [];
    tasks.forEach((task) => {
      let run;
      if (runNumber !== null) {
        run = task.runsRegistry?.[runNumber];
      } else {
        // When `runNumber` is not specified, take the latest run
        const sortedRuns = runsRegistryToSortedArray(task.runsRegistry || {});
        run = sortedRuns[sortedRuns.length - 1];
      }
      let timeSeriesStore = run?.timeSeriesStore;
      if (!timeSeriesStore && task.timeSeriesStoreConfig) {
        // If store is not available yet, but we know, that it might exist
        // in the future, then we create a "mock" of it. It allows to provide
        // information about time series schemas ahead of time to draw an empty
        // chart.
        timeSeriesStore = Store.create({
          id: generateId(),
          type: 'timeSeries',
          config: task.timeSeriesStoreConfig,
        });
      }
      if (timeSeriesStore) {
        referencesMap.set(`task-${task.schemaId}`, timeSeriesStore);
      }
    });

    return referencesMap;
  },
});
