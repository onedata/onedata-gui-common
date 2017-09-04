/**
 * A mixin that provides fields tree operations for the one-dynamic-tree 
 * component. To store data about fields, a tree data structure is used.
 * That tree has properties:
 * * each leaf is a field (field state representation),
 * * fields are placed in tree using tree definition. E.g. if field 'name'
 *   is in branch 'basic' of 'user', then it can be found by 
 *   `this.get('_fieldsTree.user.basic.name')`.
 * * fields have `_isField: true`, parents do not.
 * 
 * @module mixins/components/one-dynamic-tree/fields-tree
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed,
} = Ember;

export default Ember.Mixin.create({
  /**
   * Tree fields.
   * @type {Ember.Object}
   */
  _fieldsTree: computed('definition', function () {
    return this._buildFieldsTree();
  }),

  /**
   * Resets field to the initial state (not changed, after no validation)
   * @param {Ember.Object} field
   */
  _resetField(field) {
    field.setProperties({
      changed: false,
      isValid: false,
      isInvalid: false,
      message: '',
    });
  },

  /**
   * Marks a field (identified by path) as modified.
   * @param {string} path A path to the modified field in fields tree. 
   */
  _markFieldAsModified(path) {
    this.set(`_fieldsTree.${path}.changed`, true);
  },

  /**
   * Creates new fields tree from definition.
   */
  _buildFieldsTree() {
    let definition = this.get('definition');
    let prepareNodeFields = (node, parentName) => {
      let name = parentName + (parentName ? '.' : '') + node.name;
      if (!node.subtree) {
        if (node.field) {
          let field = Ember.Object.create(node.field);
          field.setProperties({
            _isField: true,
            name: name,
          });
          this._resetField(field);
          field.set('changed', true);
          return field;
        } else {
          return undefined;
        }
      } else {
        let fields = Ember.Object.create();
        node.subtree.forEach((subnode) => {
          let subnodeFields = prepareNodeFields(subnode, name);
          if (subnodeFields !== undefined) {
            fields.set(subnode.name, subnodeFields);
          }
        });
        return Object.keys(fields).length > 0 ? fields : undefined;
      }
    }
    let tmpRoot = {
      name: '',
      subtree: definition
    };
    let fields = prepareNodeFields(tmpRoot, '')
    return fields;
  },

  /**
   * Resets fields state.
   * @param {string} [path] A path to a fields node. If specified, only that node
   * (and all subnodes) will be reset.
   */
  _resetFieldsTree(path) {
    let resetNode = (node) => {
      if (node.get('_isField')) {
        this._resetField(node);
      } else {
        // Not field - iterate through all subnodes
        Object.keys(node).forEach((subnodeName) =>
          resetNode(node.get(subnodeName))
        );
      }
    };
    resetNode(this.get('_fieldsTree' + (path ? '.' + path : '')));
  },
});
