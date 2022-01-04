import asBytesPerSecond from './as-bytes-per-second';
import asBytes from './as-bytes';
import asPercent from './as-percent';
import asString from './as-string';

const valueFormattersIndex = {
  asBytesPerSecond,
  asBytes,
  asPercent,
  asString,
  default: asString,
};

export default valueFormattersIndex;
