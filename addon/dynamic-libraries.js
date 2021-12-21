/**
 * Global definition of dynamically loaded libraries.
 *
 * @module dynamic-libraries
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const nodeModulesPath = 'node_modules';
const scriptAssetsPath = 'assets/scripts';

module.exports.default = {
  echarts: {
    files: [{
      sourcePath: `${nodeModulesPath}/echarts/dist/echarts.min.js`,
      destinationPath: `${scriptAssetsPath}/echarts.min.js`,
    }],
  },
};
