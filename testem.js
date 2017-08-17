/* eslint-env node */
module.exports = {
  'framework': 'mocha',
  'test_page': 'tests/index.html?hidepassed',
  'report_file': 'tests/test-results.xml',
  'disable_watching': true,
  'launch_in_ci': [
    'Firefox',
    'Chrome',
  ].concat(process.platform === 'darwin' ? ['Safari'] : []),
  'launch_in_dev': [
    'Chrome',
  ],
};
