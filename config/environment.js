/* eslint-env node */
'use strict';

const dynamicLibraries = require('./dynamic-libraries');

module.exports = function ( /* environment, appConfig */ ) {
  return {
    i18n: {
      defaultLocale: 'en',
    },
    dynamicLibraries,
  };
};
