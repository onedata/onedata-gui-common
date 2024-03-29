/**
 * A mixin that provides 'select all' functionality to the one-dynamic-tree component.
 * It works using tree data structure (_checkboxSelectionTree property) to store
 * data about selection state. That tree has these properties:
 * * each node object has properties `nodes` and `value`.
 *   `nodes` is a object with pairs `subnodeName: subnode`,
 * * leaf represents a checkbox. Its `value` equals checkbox selection state,
 *   `nodes` property is empty.
 * * each parent `value` is calculated using `AND` operation on `value`
 *   properties of its `nodes` objects. So if all children have `value==true`,
 *   then parent has `value==true`, otherwise `value==false`.
 * * only nodes which represent checkbox fields or their parents are in the tree.
 * * node name is taken from tree definition.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * Tree of checkbox selection state.
   * @type {Ember.Object}
   */
  _checkboxSelectionTree: null,

  /**
   * Creates tree with tree checkboxes selection states
   */
  _buildCheckboxSelectionTree() {
    const _fieldsTree = this.get('_fieldsTree');
    const checkboxSelectionTree = this._buildNodeCheckboxesTree(_fieldsTree);
    this._fillCheckboxSelectionTree(checkboxSelectionTree);
    this.set('_checkboxSelectionTree', checkboxSelectionTree);
  },

  /**
   * Creates tree with node checkboxes selection states
   * @returns {EmberObject}
   */
  _buildNodeCheckboxesTree(node) {
    if (node.get('_isField') && (node.get('type') !== 'checkbox')) {
      // field, but not checkbox or disabled
      return undefined;
    }
    const checkboxNode = EmberObject.create({
      value: undefined,
      nodes: null,
    });
    if (node.get('_isField')) {
      // checkbox field
      return checkboxNode;
    } else {
      // possible parent of checkbox fields
      const checkboxSubnodes = Object.keys(node).reduce((subnodes, subnodeName) => {
        const _checkboxSubnodes =
          this._buildNodeCheckboxesTree(node.get(subnodeName));
        if (_checkboxSubnodes) {
          subnodes.set(subnodeName, _checkboxSubnodes);
        }
        return subnodes;
      }, EmberObject.create());

      if (Object.keys(checkboxSubnodes).length > 0) {
        // has some checkbox fields in deeper nodes
        checkboxNode.set('nodes', checkboxSubnodes);
        return checkboxNode;
      } else {
        // no checkbox fields in subtree
        return undefined;
      }
    }
  },

  /**
   * Recalculates selection tree state
   * @param {Ember.Object} [checkboxSelectionTree=undefined] checkbox selection
   * tree to fill
   */
  _fillCheckboxSelectionTree(checkboxSelectionTree) {
    const normalizedCheckboxSelectionTree =
      checkboxSelectionTree ?? this._checkboxSelectionTree;
    if (!normalizedCheckboxSelectionTree) {
      return;
    }
    this._fillCheckboxSelectionTreeNode(normalizedCheckboxSelectionTree, '', '');
  },

  _fillCheckboxSelectionTreeNode(node, path) {
    const values = this.get('values');
    let value;
    if (!node.get('nodes')) {
      // is checkbox
      value = values.get(path);
    } else {
      // is checkbox parent
      const subnodes = node.get('nodes');
      value = Object.keys(subnodes).reduce((value, subnodeName) => {
        const subnodePath = path ? `${path}.${subnodeName}` : subnodeName;
        const subnodeValue = this._fillCheckboxSelectionTreeNode(
          subnodes.get(subnodeName), subnodePath
        );
        if (value === null) {
          return subnodeValue;
        } else {
          return value === subnodeValue ? value : 2;
        }
      }, null);
    }
    node.set('value', value);
    return value;
  },

  /**
   * Selects/deselects all nested checkboxes in node.
   * @param {Ember.Object} node A node.
   * @param {boolean} value A value for checkboxes.
   */
  _changeCheckboxesState(node, value) {
    const values = this.get('values');
    if (node.get('_isField')) {
      if (node.get('type') === 'checkbox' &&
        !this.isPathDisabled(node.get('name'))) {
        const name = node.get('name');
        values.set(name, value);
        this._markFieldAsModified(name);
      }
    } else {
      Object.keys(node).forEach((subnodeName) => {
        this._changeCheckboxesState(node.get(subnodeName), value);
      });
    }
  },

  actions: {
    /**
     * Selects/deselects all nested checkboxes in `path` node.
     * @param {string} path A path to the checkboxes parent node.
     * @param {boolean} value A value for checkboxes.
     */
    selectNestedCheckboxes(path, value) {
      const _fieldsTree = this.get('_fieldsTree');
      this._changeCheckboxesState(_fieldsTree.get(path), value);
      this.valuesHaveChanged(true);
    },
  },
});
