// FIXME: experimental util - maybe it should have different, more-precise name, jsdoc
// FIXME: flexible properties to search in?

import { get } from '@ember/object';

export default function filterObjects(collection, searchValue) {
  if (!searchValue) {
    return collection;
  }
  const normSearchValue = normalizeValue(searchValue);
  const normSearchTags = normSearchValue.split(/\s+/);

  return collection.filter(record => {
    const name = normalizeValue(get(record, 'name'));
    if (name.includes(normSearchValue)) {
      return true;
    }
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

    return false;
  });
}

function normalizeValue(value) {
  return (value ?? '').trim().toLowerCase();
}
