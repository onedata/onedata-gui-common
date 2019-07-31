/**
 * Place for common constants and utils for integrating apps with iframe.
 * See `one-embedded-container` and `one-embedded-component` in host and guest
 * projects.
 * 
 * @module utils/one-embedded-common
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const sharedObjectName = 'appProxy';

/**
 * Where properties are stored in shared object
 * @type {string}
 */
export const sharedDataPropertyName = 'data';

export function setSharedProperty(sharedObject, propertyName, value) {
  return sharedObject[sharedDataPropertyName][propertyName] = value;
}

export function getSharedProperty(sharedObject, propertyName) {
  return sharedObject[sharedDataPropertyName][propertyName];
}
