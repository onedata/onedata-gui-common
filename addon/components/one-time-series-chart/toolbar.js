/**
 * Is responsible for rendering controls toolbar and controlling
 * one-time-series-plots by modifying charts configuration in `models`.
 * `models` is an array, hence it is possible to control many plots
 * in the same time.
 *
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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['one-time-series-chart-toolbar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneTimeSeriesChart.toolbar',

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

  init() {
    this._super(...arguments);
    this.setPreselectedTimeResolution();
  },

  /**
   * @returns {Array<Utils.OneTimeSeriesChart.Model>}
   */
  getModels() {
    return this.get('models') || [];
  },

  setPreselectedTimeResolution() {
    const usedTimeResolutions = this.getModels().map((model) =>
      get(model, 'lastViewParameters.timeResolution')
    ).uniq();
    const validTimeResolutions = this.get('timeResolutionOptions').mapBy('value');
    if (
      validTimeResolutions.length > 0 && (
        usedTimeResolutions.length > 1 ||
        usedTimeResolutions.some((res) => !validTimeResolutions.includes(res))
      )
    ) {
      this.changeTimeResolution(validTimeResolutions[0]);
    }
  },

  /**
   * @param {number} timeResolution
   * @returns {void}
   */
  changeTimeResolution(timeResolution) {
    this.getModels().forEach((model) => model.setViewParameters({
      timeResolution,
    }));
  },

  actions: {
    changeTimeResolution({ value }) {
      this.changeTimeResolution(value);
    },
    showOlder() {
      const moveableModels = this.getModels()
        .filter((model) =>
          !get(model, 'state.hasReachedOldest') &&
          get(model, 'state.firstPointTimestamp')
        ).sort((m1, m2) =>
          get(m2, 'state.firstPointTimestamp') -
          get(m1, 'state.firstPointTimestamp')
        );

      if (moveableModels.length === 0) {
        return;
      }

      const maxMoveableState = get(moveableModels[0], 'state');
      const newLastPointTimestamp = maxMoveableState.firstPointTimestamp -
        maxMoveableState.timeResolution;
      moveableModels.forEach((model) => {
        if (get(model, 'state.lastPointTimestamp') > newLastPointTimestamp) {
          model.setViewParameters({
            lastPointTimestamp: newLastPointTimestamp,
          });
        }
      });
    },
    showNewer() {
      const moveableModels = this.getModels()
        .filter((model) =>
          !get(model, 'state.hasReachedNewest') &&
          get(model, 'state.lastPointTimestamp')
        ).sort((m1, m2) =>
          get(m1, 'state.lastPointTimestamp') -
          get(m2, 'state.lastPointTimestamp')
        );

      if (moveableModels.length === 0) {
        return;
      }

      const minMoveableState = get(moveableModels[0], 'state');
      const newLastPointTimestamp = minMoveableState.lastPointTimestamp +
        minMoveableState.timeResolution * minMoveableState.pointsCount;
      moveableModels.forEach((model) => {
        if (get(model, 'state.lastPointTimestamp') < newLastPointTimestamp) {
          model.setViewParameters({
            lastPointTimestamp: newLastPointTimestamp,
          });
        }
      });
    },
    showNewest() {
      this.getModels().forEach((model) => model.setViewParameters({
        lastPointTimestamp: null,
      }));
    },
  },
});
