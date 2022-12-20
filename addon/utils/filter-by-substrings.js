/**
 * Filter provided collection of any type by searching substrings in strings list
 * evaluated by callback.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

const defaultGetStringsCallback = (record) => get(record, 'name');

/**
 *
 * @param {Array<any>} collection
 * @param {string} searchValue
 * @param {(record: any) => Array<string>} getStringsCallback
 * @returns
 */
export default function filterBySubstrings(
  collection,
  searchValue,
  getStringsCallback = defaultGetStringsCallback,
) {
  if (!collection || typeof getStringsCallback !== 'function') {
    return [];
  }
  const normSearchValue = normalizeValue(searchValue);
  if (!normSearchValue) {
    return collection;
  }
  return collection.filter(record => {
    const recordStrings = getStringsCallback(record);
    if (!Array.isArray(recordStrings)) {
      return false;
    }
    console.log(recordStrings);
    return Boolean(
      recordStrings.find(recordString => recordString?.includes?.(searchValue))
    );
  });
}

function normalizeValue(value) {
  return (value ?? '').trim().toLowerCase();
}
