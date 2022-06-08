/**
 * Groups all available transform functions into a single functions index.
 *
 * @module utils/one-time-series-chart/transform-functions/index
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import abs from './abs';
import formatWithUnit from './format-with-unit';
import getDynamicSeriesGroupConfigData from './get-dynamic-series-group-config-data';
import multiply from './multiply';
import replaceEmpty from './replace-empty';
import supplyValue from './supply-value';

const transformsFunctionsIndex = {
  abs,
  formatWithUnit,
  getDynamicSeriesGroupConfigData,
  multiply,
  replaceEmpty,
  supplyValue,
};

export default transformsFunctionsIndex;
