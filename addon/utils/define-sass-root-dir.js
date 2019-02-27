/**
 * An util, that injects root-dir function to ember sass configuration.
 *
 * @module utils/define-sass-root-dir
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const sass = require('sass');

module.exports = function defineSassRootDir(app) {
  if (!app.options.sassOptions) {
    app.options.sassOptions = {};
  }
  const sassOptions = app.options.sassOptions;
  if (!sassOptions.functions) {
    sassOptions.functions = {};
  }

  sassOptions.functions['root-url'] = function () {
    return new sass.types.String(app.isProduction ? '../' : './');
  };
}
