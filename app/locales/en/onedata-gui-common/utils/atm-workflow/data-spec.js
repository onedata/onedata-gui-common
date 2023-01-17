import file from './data-spec/file';
import timeSeriesMeasurement from './data-spec/time-series-measurement';

export default {
  types: {
    number: 'Number',
    boolean: 'Boolean',
    string: 'String',
    object: 'Object',
    file: 'File',
    dataset: 'Dataset',
    range: 'Range',
    array: 'Array',
    timeSeriesMeasurement: 'Time series measurement',
  },
  file,
  timeSeriesMeasurement,
};
