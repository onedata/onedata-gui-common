// FIXME: experimental util - maybe it should have different, more-precise name, jsdoc
// FIXME: flexible properties to search in?

import { get } from '@ember/object';

/**
 * @typedef {Object} FilterObjectsOptions
 * @param {boolean} [searchInTags=true]
 */

const defaultFilterObjectsOptions = {
  searchInTags: true,
  stringProperties: ['name'],
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

    if (normOptions.searchInTags) {
      const recordTags = get(record, 'tags');
      if (Array.isArray(recordTags)) {
        const tags = (get(record, 'tags') ?? [])
          .map(tag => normalizeValue(tag));
        for (const searchTag of normSearchTags) {
          if (tags.find(tag => tag.includes(searchTag))) {
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
