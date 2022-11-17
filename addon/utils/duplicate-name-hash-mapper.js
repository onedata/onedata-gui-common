/**
 * Computes and stores hashes (short identifiers) for multiple names used for different
 * records.
 *
 * There are use cases when there are multiple records (object) in given set that have:
 * - name - string non unique in given set,
 * - unique name - string unique for records in given set.
 *
 * The example is set of log entries with file names and file paths. Each file has unique
 * path (there are not two files with the same path), but has non-unique name (there can
 * be multiple files with the same name but not in the same directory). In logs views
 * we want to display only names in table, but there can be multiple same names and we
 * don't have space to display a path for each entry. We can then assign a unique short
 * hash that is generated for a long path, and display it to distinguish each file.
 *
 * If there is only one pair of name - unique name (single occurence of name) in the set,
 * a hash is not generated. If more than one name is added to the set, the hash is
 * generated for the unique name.
 *
 * Using instance of this class, you can add a pair of name and unique name (for above
 * example: a pair of file name and its unique path) and use `hashMapping` property
 * to get a unique name (example: long path) -> hash (short identifier) and display
 * it in the logs table.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import HashGenerator from 'onedata-gui-common/utils/hash-generator';

export default EmberObject.extend({
  /**
   * @type {Utils.HashGenerator}
   */
  hashGenerator: undefined,

  /**
   * Maps: name -> array of all known unique names used by records.
   * @type {Object<string, Array<string>>}
   */
  uniqueNamesMapping: undefined,

  /**
   * Maps: unique name -> hash.
   * You can use and observe this property for reading hash for a unique name.
   * @type {Object<string, string>}
   */
  hashMapping: undefined,

  init() {
    this.setProperties({
      uniqueNamesMapping: {},
      hashMapping: {},
      hashGenerator: new HashGenerator(),
    });
  },

  /**
   * Adds name and unique name pair to the set (see header doc for glossary).
   * Adding the pair can cause generation of hash for unique name if it's needed.
   * If the pair is already in the set, do nothing.
   * @param {string} name
   * @param {string} uniqueName
   * @returns {void}
   */
  addPair(name, uniqueName) {
    if (!this.uniqueNamesMapping[name]) {
      this.uniqueNamesMapping[name] = [];
    }
    const currentUniqueNames = this.uniqueNamesMapping[name];
    if (this.uniqueNamesMapping[name].includes(uniqueName)) {
      return;
    }
    currentUniqueNames.push(uniqueName);
    let isNewHashValueAdded = false;
    if (currentUniqueNames.length > 1) {
      for (const knownValue of currentUniqueNames) {
        if (this.hashMapping[knownValue]) {
          continue;
        }
        const hashValue = this.hashGenerator.getHash(knownValue);
        this.hashMapping[knownValue] = hashValue;
        isNewHashValueAdded = true;
      }
    }
    if (isNewHashValueAdded) {
      this.notifyPropertyChange('hashMapping');
    }
  },
});
