/**
 * Groups all available factories into a single factories index.
 *
 * @module utils/one-time-series-chart/series-factories/index
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// using `staticFactory` instead of `static`, because `static` is a reserved JS keyword
import staticFactory from './static';
import dynamic from './dynamic';

const seriesFactoriesIndex = {
  static: staticFactory,
  dynamic,
};

export default seriesFactoriesIndex;
