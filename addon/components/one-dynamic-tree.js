/**
 * A component that generates forms in the form of a tree using tree structure 
 * definition in json format. For more information about definition format see 
 * `definition` property comment.
 * 
 * On each input change the component emits changes and validation state using 
 * injected `valuesChanged`, calling it like: 
 * `valuesChanged(treeValues, isValid)` 
 * Passed treeValues object is a plain js object with a similar logical hierarchy 
 * like it is in the tree `definition`. It is a tree data structure where each 
 * object key is a subnode `name` property taken from `definition`. Leaves 
 * of that tree are values from tree fields. 
 * 
 * To support validation, a new component must be created that inherits from 
 * this one and uses a validations mixin. Each validator should point to a path
 * like `values.path.to.the.field` - it is the same format that it was used 
 * for treeValues passed to `valuesChanged`.
 * 
 * Example:
 * Let definition looks like:
 * ```
 * definition: [
 *   {
 *     name: 'node1',
 *     text: 'Node 1',
 *     subtree: [
 *       {
 *         name: 'node11',
 *         text: 'Node 1.1',
 *         field: {
 *           type: 'text',
 *           defaultValue: 'someDefault',
 *           tip: 'Some tip',
 *         },
 *       },
 *     ],
 *   },
 * ]
 * 
 * ...
 * 
 * {{one-dynamic-tree definition=definition valuesChanged=(action "valuesChanged")}}
 * ```
 * 
 * In this case validator should point to: `values.node1.node11`.
 * Value of `node11` field is available through `valuesChanged` injected 
 * action as its first argument under the path `node1.node11`.
 * 
 * The component allows to temporarily disable some fields. It can be set 
 * through `disabledFieldsPaths` property. It is an Ember array with paths 
 * (strings) to fields, which should be disabled. It can be an exact path or 
 * a path to a parent node. In the second case, all fields nested in that 
 * node will be disabled.
 * Disabled state means that:
 * * validation for fields is turned off (after path remove from 
 *   `disabledFieldsPaths`, newly enabled fields are in state `unchanged` - 
 *   may be invalid, but error message is not shown until its content change),
 * * value of fields cannot be changed,
 * * toggles are not taken into account in 'select all' functionality 
 *   (`allowSubtreeCheckboxSelect`)
 * * node content has a lower opacity.
 * 
 * The component provides 'select all' functionality through nodes' 
 * `allowSubtreeCheckboxSelect` property set to true. In that mode, node will 
 * have a toggle which state change will change all nested not-disabled toggles.
 * That toggle is set to true if and only if all nested not-disabled toggles 
 * are checked.
 * 
 * @module components/one-dynamic-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} TreeNode Node object of the one-dynamic-tree
 * @property {string} name id-like property. It must be unique across
 * level of subtree.
 * @property {string} text content of the node.
 * @property {boolean} [allowSubtreeCheckboxSelect=false] if true, node will have 
 * a toggle, that will select all nested toggles.
 * @property {TreeField} [field=undefined] form field
 * @property {Array.TreeNode} subtree nested nodes
 */

/**
 * @typedef {Object} TreeField Field object used in the TreeNode
 * @property {string} type input type
 * @property {boolean} [optional=false] if true, input can be empty
 * @property {*} [defaultValue=undefined] default value for input
 * @property {string} [placeholder=undefined] placeholder
 * @property {string} [example=undefined] example
 * @property {string} [tip=undefined] tip (displayed in tooltip)
 * @property {number} [step=undefined] step in number inputs
 * @property {Array.Object} [options=undefined] options for radio-group field
 * Each option is an object with fields `value` and `label`.
 */

import { empty } from '@ember/object/computed';

import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { A } from '@ember/array';
import layout from '../templates/components/one-dynamic-tree';
import FieldsTree from 'onedata-gui-common/mixins/components/one-dynamic-tree/fields-tree';
import ValuesTree from 'onedata-gui-common/mixins/components/one-dynamic-tree/values-tree';
import CheckboxSelectionTree from 'onedata-gui-common/mixins/components/one-dynamic-tree/checkbox-selection-tree';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';

export default Component.extend(
  ValuesTree, FieldsTree, CheckboxSelectionTree, DisabledPaths, {
    layout,
    classNames: ['one-dynamic-tree'],

    /**
     * Tree definition. It is an array of nodes. Format of nodes can be found
     * in TreeNode type definition.
     * To inject.
     * @type {Array.TreeNode}
     */
    definition: Object.freeze([]),

    /**
     * Values used for comparison to mark nodes as (not)modified
     * @type {Object|undefined}
     */
    compareValues: undefined,

    /**
     * Values used to fill tree form elements. On each change of this property 
     * all tree values will be refreshed with new values.
     * @type {object}
     */
    overrideValues: undefined,

    /**
     * Values changed action. It will get tree values 
     * and validation state as arguments.
     * @type {Function}
     */
    valuesChanged: () => {},

    /**
     * Filter string
     * @type {string}
     */
    searchQuery: '',

    /**
     * Modification state of the tree values
     * @type {Object}
     */
    _modificationTree: Object.freeze({}),

    /**
     * Array of error objects from ember-cp-validations.
     * @type {Array.Object}
     */
    _errors: computed('_fieldsTree', 'validations.errors.[]',
      'disabledFieldsPaths.[]',
      function () {
        let {
          _fieldsTree,
          validations
        } = this.getProperties('_fieldsTree', 'validations');

        // Case when validations are not specified.
        if (!validations) {
          return [];
        }

        // Return an error only if a corresponding field exists in the fields tree
        // and is not disabled.
        return validations.get('errors').filter((error) => {
          let path = error.get('attribute').substring('values.'.length);
          return !!_fieldsTree.get(path) && !this.isPathDisabled(path);
        });
      }
    ),

    /**
     * Validity status of tree values.
     */
    _isValid: empty('_errors'),

    _fieldsObserver: observer('_fieldsTree', 'disabledFieldsPaths.[]', function () {
      this._buildCheckboxSelectionTree();
      this._resetDisabledFields();
      this.valuesHaveChanged(false, false);
    }),

    _valuesPrepareObserver: observer('definition', 'overrideValues', function () {
      let definition = this.get('definition');
      let newValuesTree = this._buildEmptyValuesTree(definition);
      this.set('values', this._mergeValuesTrees(newValuesTree));
    }),

    init() {
      this._super(...arguments);
      if (!this.get('disabledFieldsPaths')) {
        this.set('disabledFieldsPaths', A());
      }
      this.reset();
      this._fieldsObserver();
    },

    /**
     * Called when tree field value has changed.
     * @param {boolean} [checkboxChanged=false] if true, value was changed 
     * using toggle
     * @param {boolean} [emitValues=true] if true, `valuesChanged` parent action
     * will be invoked
     */
    valuesHaveChanged(checkboxChanged = false, emitValues = true) {
      let {
        _isValid,
        valuesChanged,
      } = this.getProperties('_isValid', 'valuesChanged');
      this._recalculateErrors();
      if (checkboxChanged) {
        this._fillCheckboxSelectionTree();
      }
      const valuesDump = this.dumpValues();
      this._updateModificationTree(valuesDump);
      if (emitValues) {
        valuesChanged(this.dumpValues(), _isValid);
      }
    },

    /**
     * Resets tree state.
     */
    reset() {
      let definition = this.get('definition');
      this.set('values', this._buildEmptyValuesTree(definition, true));
      this._resetFieldsTree();
    },

    /**
     * Changes a value in the values tree.
     * @param {string} path Path to the value in the values tree.
     * @param {*} value Value to persist in tree.
     */
    changeValue(path, value) {
      this.set(`values.${path}`, value);
      this._markFieldAsModified(path);
      this.valuesHaveChanged(this.get(`_fieldsTree.${path}.type`) === 'checkbox');
    },

    /**
     * Sets validation information for tree fields
     */
    _recalculateErrors() {
      let {
        _fieldsTree,
        validations,
      } = this.getProperties(
        '_fieldsTree',
        'validations'
      );

      if (!validations) {
        return;
      }
      this._recalculateNodeErrors(_fieldsTree);
    },

    /**
     * Sets validation information for fields tree node
     * @param {Ember.Object} node fields tree node
     */
    _recalculateNodeErrors(node) {
      let {
        values,
        _errors,
      } = this.getProperties(
        'values',
        '_errors',
      );
      if (node.get('_isField')) {
        let error = _errors.filter((error) => {
          return error.get('attribute') === 'values.' + node.get('name');
        });
        error = error.length > 0 ? error[0] : null;
        // show if is not optional or is optional, but not empty
        let emptyValues = [undefined, null, ''];
        let notEmpty = emptyValues.indexOf(values.get(node.get('name'))) === -1;
        let showValidation = node.get('optional') !== true || notEmpty;

        if (['radio-group', 'checkbox'].indexOf(node.get('type')) === -1) {
          if (node.get('changed') && showValidation) {
            node.setProperties({
              isValid: !error,
              isInvalid: !!error,
              message: error ? error.get('message') : ''
            });
          } else {
            node.setProperties({
              isValid: false,
              isInvalid: false,
              message: ''
            });
          }
        }
      } else {
        Object.keys(node).forEach((subnodeName) =>
          this._recalculateNodeErrors(node.get(subnodeName))
        );
      }
    },

    /**
     * Resets all disabled fields.
     */
    _resetDisabledFields() {
      this._resetDisabledFieldsInNode(this.get('_fieldsTree'));
    },

    /**
     * Resets disabled fields in node.
     */
    _resetDisabledFieldsInNode(node) {
      if (node.get('_isField')) {
        if (this.isPathDisabled(node.get('name'))) {
          this._resetField(node);
        }
      } else {
        Object.keys(node).forEach((subnodeName) => {
          this._resetDisabledFieldsInNode(node.get(subnodeName));
        });
      }
    },

    /**
     * Updates modification tree to mark nodes as modified
     * @param {Object} values 
     */
    _updateModificationTree(values) {
      const compareValues = this.get('compareValues');
      const modificationTree = {
        nodes: {},
      };
      modificationTree.isModified =
        this._updateModificationTreeNode(values, compareValues || {}, modificationTree);
      this.set('_modificationTree', modificationTree);
    },

    _updateModificationTreeNode(node, compareNode, modificationNode) {
      let isModified = false;
      Object.keys(node).forEach(nodeKey => {
        const nodeValue = node[nodeKey];
        const compareValue = compareNode[nodeKey];
        const modificationSubnode = {
          nodes: {},
        };
        modificationNode.nodes[nodeKey] = modificationSubnode;
        if (typeof nodeValue !== 'object' || nodeValue === null) {
          modificationSubnode.isModified = compareValue === undefined ?
            false : nodeValue !== compareValue;
        } else {
          modificationSubnode.isModified = this._updateModificationTreeNode(
            nodeValue,
            compareValue || {},
            modificationSubnode
          );
        }
        isModified = isModified || modificationSubnode.isModified;
      });
      return isModified;
    },

    actions: {
      /**
       * Changes a value in the values tree.
       * @param {string} path Path to the value in the values tree.
       * @param {*} value Value to persist in tree.
       */
      inputValueChanged(path, value) {
        this.changeValue(path, value);
      },

      /**
       * Marks an input as 'changed' after focus out event.
       * @param {string} path Path to the value in the values tree.
       */
      inputFocusedOut(path) {
        this._markFieldAsModified(path);
        this.valuesHaveChanged(false, false)
      },
    }
  }
);
