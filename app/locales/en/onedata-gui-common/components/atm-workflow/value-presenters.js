import integer from './value-presenters/integer';
import boolean from './value-presenters/boolean';
import string from './value-presenters/string';
import object from './value-presenters/object';
import file from './value-presenters/file';
import dataset from './value-presenters/dataset';
import range from './value-presenters/range';
import array from './value-presenters/array';
import timeSeriesMeasurement from './value-presenters/time-series-measurement';
import fallback from './value-presenters/fallback';
import fullValuePresenter from './value-presenters/full-value-presenter';

export default {
  integer,
  boolean,
  string,
  object,
  file,
  dataset,
  range,
  array,
  timeSeriesMeasurement,
  fallback,
  fullValuePresenter,
};
