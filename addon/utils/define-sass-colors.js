/**
 * An util, that injects application colors to ember sass configuration.
 *
 * @module utils/define-sass-colors
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const sass = require('node-sass');

module.exports = function (app, colors) {
  if (!app.options.sassOptions) {
    app.options.sassOptions = {};
  }
  const sassOptions = app.options.sassOptions;
  if (!sassOptions.functions) {
    sassOptions.functions = {};
  }
  sassOptions.functions =
    Object.keys(colors).reduce(function (functions, colorName) {
      functions['color-one-' + colorName] = function () {
        return new sass.types.Color(
          parseInt(colors[colorName].substring(1), 16) + 0xff000000
        );
      };
      return functions;
    }, sassOptions.functions);
}
