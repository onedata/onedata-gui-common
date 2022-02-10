/**
 * List of dynamically loadable GUI libraries. All files mentioned in below specification
 * will be copied as separate files (not merged) during the process of application
 * building. Thanks to that it will be possible to load each library separately
 * on demand.
 *
 * @module config/dynamic-libraries
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

/**
 * @typedef {Object<string, DynamicLibrarySpec>} DynamicLibrarySpecs
 *   mapping (library name) -> library spec.
 */

/**
 * @typedef {Object} DynamicLibrarySpec
 * @property {Array<DynamicLibraryFileSpec>} files files needed by the library to work
 * @property {string} [exportName] name of the window object property, where a
 *   library class/function is located after loading. When not provided, name of
 *   the library will be used.
 */

/**
 * @typedef {Object} DynamicLibraryFileSpec
 * @property {string} sourcePath where the file can be found (e.g. path in node_modules).
 *   Must include file name.
 * @property {string} destinationPath should point to some directory with assets.
 *   Must include file name.
 */

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
