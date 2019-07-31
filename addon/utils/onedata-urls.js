/**
 * Common utils for manipulating URLs used by Onedata unified and non-unified GUI.
 * 
 * @module utils/onedata-urls
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const onepanelAbbrev = 'onp';
export const onezoneAbbrev = 'ozw';
export const oneproviderAbbrev = 'opw';
export const harvesterAbbrev = 'hrv';

export const onezoneDefaultClusterId = 'onezone';
export const onezoneDefaultRootPath =
  `/${onezoneAbbrev}/${onezoneDefaultClusterId}`;

export const onepanelTestImagePath = getTestImagePath('onepanel');
export const onezoneTestImagePath = getTestImagePath('onezone');
export const oneproviderTestImagePath = getTestImagePath('oneprovider');

/**
 * @param {string} origin 
 * @param {string} emberPath must be path **without** leading slash, it will be
 *  automatically trimmed
 */
export function getOnezoneUrl(origin, emberPath = '') {
  return `${origin}${onezoneDefaultRootPath}/i#/${emberPath.replace(/^\//, '')}`
}

export function getTestImagePath(type) {
  return `/api/v3/${type}/test_image`;
}
