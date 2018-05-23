import { get } from '@ember/object';

/**
 * 
 * @param {Array<any>} array 
 * @param {string} defaultEntityId
 * @param {string} [property]
 */
export default function sortByPropertyOrDefault(array, defaultEntityId, property = 'name') {
  return array.sort((a, b) => {
    if (get(a, 'entityId') === defaultEntityId) {
      return -1;
    } else if (get(b, 'entityId') === defaultEntityId) {
      return 1;
    } else {
      const aVal = get(a, property);
      const bVal = get(b, property);
      if (aVal < bVal) {
        return -1;
      } else if (aVal === bVal) {
        return 0;
      } else {
        return 1;
      }
    }
  });

}
