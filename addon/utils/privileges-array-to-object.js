/**
 * Converts array of privileges to a tree of categorized privileges.
 *
 * @module utils/privileges-array-to-object
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @param {Array<string>} arr Array of privileges names, that are available for
 *  some entity. Example: ``['privilege1Name', 'privilege3Name']``
 * @param {Array<Object>} privilegesGroups Grouped privileges names - schema of
 *   privileges tree. Example:
 *   ```
 *   [
 *     {
 *       groupName: 'privilegesGroup',
 *       privileges: [
 *         'privilege1Name',
 *         'privilege2Name',
 *       ],
 *     }, {
 *       groupName: 'privilegesGroup2',
 *       privileges: [
 *         'privilege3Name',
 *       ],
 *     }
 *   ]
 *   ```
 * @returns {Object} Privileges tree. Example:
 * ```
 * {
 *   privilegesGroup: {
 *     privilege1Name: true,
 *     privilege2Name: false,
 *   },
 *   privilegesGroup2: {
 *     privilege3Name: true,
 *   },
 * }
 * ```
 */
export default function privilegesArrayToObject(arr, privilegesGroups) {
  return arr ? privilegesGroups.reduce((tree, group) => {
    tree[group.groupName] = group.privileges.reduce((groupPerms, privilege) => {
      groupPerms[privilege.name] = arr.includes(privilege.name);
      return groupPerms;
    }, {});
    return tree;
  }, {}) : {};
}
