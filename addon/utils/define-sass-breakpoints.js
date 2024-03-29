/**
 * An util, that injects application breakpoints to ember sass configuration.
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const sass = require('sass-embedded');

/**
 * @param {EmberApp} app
 * @param {object} breakpoints contains keys with CSS size values (eg. '100px')
 *    - screenSm
 *    - screenMd
 *    - screenLg
 */
module.exports = function defineSassBreakpoints(app, breakpoints) {
  if (!app.options.sassOptions) {
    app.options.sassOptions = {};
  }
  const sassOptions = app.options.sassOptions;

  // Using passed sass implementation if possible. It's a hack to avoid instanceof check
  // errors when parent project sass.types.* classes are considered different than
  // gui-common sass.types.* classes.
  const sassImplementation = sassOptions.implementation || sass;

  if (!sassOptions.functions) {
    sassOptions.functions = {};
  }
  sassOptions.functions =
    Object.keys(breakpoints).reduce(function (functions, breakpointName) {
      functions['def-' + breakpointName] = function () {
        return new sassImplementation.SassNumber(breakpoints[breakpointName]);
      };
      return functions;
    }, sassOptions.functions);
};
