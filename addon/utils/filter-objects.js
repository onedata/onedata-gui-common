/**
 * Filters objects by searching provided `searchString` in values of specified properties.
 *
 * You can use either straightforward string-value properties or arrays of string.
 * In both cases, the object matches if at least one string value (either straightforward
 * in property or among strings in array) is a substring of search value.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

/**
 * @typedef {Object} FilterObjectsOptions
 * @property {string} [stringProperties]
 * @property {Array<string>} [arrayProperties]
 */

const defaultFilterObjectsOptions = {
  stringProperties: ['name'],
  arrayProperties: [],
};

/**
 * @param {Array<Object>} collection
 * @param {string} searchValue
 * @param {FilterObjectsOptions} options
 * @returns {Array<Object>}
 */
export default function filterObjects(
  collection,
  searchValue,
  options,
) {
  const normOptions = { ...defaultFilterObjectsOptions, ...options };
  if (!searchValue) {
    return collection;
  }
  const normSearchValue = normalizeValue(searchValue);
  const normSearchTags = normSearchValue.split(/\s+/);

  return collection.filter(record => {
    for (const stringProperty of normOptions.stringProperties) {
      const propValue = normalizeValue(get(record, stringProperty));
      if (propValue.includes(normSearchValue)) {
        return true;
      }
    }

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
}

function normalizeValue(value) {
  return (value ?? '').trim().toLowerCase();
}
