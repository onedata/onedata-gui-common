import file from './data-spec/file';
import timeSeriesMeasurement from './data-spec/time-series-measurement';

export default {
  types: {
    integer: 'Integer',
    string: 'String',
    object: 'Object',
    file: 'File',
    dataset: 'Dataset',
    range: 'Range',
    array: 'Array',
    timeSeriesMeasurement: 'Time series measurement',
    onedatafsCredentials: 'OnedataFS credentials',
  },
  file,
  timeSeriesMeasurement,
};
