/**
 * Groups all available series functions into a single functions index.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import abs from './abs';
import getDynamicSeriesConfig from './get-dynamic-series-config';
import getDynamicSeriesGroupConfig from './get-dynamic-series-group-config';
import literal from './literal';
import loadSeries from './load-series';
import multiply from './multiply';
import rate from './rate';
import replaceEmpty from './replace-empty';
import timeDerivative from './time-derivative';

const seriesFunctionsIndex = {
  abs,
  getDynamicSeriesConfig,
  getDynamicSeriesGroupConfig,
  literal,
  loadSeries,
  multiply,
  rate,
  replaceEmpty,
  timeDerivative,
};

export default seriesFunctionsIndex;
