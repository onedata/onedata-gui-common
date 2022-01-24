/* eslint-env node */
'use strict';

const colors = require('./colors');
const breakpoints = require('./breakpoints');

module.exports = function ( /* environment, appConfig */ ) {
  return {
    i18n: {
      defaultLocale: 'en',
    },
    colors,
    breakpoints,
  };
};
