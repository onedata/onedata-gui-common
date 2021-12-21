/**
 * Copies source files related to dynamically loaded libraries.
 *
 * @module utils/copy-dynamic-libraries
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

module.exports = function (app, dynamicLibraries) {
  Object.values(dynamicLibraries).forEach(librarySpec => {
    librarySpec.files.forEach(libraryFileSpec => {
      app.import(libraryFileSpec.sourcePath, {
        outputFile: libraryFileSpec.destinationPath,
      });
    });
  });
};
