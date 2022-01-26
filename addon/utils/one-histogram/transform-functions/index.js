/**
 * Groups all available transform functions into a single functions index.
 *
 * @module utils/one-histogram/transform-functions/index
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import abs from './abs';
import asBytes from './as-bytes';
import asBytesPerSecond from './as-bytes-per-second';
import multiply from './multiply';
import supplyValue from './supply-value';

const transformsFunctionsIndex = {
  abs,
  asBytes,
  asBytesPerSecond,
  multiply,
  supplyValue,
};

export default transformsFunctionsIndex;
