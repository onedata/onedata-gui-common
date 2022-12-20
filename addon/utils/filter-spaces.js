/**
 * Common filtering function for spaces collection using search string.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties } from '@ember/object';
import filterBySubstrings from './filter-by-substrings';
import _ from 'lodash';

const defaultFilterSpacesOptions = {
  stringProperties: [
    'name',
    'description',
    'organizationName',
  ],
  arrayProperties: ['tags'],
};

/**
 * @param {Array<Object>} collection
 * @param {string} searchValue
 * @param {FilterSpacesOptions} options
 * @returns {Array<Object>}
 */
export default function filterSpaces(
  collection,
  searchValue,
  options,
) {
  const normOptions = options ? {
    ...defaultFilterSpacesOptions,
    ...options,
  } : defaultFilterSpacesOptions;
  const normSearchValue = normalizeValue(searchValue);
  if (!normSearchValue) {
    return collection;
  }
  const normSearchTags = normSearchValue.split(/\s+/);

  const getStringsCallback = (space) =>
    Object.values(getProperties(space, ...normOptions.stringProperties));
  const byStringsCollection =
    filterBySubstrings(collection, normSearchValue, getStringsCallback);

  if (byStringsCollection.length === collection.length) {
    return byStringsCollection;
  }

  const byTagsCollection = collection.filter(record => {
    for (const arrayProperty of normOptions.arrayProperties) {
      const propValue = get(record, arrayProperty);
      if (Array.isArray(propValue)) {
        const stringValues = propValue.map(tag => normalizeValue(tag));
        for (const searchTag of normSearchTags) {
          if (stringValues.find(tag => tag.includes(searchTag))) {
            return true;
          }
        }
      }
    }
    return false;
  });

  return _.uniq([...byStringsCollection, ...byTagsCollection]);
}

function normalizeValue(value) {
  return (value ?? '').trim().toLowerCase();
}
