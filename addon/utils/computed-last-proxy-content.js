/**
 * Get access to last resolved value of PromiseObject.
 * Computed property for this value should be observed to work properly.
 * 
 * @module utils/computed-last-proxy-content
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function computedLastProxyContent(proxyPropertyName) {
  if (!proxyPropertyName) {
    throw new Error('util:computedLastProxyContent: proxyPropertyName cannot be empty');
  }
  const cacheName = `_${proxyPropertyName}Cache`;
  const contentPath = `${proxyPropertyName}.content`;
  const isFulfilledPath = `${proxyPropertyName}.isFulfilled`;
  return computed(isFulfilledPath, function lastProxyContent() {
    if (this.get(isFulfilledPath)) {
      return this.set(cacheName, this.get(contentPath));
    } else {
      return this.get(cacheName);
    }
  });
}
