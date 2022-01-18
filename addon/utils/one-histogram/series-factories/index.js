// using `staticFactory` instead of `static`, because `static` is a reserved JS keyword
import staticFactory from './static';
import dynamic from './dynamic';

const seriesFactoriesIndex = {
  static: staticFactory,
  dynamic,
};

export default seriesFactoriesIndex;
