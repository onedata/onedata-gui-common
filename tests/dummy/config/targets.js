/* eslint-env node */
const browsers = [
  'last 1 chrome versions',
  'last 1 firefox versions',
  'last 1 safari versions',
  // must be specified, due to potential bug in build chain: only old versions
  // of android are listed in Babel's data, so it will always add plugins for Android 4
  'not android > 4',
];

const isModernTarget = process.env.MODERN_BROWSER_BUILD === 'true';

if (!isModernTarget) {
  browsers.push('since 2017');
}

module.exports = {
  browsers,
};
