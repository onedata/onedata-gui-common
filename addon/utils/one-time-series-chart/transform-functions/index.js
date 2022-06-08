/**
 * Groups all available transform functions into a single functions index.
 *
 * @module utils/one-time-series-chart/transform-functions/index
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import abs from './abs';
import currentValue from './current-value';
import getDynamicSeriesGroupConfig from './get-dynamic-series-group-config';
import literal from './literal';
import multiply from './multiply';
import replaceEmpty from './replace-empty';

const transformsFunctionsIndex = {
  abs,
  currentValue,
  getDynamicSeriesGroupConfig,
  literal,
  multiply,
  replaceEmpty,
};

export default transformsFunctionsIndex;
