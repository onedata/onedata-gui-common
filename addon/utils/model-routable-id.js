// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Returns id for passed model, that can be used for routing purposes
 * (inside link-to helper, transitionTo function, etc).
 *
 * @module utils/model-routable-id
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

/**
 * @param {object|string} model
 * @returns {string}
 */
export default function (model) {
  model = model || {};
  return typeof model === 'string' ? model : get(model, 'id');
}
