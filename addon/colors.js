/**
 * Colors for the app. It can be import both by `import ... from ...` 
 * or using require('...').default
 *
 * @module colors
 * @author Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */
/* global exports */

var colors = {
  azure: '#3EA5F9',
  fuchsia: '#D010B9',
  teal: '#08B7B5',
  orange: '#FF854D',
  violet: '#8549D4',
  yellow: '#F7AA04',
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

// colors assigned to `default` to allow ES import
module.exports.default = colors;
