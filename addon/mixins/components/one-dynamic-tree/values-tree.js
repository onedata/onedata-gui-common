/**
 * A mixin that provides values tree operations for the one-dynamic-tree 
 * component. To store value, a tree data structure is used. That tree has 
 * properties:
 * * each leaf is a value,
 * * values are placed in tree using tree definition. E.g. if field 'name'
 *   is in branch 'basic' of 'user', then its value can be found by 
 *   `this.get('values.user.basic.name')`.
 * 
 * @module mixins/components/one-dynamic-tree/values-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  typeOf
} = Ember;

export default Ember.Mixin.create({
  /**
   * Values tree.
   * @type {Ember.Object}
   */
  values: null,

  /**
   * Creates new values tree from definition.
   * @param {Array.Object} definition 
   * @param {boolean} useDefaults 
   */
  _buildEmptyValuesTree(definition, useDefaults = false) {
    let prepareNodeValue = (node) => {
      if (!node.subtree) {
        if (node.field) {
          return (useDefaults && node.field.defaultValue !== undefined) ?
            node.field.defaultValue : null;
        } else {
          return undefined;
        }
      } else {
        let values = Ember.Object.create();
        node.subtree.forEach((subnode) => {
          let subnodeValues = prepareNodeValue(subnode);
          if (subnodeValues !== undefined) {
            values.set(subnode.name, subnodeValues);
          }
        });
        return Object.keys(values).length > 0 ? values : undefined;
      }
    }
    let tmpRoot = {
      name: '',
      subtree: definition
    };
    let values = prepareNodeValue(tmpRoot)
    return values;
  },

  /**
   * Copies values from actual values to treeTo. Nodes values are copied only if
   * node structure is the same in both trees.
   * @param {Ember.Object} treeTo 
   */
  _mergeValuesTrees(treeTo) {
    let copyValues = (nodeTo, nodeFrom) => {
      Object.keys(nodeFrom).forEach((subnodeName) => {
        let subnodeToValue = nodeTo.get(subnodeName);
        let subnodeFromValue = nodeFrom.get(subnodeName);
        if (subnodeToValue !== undefined) {
          if (typeOf(subnodeToValue) === 'instance' &&
            typeOf(subnodeFromValue) === 'instance') {
            copyValues(subnodeToValue, subnodeFromValue);
          } else if (typeOf(subnodeToValue) !== 'instance' &&
            typeOf(subnodeFromValue) !== 'instance') {
            nodeTo.set(subnodeName, subnodeFromValue);
          }
        }
      });
    }
    copyValues(treeTo, this.get('values'));
  },

  /**
   * Converts values tree of Ember objects into tree of native objects.
   * @returns {Object} values as native object
   */
  dumpValues() {
    let nodeToObject = (node) => {
      if (typeOf(node) !== 'instance') {
        return node;
      } else {
        let objectDump = {};
        Object.keys(node).forEach((nodeKey) => {
          objectDump[nodeKey] = nodeToObject(node.get(nodeKey));
        });
        return objectDump;
      }
    };
    return nodeToObject(this.get('values'));
  },
});
