/**
 * Global definitions of breakpoints that are used both in JS and SCSS
 *
 * @module breakpoint-values
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */
/* global exports */

var breakpoints = {
  screenSm: 768,
  screenMd: 1320,
  screenLg: 1680,
};

Object.defineProperty(exports, '__esModule', {
  value: true,
});

// breakpoints assigned to `default` to allow ES import
module.exports.default = breakpoints;
