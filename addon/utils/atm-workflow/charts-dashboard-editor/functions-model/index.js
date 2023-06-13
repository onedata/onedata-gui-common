import abs from './abs';
import currentValue from './current-value';
import literal from './literal';
import loadSeries from './load-series';
import loadRepeatedSeries from './load-repeated-series';
import multiply from './multiply';
import rate from './rate';
import replaceEmpty from './replace-empty';
import timeDerivative from './time-derivative';

/**
 * @type {Record<string, FunctionSpec<FunctionBase>>}
 */
export default Object.freeze({
  abs,
  currentValue,
  literal,
  loadSeries,
  loadRepeatedSeries,
  multiply,
  rate,
  replaceEmpty,
  timeDerivative,
});

export { FunctionDataType } from './common';
