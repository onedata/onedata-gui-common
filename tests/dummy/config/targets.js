/* eslint-env node */
module.exports = {
  browsers: [
    'since 2017',
    // must be specified, due to potential bug in build chain: only old versions
    // of android are listed in Babel's data, so it will always add plugins for Android 4
    'not android > 4',
  ],
};
