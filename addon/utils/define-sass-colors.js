/**
 * An util, that injects application colors to ember sass configuration.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */

const sass = require('sass-embedded');

module.exports = function defineSassColors(app, colors) {
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
    Object.keys(colors).reduce(function (functions, colorName) {
      functions['color-one-' + colorName] = function () {
        return new sassImplementation.SassColor(hexToRgb(colors[colorName]));
      };
      return functions;
    }, sassOptions.functions);
};

/**
 * @param {string} hexString Color in 6-char HEX format preceeded with # sign,
 *   eg. #FA1234.
 * @returns {{red: number, green: number, blue: number}} Decimal values of color
 *   components.
 */
function hexToRgb(hexString) {
  const red = getColorDecimalValue(hexString, 1);
  const green = getColorDecimalValue(hexString, 3);
  const blue = getColorDecimalValue(hexString, 5);
  return { red, green, blue };
}

/**
 * @param {string} hexString Color in 6-char HEX format preceeded with # sign,
 *   eg. #FA1234.
 * @param {number} startIndex Index of first of two chars of 2-char hex value, eg. FA.
 * @returns {number} Decimal value of single color component.
 */
function getColorDecimalValue(hexString, startIndex) {
  return Number.parseInt(hexString.substring(startIndex, startIndex + 2), 16);
}
