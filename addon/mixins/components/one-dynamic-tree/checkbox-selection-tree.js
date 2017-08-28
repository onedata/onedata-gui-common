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
 * @module mixins/components/one-dynamic-tree/checkbox-selection-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Mixin.create({
  /**
   * Tree of checkbox selection state.
   * @type {Ember.Object}
   */
  _checkboxSelectionTree: null,

  /**
   * Creates tree with tree checkboxes selection states
   */
  _buildCheckboxSelectionTree() {
    let _fieldsTree = this.get('_fieldsTree');
    let buildNodeCheckboxesTree = (node) => {
      if (node.get('_isField') && node.get('type') !== 'checkbox') {
        // field, but not checkbox
        return undefined;
      }
      let checkboxNode = Ember.Object.create({
        value: undefined,
        nodes: null,
      });
      if (node.get('_isField')) {
        // checkbox field
        return checkboxNode;
      }
      else {
        // possible parent of checkbox fields
        let checkboxSubnodes = Object.keys(node).reduce((subnodes, subnodeName) => {
          let _checkboxSubnodes = buildNodeCheckboxesTree(node.get(subnodeName));
          if (_checkboxSubnodes) {
            subnodes.set(subnodeName, _checkboxSubnodes);
          }
          return subnodes;
        }, Ember.Object.create());

        if (Object.keys(checkboxSubnodes).length > 0) {
          // has some checkbox fields in deeper nodes
          checkboxNode.set('nodes', checkboxSubnodes);
          return checkboxNode;
        } else {
          // no checkbox fields in subtree
          return undefined;
        }
      }
    }
    let checkboxSelectionTree = buildNodeCheckboxesTree(_fieldsTree);
    this._fillCheckboxSelectionTree(checkboxSelectionTree);
    this.set('_checkboxSelectionTree', checkboxSelectionTree);
  },

  /**
   * Recalculates selection tree state
   * @param {Ember.Object} checkboxSelectionTree checkbox selection tree to fill
   */
  _fillCheckboxSelectionTree(checkboxSelectionTree) {
    let values = this.get('values');
    if (!checkboxSelectionTree) {
      checkboxSelectionTree = this.get('_checkboxSelectionTree');
    }
    let fillNode = (node, path) => {
      let value;
      if (!node.get('nodes')) {
        // is checkbox
        value = values.get(path);
      } else {
        // is checkbox parent
        let subnodes = node.get('nodes');
        value = Object.keys(subnodes).reduce((value, subnodeName) => {
          let subnodePath = path ? `${path}.${subnodeName}` : subnodeName;
          return value && fillNode(subnodes.get(subnodeName), subnodePath);
        }, true);
      }
      node.set('value', value)
      return value;
    }
    fillNode(checkboxSelectionTree, '', '');
  },

  actions: {
    /**
     * Selects/deselects all nested checkboxes in `path` node.
     * @param {string} path A path to the checkboxes parent node.
     * @param {boolean} value A value for checkboxes.
     */
    selectNestedCheckboxes(path, value) {
      let {
        values,
        _fieldsTree,
      } = this.getProperties('values', '_fieldsTree');

      let changeCheckboxes = (node) => {
        if (node.get('_isField')) {
          if (node.get('type') === 'checkbox') {
            let name = node.get('name');
            values.set(name, value);
            this._markFieldAsModified(name);
          }
        } else {
          Object.keys(node).forEach((subnodeName) => {
            changeCheckboxes(node.get(subnodeName));
          });
        }
      }
      changeCheckboxes(_fieldsTree.get(path));
      this.valuesHaveChanged(true);
    }
  },
});
