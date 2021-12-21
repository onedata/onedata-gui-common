/* eslint-env node */
'use strict';

const dynamicLibraries = require('../addon/dynamic-libraries').default;

module.exports = function ( /* environment, appConfig */ ) {
  return {
    i18n: {
      defaultLocale: 'en',
    },
    dynamicLibraries,
  };
};
