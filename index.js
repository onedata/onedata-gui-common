/* eslint-env node */
'use strict';

module.exports = {
  name: 'onedata-gui-common',
  isDevelopingAddon: function () {
    return true;
  },
  included: function ( /* app */ ) {
    this._super.included.apply(this, arguments);
  },

  /**
   * Make public files from this addon to be merged into application's public.
   * @returns {Object}
   */
  treeForPublic: function () {
    const tree = this._super.treeForPublic.apply(this, arguments);
    if (tree) {
      tree.destDir = '/';
    }
    return tree;
  },
};
