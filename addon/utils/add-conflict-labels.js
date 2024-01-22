/**
 * A function that adds a ``conflictLabel`` property (or custom property with
 * name from `conflictLabelProperty` - see util parameters) for each conflicting
 * record in some array.
 *
 * For example, we can have two spaces with the same name. This function will add
 * a property that helps to dinstinguish these two.
 *
 * NOTE: ported from ember-cli-onedata-common
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, get } from '@ember/object';

import conflictIds from 'onedata-gui-common/utils/conflict-ids';
import _ from 'lodash';

/**
 * Assigns a `conflictLabel` property (or custom property with name
 * from`conflictLabelProperty`) for each record in array. See utils/conflict-ids
 * for details about conflict ids algorithm.
 * @param {Array<Object | EmberObject>} records
 * @param {string} conflictProperty
 * @param {string} diffProperty
 * @param {string} [defaultId]
 * @param {string} [conflictLabelProperty]
 * @returns {Array<Object | EmberObject>}
 */
export default function addConflictLabels(
  records,
  conflictProperty = 'name',
  diffProperty = 'id',
  defaultId = undefined,
  conflictLabelProperty = 'conflictLabel'
) {
  const conflictPropertyMap = groupConflictingRecords(records, conflictProperty);

  conflictPropertyMap.forEach(conflictingRecords => {
    assignConflictLabels(
      conflictingRecords,
      diffProperty,
      defaultId,
      conflictLabelProperty
    );
  });

  return records;
}

/**
 * Maps: conflictValue => Array of conflicting records
 * @returns {Map<string, Ember.Object[]|Object[]>}
 */
function groupConflictingRecords(records, conflictProperty) {
  const conflictPropertyMap = new Map();
  records.forEach(record => {
    const conflictValue = get(record, conflictProperty);
    if (conflictPropertyMap.has(conflictValue)) {
      conflictPropertyMap.get(conflictValue).push(record);
    } else {
      conflictPropertyMap.set(conflictValue, [record]);
    }
  });
  return conflictPropertyMap;
}

/**
 * For collection of conflicting records, compute its conflict label
 * and assign to each record
 * @param {object[]|Ember.Object[]} conflictingRecords
 * @param {string} diffProperty an object property that is used for computing label
 * @param {string} defaultId
 * @param {string} conflictLabelProperty
 */
function assignConflictLabels(
  conflictingRecords,
  diffProperty,
  defaultId,
  conflictLabelProperty
) {
  if (conflictingRecords.length > 1) {
    const conflictLabels = conflictIds(
      _.map(conflictingRecords, r => get(r, diffProperty))
    );
    // removing conflict labels for defaultId
    for (let i = 0; i < conflictingRecords.length; i += 1) {
      const record = conflictingRecords[i];
      const currentConflictLabel = get(record, conflictLabelProperty);
      if (currentConflictLabel) {
        if (
          conflictLabels[i] !== null &&
          conflictLabels[i] > currentConflictLabel.length
        ) {
          set(record, conflictLabelProperty, conflictLabels[i]);
        }
      } else {
        set(
          record,
          conflictLabelProperty,
          get(record, diffProperty) === defaultId ? null : conflictLabels[i]
        );
      }
    }
  } else if (conflictingRecords.length === 1) {
    set(conflictingRecords[0], conflictLabelProperty, undefined);
  }
}
