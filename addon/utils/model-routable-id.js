/**
 * Returns id for passed model, that can be used for routing purposes
 * (inside link-to helper, transitionTo function, etc).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

/**
 * @param {object|string} model
 * @returns {string}
 */
export default function (model) {
  return typeof model === 'string' ? model : get(model ?? {}, 'id');
}
