/**
 * A service that translates string pair (context, keyword) into valid oneicon
 * icon name. If (context, keyword) is not defined, then keyword is used as the
 * result. When context is ommitted, special `__global` context is used.
 * 
 * It is created as a service to allow extending with custom names mapping.
 *
 * @module services/oneicon-alias
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

const namesDictionary = {
  __global: {
    role_holders: 'role-holders',
  },
  resourceInfo: {
    group: 'groups',
  },
};

export default Service.extend({
  /**
   * Object in format:
   * ```
   * {
   *   context1: {
   *     keyword1: 'icon-name1',
   *     keyword2: 'icon-name2',
   *     ...
   *   },
   *   context2: {
   *     ...
   *   },
   *   ...
   * }
   * ```
   * Only `context.keyword` path must be unique. Keywords and icon names can duplicate
   * between contexts. `__global` context is special and is used when context
   * is ommitted.
   * @type {Object}
   */
  namesDictionary,

  /**
   * Looks for icon name in `namesDictionary.${context}.${keyword}`. Returns
   * `keyword` if corresponding mapping does not exist.
   * @param {string} context or keyword if there was only one argument
   * @param {string} keyword 
   * @returns {string} oneicon icon name
   */
  getName(context, keyword) {
    if (keyword === undefined) {
      keyword = context;
      context = '__global';
    }
    const name = this.get(`namesDictionary.${context}.${keyword}`);
    return name || keyword;
  },
});
