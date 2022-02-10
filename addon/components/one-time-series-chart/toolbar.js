/**
 * Is responsible for rendering controls toolbar and controlling
 * one-time-series-plots by modifying charts configuration in `models`.
 * `models` is an array, hence it is possible to control many plots
 * in the same time.
 *
 * @module components/one-time-series-chart/toolbar
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../../templates/components/one-time-series-chart/toolbar';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';
import _ from 'lodash';

export default Component.extend({
  layout,
  classNames: ['one-time-series-chart-toolbar'],

  /**
   * @virtual
   * @type {Array<Utils.OneTimeSeriesChart.Model>}
   */
  models: undefined,

  /**
   * @type {ComputedProperty<number>}
   */
  selectedTimeResolution: reads('models.firstObject.lastViewParameters.timeResolution'),

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  timeResolutionOptions: computed(
    'models.[]',
    function timeResolutionOptions() {
      const timeResolutionsInModels = this.getModels().map((model) =>
        get(model, 'configuration.timeResolutionSpecs').mapBy('timeResolution')
      );
      const commonTimeResolutions = _.intersection(...timeResolutionsInModels)
        .sort((a, b) => a - b);

      return commonTimeResolutions.map((timeResolution) => ({
        value: timeResolution,
        label: stringifyDuration(timeResolution, {
          shortFormat: true,
          showIndividualSeconds: true,
        }),
      }));
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isShowOlderDisabled: computed(
    'models.@each.state',
    function isShowOlderDisabled() {
      return this.getModels()
        .every((model) => get(model, 'state.hasReachedOldest'));
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isShowNewerAndNewestDisabled: computed(
    'models.@each.state',
    function isShowNewerAndNewestDisabled() {
      return this.getModels()
        .every((model) => get(model, 'state.hasReachedNewest'));
    }
  ),

  /**
   * @returns {Array<Utils.OneTimeSeriesChart.Model>}
   */
  getModels() {
    return this.get('models') || [];
  },

  actions: {
    changeTimeResolution(timeResolution) {
      this.getModels().forEach((model) => model.setViewParameters({
        timeResolution,
      }));
    },
    showOlder() {
      const moveableModels = this.getModels()
        .filter((model) =>
          !get(model, 'state.hasReachedOldest') &&
          get(model, 'state.firstWindowTimestamp')
        ).sort((m1, m2) =>
          get(m1, 'state.firstWindowTimestamp') -
          get(m2, 'state.firstWindowTimestamp')
        ).reverse();

      if (moveableModels.length === 0) {
        return;
      }

      const maxMoveableState = get(moveableModels[0], 'state');
      const newLastWindowTimestamp = maxMoveableState.firstWindowTimestamp -
        maxMoveableState.timeResolution;
      moveableModels.forEach((model) => {
        if (get(model, 'state.lastWindowTimestamp') > newLastWindowTimestamp) {
          model.setViewParameters({
            lastWindowTimestamp: newLastWindowTimestamp,
          });
        }
      });
    },
    showNewer() {
      const moveableModels = this.getModels()
        .filter((model) =>
          !get(model, 'state.hasReachedNewest') &&
          get(model, 'state.lastWindowTimestamp')
        ).sort((m1, m2) =>
          get(m1, 'state.lastWindowTimestamp') -
          get(m2, 'state.lastWindowTimestamp')
        );

      if (moveableModels.length === 0) {
        return;
      }

      const minMoveableState = get(moveableModels[0], 'state');
      const newLastWindowTimestamp = minMoveableState.lastWindowTimestamp +
        minMoveableState.timeResolution * minMoveableState.windowsCount;
      moveableModels.forEach((model) => {
        if (get(model, 'state.lastWindowTimestamp') < newLastWindowTimestamp) {
          model.setViewParameters({
            lastWindowTimestamp: newLastWindowTimestamp,
          });
        }
      });
    },
    showNewest() {
      this.getModels().forEach((model) => model.setViewParameters({
        lastWindowTimestamp: null,
      }));
    },
  },
});
