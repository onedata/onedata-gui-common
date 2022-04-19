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

import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * Array of paths where field should be disabled.
   * @type Ember.Array.string
   */
  disabledFieldsPaths: null,

  /**
   * Returns true if path is in disabled state
   * @param {string} path path to check if it is disabled
   * @returns {boolean} true if path is disabled, false otherwise
   */
  isPathDisabled(path) {
    return this.get('disabledFieldsPaths').some((disabledPath) =>
      path === disabledPath ||
      (path.startsWith(disabledPath) && path[disabledPath.length] === '.')
    );
  },
});
