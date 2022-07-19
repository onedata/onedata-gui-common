/**
 * Groups all available series group builders into a single builders index.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// using `staticBuilder` instead of `static`, because `static` is a reserved JS keyword
import staticBuilder from './static';
import dynamic from './dynamic';

const seriesGroupBuildersIndex = {
  static: staticBuilder,
  dynamic,
};

export default seriesGroupBuildersIndex;
