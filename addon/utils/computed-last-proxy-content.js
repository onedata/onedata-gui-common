/**
 * Get access to last resolved value of PromiseObject.
 * Computed property for this value should be observed to work properly.
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

/**
 * @typedef {Object} ComputedLastProxyContentOptions
 * @property {boolean} nullOnReject When set to true, if promise fails, the computed
 *   property returns null instead of last known value.
 */

/**
 *
 * @param {string} proxyPropertyName
 * @param {ComputedLastProxyContentOptions} [options]
 * @returns
 */
export default function computedLastProxyContent(proxyPropertyName, options = {}) {
  if (!proxyPropertyName) {
    throw new Error('util:computedLastProxyContent: proxyPropertyName cannot be empty');
  }
  const cacheName = `_${proxyPropertyName}Cache`;
  const contentPath = `${proxyPropertyName}.content`;
  const isFulfilledPath = `${proxyPropertyName}.isFulfilled`;
  const isRejectedPath = `${proxyPropertyName}.isRejected`;
  const observedProperties = [contentPath, isFulfilledPath];
  if (options.nullOnReject) {
    observedProperties.push(isRejectedPath);
  }
  return computed(...observedProperties, function lastProxyContent() {
    if (options.nullOnReject && this.get(isRejectedPath)) {
      return null;
    } else if (this.get(isFulfilledPath)) {
      return this.set(cacheName, this.get(contentPath));
    } else {
      return this.get(cacheName);
    }
  });
}
