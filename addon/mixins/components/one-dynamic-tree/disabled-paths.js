/**
 * A mixin that provides 'disabled fields paths' to the one-dynamic-tree 
 * component and its subcomponents. If a path is in `disabledFieldsPaths`
 * property, then all fields, which paths starts with that path, will be 
 * considered as disabled.
 * 
 * @module mixins/components/one-dynamic-tree/disabled-paths
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Mixin.create({
  /**
   * Array of paths where field should be disabled.
   * @type Ember.Array.string
   */
  disabledFieldsPaths: null,

  /**
   * Returns true if path is in disabled state
   * @param {string} path path to check if it is disabled
   * @return {boolean} true if path is disabled, false otherwise
   */
  isPathDisabled(path) {
    return this.get('disabledFieldsPaths').reduce((isDisabled, disabledPath) => {
      if (path === disabledPath) {
        return true;
      } else {
        let isDisabledPathPrefix = 
          path.startsWith(disabledPath) && path[disabledPath.length] === '.';
        return isDisabled || isDisabledPathPrefix;
      }
    }, false);
  },
});
