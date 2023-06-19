import abs from './abs';
import axisOutput from './axis-output';
import currentValue from './current-value';
import literal from './literal';
import loadSeries from './load-series';
import loadRepeatedSeries from './load-repeated-series';
import multiply from './multiply';
import rate from './rate';
import replaceEmpty from './replace-empty';
import seriesOutput from './series-output';
import timeDerivative from './time-derivative';

/**
 * @type {Record<string, FunctionSpec<FunctionBase>>}
 */
export default Object.freeze({
  abs,
  axisOutput,
  currentValue,
  literal,
  loadSeries,
  loadRepeatedSeries,
  multiply,
  rate,
  replaceEmpty,
  seriesOutput,
  timeDerivative,
});

export { FunctionDataType } from './common';
