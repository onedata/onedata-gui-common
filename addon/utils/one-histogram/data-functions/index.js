import loadSeries from './load-series';
import emptySeries from './empty-series';
import multiply from './multiply';

const dataFunctionsIndex = {
  loadSeries,
  emptySeries,
  multiply,
  default: emptySeries,
};

export default dataFunctionsIndex;
