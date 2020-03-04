/**
 * An util, that injects application breakpoints to ember sass configuration.
 *
 * @module utils/define-sass-breakpoints
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const sass = require('sass');

/**
 * @param {EmberApp} app 
 * @param {object} breakpoints contains keys with CSS size values (eg. '100px')
 *    - screenSm
 *    - screenMd
 *    - screenLg
 */
module.exports = function (app, breakpoints) {
  if (!app.options.sassOptions) {
    app.options.sassOptions = {};
  }
  const sassOptions = app.options.sassOptions;
  if (!sassOptions.functions) {
    sassOptions.functions = {};
  }
  sassOptions.functions =
    Object.keys(breakpoints).reduce(function (functions, breakpointName) {
      functions['def-' + breakpointName] = function () {
        return new sass.types.Number(breakpoints[breakpointName]);
      };
      return functions;
    }, sassOptions.functions);
};
