/**
 * Colors for the app. It can be import both by `import ... from ...` 
 * or using require('...').default
 *
 * @module colors
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */
/* global exports */

var colors = {
  'mint': '#4BD187',
  'red': '#EE3F3F',
  'azure': '#3EA5F9',
  'violet': '#8549D4',
  'yellow': '#F7AA04',
  'blue': '#3B5998',
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

// colors assigned to `default` to allow ES import
module.exports.default = colors;
