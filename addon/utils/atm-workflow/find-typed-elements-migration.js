/**
 * Finds migration from one collection of typed element to another trying to
 * preserve as much sense of the `from` in the `to` collection as possible.
 * Migration (here) is a mapping `fromElement.name` -> `toElement.name | null`.
 * `null` means that there is no corresponding element in `to` collection for
 * that specific `from` collection element. Migration rules:
 * 1. When there are elements with corresponding names in `from` and `to`
 *    collections, then these are added to the migration.
 * 2. For the rest of the elements: when there is exactly one element in `to`
 *    collection with the same type as an element from `from` collection, and
 *    there is only one element of that type in `from` collection, then that
 *    pair is added to the migration.
 * 3. The rest of unmatched `from` elements have migration to `null`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {AtmTypedElement}
 * @param {string} name
 * @param {AtmDataSpec} dataSpec
 */

/**
 * @param {Array<AtmTypedElement>} fromElements
 * @param {Array<AtmTypedElement>} toElements
 * @returns {Object<string, string | null>}
 */
export default function findTypedElementsMigration(fromElements, toElements) {
  const migration = {};

  const fromNameToDataSpec = fromElements.reduce((acc, { name, dataSpec }) => {
    acc[name] = dataSpec;
    return acc;
  }, {});
  const toNameToDataSpec = toElements.reduce((acc, { name, dataSpec }) => {
    acc[name] = dataSpec;
    return acc;
  }, {});

  // Migrate elements with the same name before and after migration
  for (const nameToMigrate of Object.keys(fromNameToDataSpec)) {
    if (nameToMigrate in toNameToDataSpec) {
      migration[nameToMigrate] = nameToMigrate;
      delete fromNameToDataSpec[nameToMigrate];
      delete toNameToDataSpec[nameToMigrate];
    }
  }

  // Migrate elements with the same data spec before and after migration
  for (const nameToMigrate of Object.keys(fromNameToDataSpec)) {
    // Try to find any other element, that has the same data spec in the `from`
    // collection as the current one. If there are some, then we won't know
    // which one of them should be assigned to which new spec - migration is not
    // possible.
    const otherNamesToMigrateWithTheSameDataSpec =
      Object.keys(fromNameToDataSpec).filter((name) =>
        name !== nameToMigrate && _.isEqual(
          fromNameToDataSpec[name],
          fromNameToDataSpec[nameToMigrate]
        )
      );
    // Find all matching places to reuse current state. If there is more than
    // one, then migration is not possible as we don't know which one should be
    // used.
    const matchingTargetNames = Object.keys(toNameToDataSpec).filter((name) =>
      _.isEqual(toNameToDataSpec[name], fromNameToDataSpec[nameToMigrate])
    );
    if (
      !otherNamesToMigrateWithTheSameDataSpec.length &&
      matchingTargetNames.length === 1
    ) {
      migration[nameToMigrate] = matchingTargetNames[0];
      delete fromNameToDataSpec[nameToMigrate];
      delete toNameToDataSpec[matchingTargetNames[0]];
    } else {
      migration[nameToMigrate] = null;
    }
  }

  return migration;
}
