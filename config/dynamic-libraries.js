/**
 * List of dynamically loadable GUI libraries. All files mentioned in below specification
 * will be copied as separate files (not merged) during the process of application
 * building. Thanks to that it will be possible to load each library separately
 * on demand.
 *
 * @module dynamic-libraries
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const nodeModulesPath = 'node_modules';
const scriptAssetsPath = 'assets/scripts';

module.exports = {
  echarts: {
    files: [{
      sourcePath: `${nodeModulesPath}/echarts/dist/echarts.min.js`,
      destinationPath: `${scriptAssetsPath}/echarts.min.js`,
    }],
  },
};
