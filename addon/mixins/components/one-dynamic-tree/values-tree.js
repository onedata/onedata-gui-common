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
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';

import Mixin from '@ember/object/mixin';
import { typeOf } from '@ember/utils';

export default Mixin.create({
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
    const tmpRoot = {
      name: '',
      subtree: definition,
    };
    const overrideValues = this.get('overrideValues');
    return this._buildValuesNode(tmpRoot, useDefaults, overrideValues);
  },

  /**
   * Creates values tree node.
   * @param {Object} node A node.
   * @param {boolean} useDefaults Fill nodes with default values.
   * @param {Object} overrideValues If passed, it will be used as a source of
   *   default values instead of tree definition.
   * @returns {Ember.Object} A values node.
   */
  _buildValuesNode(node, useDefaults, overrideValues) {
    if (!node.subtree) {
      if (node.field) {
        if (useDefaults) {
          if (overrideValues !== undefined) {
            return overrideValues;
          } else {
            return node.field.defaultValue !== undefined ?
              node.field.defaultValue : null;
          }
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } else {
      const values = EmberObject.create();
      node.subtree.forEach((subnode) => {
        const subnodeValues = this._buildValuesNode(
          subnode,
          useDefaults,
          get(overrideValues || {}, subnode.name)
        );
        if (subnodeValues !== undefined) {
          values.set(subnode.name, subnodeValues);
        }
      });
      return values;
    }
  },

  /**
   * Copies values from actual values to treeTo. Nodes values are copied only if
   * node structure is the same in both trees. treeTo must be an Ember.Object.
   * @param {Object|Ember.Object} treeFrom
   * @param {Ember.Object} treeTo
   */
  _mergeValuesTrees(treeFrom, treeTo) {
    this._mergeValuesNodeCopy(treeTo, treeFrom);
    return treeTo;
  },

  /**
   * Copies (merges) values from passed node to another.
   * @param {Ember.Object} nodeTo
   * @param {Object|Ember.Object} treeFrom
   */
  _mergeValuesNodeCopy(nodeTo, nodeFrom) {
    const objectTypes = ['instance', 'object'];
    Object.keys(nodeFrom).forEach((subnodeName) => {
      const subnodeToValue = get(nodeTo, subnodeName);
      const subnodeFromValue = get(nodeFrom, subnodeName);
      if (subnodeToValue !== undefined) {
        if (objectTypes.indexOf(typeOf(subnodeToValue)) !== -1 &&
          objectTypes.indexOf(typeOf(subnodeFromValue)) !== -1) {
          this._mergeValuesNodeCopy(subnodeToValue, subnodeFromValue);
        } else if (objectTypes.indexOf(typeOf(subnodeToValue)) === -1 &&
          objectTypes.indexOf(typeOf(subnodeFromValue)) === -1) {
          nodeTo.set(subnodeName, subnodeFromValue);
        }
      }
    });
  },

  /**
   * Converts values tree of Ember objects into tree of native objects.
   * @returns {Object} values as native object
   */
  dumpValues() {
    return this._dumpNodeValues(this.get('values'));
  },

  /**
   * Converts values node to tree of native objects.
   * @returns {Object} values as native object
   */
  _dumpNodeValues(node) {
    if (typeOf(node) !== 'instance') {
      return node;
    } else {
      const objectDump = {};
      Object.keys(node).forEach((nodeKey) => {
        objectDump[nodeKey] = this._dumpNodeValues(node.get(nodeKey));
      });
      return objectDump;
    }
  },
});
