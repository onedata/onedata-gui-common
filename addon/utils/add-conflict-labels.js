/**
 * A function that adds a ``conflictLabel`` property for each conflicting record
 * in some array.
 * 
 * For example, we can have two spaces with the same name. This function will add
 * a property that helps to dinstinguish these two.
 *
 * NOTE: ported from ember-cli-onedata-common
 *
 * @module utils/add-conflict-labels
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, get } from '@ember/object';

import conflictIds from 'onedata-gui-common/utils/conflict-ids';
import _ from 'lodash';

/**
 * Assigns a `conflictLabel` property for each record in array.
 * See utils/conflict-ids for details about conflict ids algorithm.
 * @param {Array.Object|Array.EmberObject} records 
 * @param {string} conflictProperty 
 * @param {string} diffProperty 
 * @param {string} [defaultId]
 */
export default function addConflictLabels(
  records,
  conflictProperty = 'name',
  diffProperty = 'id',
  defaultId = undefined
) {
  let conflictPropertyMap = groupConflictingRecords(records, conflictProperty);

  conflictPropertyMap.forEach(conflictingRecords => {
    assignConflictLabels(conflictingRecords, diffProperty, defaultId);
  });
}

/**
 * Maps: conflictValue => Array of conflicting records
 * @returns {Map<string, Ember.Object[]|Object[]>}
 */
function groupConflictingRecords(records, conflictProperty) {
  let conflictPropertyMap = new Map();
  records.forEach(record => {
    let conflictValue = get(record, conflictProperty);
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
 */
function assignConflictLabels(conflictingRecords, diffProperty, defaultId) {
  if (conflictingRecords.length > 1) {
    let conflictLabels = conflictIds(_.map(conflictingRecords, r => get(r, diffProperty)));
    // removing conflict labels for defaultId
    for (let i = 0; i < conflictingRecords.length; i += 1) {
      let record = conflictingRecords[i];
      const currentConflictLabel = get(record, 'conflictLabel');
      if (currentConflictLabel) {
        if (conflictLabels[i] !== null && conflictLabels[i] > currentConflictLabel.length) {
          set(record, 'conflictLabel', conflictLabels[i]);
        }
      } else {
        set(
          record,
          'conflictLabel',
          get(record, diffProperty) === defaultId ? null : conflictLabels[i]
        );
      }
    }
  }
}
