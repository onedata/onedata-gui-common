/**
 * Groups all available series functions into a single functions index.
 *
 * @module utils/one-time-series-chart/series-functions/index
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import abs from './abs';
import getDynamicSeriesConfigData from './get-dynamic-series-config-data';
import loadSeries from './load-series';
import multiply from './multiply';
import replaceEmpty from './replace-empty';

const seriesFunctionsIndex = {
  abs,
  getDynamicSeriesConfigData,
  loadSeries,
  multiply,
  replaceEmpty,
};

export default seriesFunctionsIndex;
