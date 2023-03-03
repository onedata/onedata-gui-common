/**
 * Copies source files of dynamically loadable libraries to a built
 * application assets directory. It allows to fetch them later (on demand)
 * by a browser.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

/**
 * @param {EmberApplication} app
 * @param {DynamicLibrarySpecs} dynamicLibraries
 */
module.exports = function (app, dynamicLibraries) {
  Object.values(dynamicLibraries).forEach(librarySpec => {
    librarySpec.files.forEach(libraryFileSpec => {
      app.import(libraryFileSpec.sourcePath, {
        outputFile: libraryFileSpec.destinationPath,
      });
    });
  });
};
