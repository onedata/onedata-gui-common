/**
 * Computes and stores hashes (short identifiers) for multiple names used for different
 * records.
 *
 * There are use cases when there are multiple records (object) in given set that have:
 * - name - string non unique in given set,
 * - unique key - string unique for records in given set.
 *
 * The example is set of log entries with file names and file paths. Each file has unique
 * path (there are not two files with the same path), but has non-unique name (there can
 * be multiple files with the same name but not in the same directory). In logs views
 * we want to display only names in table, but there can be multiple same names and we
 * don't have space to display a path for each entry. We can then assign a unique short
 * hash that is generated for a long path, and display it to distinguish each file.
 *
 * If there is only one pair of name - unique key (single occurence of name) in the set,
 * a hash is not generated. If more than one name is added to the set, the hash is
 * generated for each unique key.
 *
 * Using instance of this class, you can add a pair of name and unique key (for above
 * example: a pair of file name and its unique path) and use `hashMapping` property
 * to get a unique key (example: long path) -> hash (short identifier) and display
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
   * Maps: name -> array of all known unique keys used by records.
   * @type {Object<string, Array<string>>}
   */
  uniqueKeyMapping: undefined,

  /**
   * Maps: unique name -> hash.
   * You can use and observe this property for reading hash for a unique name.
   * @type {Object<string, string>}
   */
  hashMapping: undefined,

  init() {
    this.setProperties({
      uniqueKeyMapping: {},
      hashMapping: {},
      hashGenerator: new HashGenerator(),
    });
  },

  /**
   * Adds name and unique key pair to the set (see header doc for glossary).
   * Adding the pair can cause generation of hash for unique key if it's needed.
   * If the pair is already in the set, do nothing.
   * @param {string} name
   * @param {string} uniqueKey
   * @returns {void}
   */
  addPair(name, uniqueKey) {
    if (!this.uniqueKeyMapping[name]) {
      this.uniqueKeyMapping[name] = [];
    }
    const currentUniqueKeys = this.uniqueKeyMapping[name];
    if (this.uniqueKeyMapping[name].includes(uniqueKey)) {
      return;
    }
    currentUniqueKeys.push(uniqueKey);
    let isNewHashValueAdded = false;
    if (currentUniqueKeys.length > 1) {
      for (const key of currentUniqueKeys) {
        if (this.hashMapping[key]) {
          continue;
        }
        const hashValue = this.hashGenerator.getHash(key);
        this.hashMapping[key] = hashValue;
        isNewHashValueAdded = true;
      }
    }
    if (isNewHashValueAdded) {
      this.notifyPropertyChange('hashMapping');
    }
  },
});
