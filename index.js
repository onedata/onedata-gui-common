/* eslint-env node */
'use strict';

module.exports = {
  name: 'onedata-gui-common',
  isDevelopingAddon: function () {
    return true;
  },
  included: function (/* app */) {
    this._super.included.apply(this, arguments);
  }
};
