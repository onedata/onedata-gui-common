import Ember from 'ember';
import layout from '../templates/components/one-dynamic-tree';

const {
  computed,
  observer,
  typeOf,
  on,
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['one-dynamic-tree'],

  /**
   * Tree definition.
   * To inject.
   * @type {Array.object}
   */
  definition: [],

  /**
   * Values changed action. It will get tree values 
   * and validation state as arguments.
   * @type {Function}
   */
  valuesChanged: () => {},

  /**
   * Tree fields values.
   * @type {Ember.Object}
   */
  values: null,

  /**
   * Tree of checkbox selection state.
   * @type {Ember.Object}
   */
  _checkboxSelection: null,

  /**
   * Tree fields.
   * @type {Ember.Object}
   */
  _fields: computed('definition', function () {
    return this._buildFieldsTree();
  }),

  /**
   * Array of error objects from ember-cp-validations.
   * @type {Array.Object}
   */
  _errors: computed('_fields', 'validations.errors.[]', function () {
    let {
      _fields,
      validations
    } = this.getProperties('_fields', 'validations');

    // Case when validations are not specified.
    if (!validations) {
      return [];
    }

    // Return an error only if a corresponding field exists in the fields tree.
    return validations.get('errors').filter((error) =>
      !!_fields.get(error.get('attribute').substring('values.'.length))
    );
  }),

  /**
   * Validity status of tree values.
   */
  _isValid: computed.empty('_errors'),

  _definitionObserver: on('init', observer('definition', function () {
    this._buildCheckboxSelectionTree();
  })),

  _valuesPrepareObserver: observer('definition', function () {
    let definition = this.get('definition');
    this.set('values', this._buildEmptyValuesTree(definition));
  }),

  init() {
    this._super(...arguments);
    this._reset();
    this.valuesHaveChanged();
    setTimeout(() => console.log(this.get('_checkboxSelection')), 1);
  },

  /**
   * Called when tree field value has changed.
   */
  valuesHaveChanged() {
    let {
      _isValid,
      valuesChanged,
    } = this.getProperties('_isValid', 'valuesChanged');
    valuesChanged(this._dumpValues(), _isValid);
  },

  /**
   * Resets tree state.
   */
  _reset() {
    let definition = this.get('definition');
    this.set('values', this._buildEmptyValuesTree(definition, true));
    this._resetFieldsTree();
  },

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
   * Copies values from treeFrom to treeTo. Nodes values are copied only if
   * node structure is the same in both trees.
   * @param {Ember.Object} treeTo 
   * @param {Ember.Object} treeFrom 
   */
  _mergeValuesTrees(treeTo, treeFrom) {
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
    copyValues(treeTo, treeFrom);
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
   * Creates tree with tree checkboxes selection states
   */
  _buildCheckboxSelectionTree() {
    let _fields = this.get('_fields');
    let buildNodeCheckboxesTree = (node) => {
      if (node.get('_isField') && node.get('type') !== 'checkbox') {
        return undefined;
      }
      let checkboxNode = Ember.Object.create({
        value: undefined,
        nodes: null,
      });
      if (node.get('_isField')) {
        return checkboxNode;
      }
      else {
        let checkboxSubnodes = Ember.Object.create();
        Object.keys(node).forEach((subnodeName) => {
          let _checkboxSubnodes = buildNodeCheckboxesTree(node.get(subnodeName));
          if (_checkboxSubnodes) {
            checkboxSubnodes.set(subnodeName, _checkboxSubnodes);
          }
        });
        if (Object.keys(checkboxSubnodes).length > 0) {
          checkboxNode.set('nodes', checkboxSubnodes);
          return checkboxNode;
        } else {
          return undefined;
        }
      }
    }
    let selectionTree = buildNodeCheckboxesTree(_fields);
    this._fillCheckboxSelectionTree(selectionTree);
    this.set('_checkboxSelection', selectionTree);
  },

  _fillCheckboxSelectionTree(selectionTree) {
    let values = this.get('values');
    let fillNode = (node, parentPath, nodeName) => {
      let path = parentPath + (parentPath ? '.' : '') + nodeName;
      if (!node.get('nodes')) {
        // is checkbox
        node.set('value', values.get(path))
      } else {
        // is checkbox parent
        let subnodes = node.get('nodes');
        let value = true;
        Object.keys(subnodes).forEach((subnodeName) => {
          fillNode(subnodes.get(subnodeName), path, subnodeName);
          value = value && subnodes.get(`${subnodeName}.value`);
        });
        node.set('value', value);
      }
    }
    fillNode(selectionTree, '', '');
  },

  /**
   * Resets fields state.
   * @param {string} [path] A path to a fields node. If specified, only that node
   * (and all subnodes) will be reset.
   */
  _resetFieldsTree(path) {
    let fields = this.get('_fields');
    if (path) {
      fields = fields.get(path);
    }
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
    resetNode(fields);
  },

  /**
   * Marks a field (identified by path) as modified.
   * @param {string} path A path to the modified field in fields tree. 
   */
  _markFieldAsModified(path) {
    this.set(`_fields.${path}.changed`, true);
  },

  /**
   * Changes a value in the values tree.
   * @param {string} path Path to the value in the values tree.
   * @param {*} value Value to persist in tree.
   */
  _changeValue(path, value) {
    let {
      _fields,
      _checkboxSelection,
    } = this.getProperties('_fields', '_checkboxSelection');
    this.set(`values.${path}`, value);
    this._markFieldAsModified(path);
    this._recalculateErrors();
    if (_fields.get(`${path}.type`) === 'checkbox') {
      this._fillCheckboxSelectionTree(_checkboxSelection);
    }
    this.valuesHaveChanged();
  },

  /**
   * Sets validation information for tree fields
   */
  _recalculateErrors() {
    let {
      _fields,
      values,
      _errors,
      validations,
    } = this.getProperties(
      '_fields',
      'values',
      '_errors',
      'validations'
    );

    if (!validations) {
      return;
    }

    let recalculateNodeErrors = (node) => {
      if (node.get('_isField')) {
        let error = _errors.filter((error) => {
          return error.get('attribute') === 'values.' + node.get('name');
        });
        error = error.length > 0 ? error[0] : null;
        // show if is not optional or is optional, but not empty
        let showValidation = node.get('optional') !== true || 
          [undefined, null, ''].indexOf(values.get(node.get('name'))) === -1;
        
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
          recalculateNodeErrors(node.get(subnodeName))
        );
      }
    };
    recalculateNodeErrors(_fields);
  },

  /**
   * Converts values tree of Ember objects into tree of native objects.
   * @returns {Object} values as native object
   */
  _dumpValues() {
    let values = this.get('values');
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
    return nodeToObject(values);
  },

  actions: {
    /**
     * Changes a value in the values tree.
     * @param {string} path Path to the value in the values tree.
     * @param {*} value Value to persist in tree.
     */
    inputValueChanged(path, value) {
      this._changeValue(path, value);
      // TODO remove
      console.log(`Changed ${path} to ${value}`);
    },

    /**
     * Marks an input as 'visited' after focus out event.
     * @param {string} path Path to the value in the values tree.
     */
    inputFocusedOut(path) {
      this._markFieldAsModified(path);
      this._recalculateErrors();
      console.log(`${path} focused out`);
    },

    /**
     * Selects/deselects all nested checkboxes in `path` node.
     * @param {string} path A path to the checkboxes parent node.
     * @param {boolean} value A value for checkboxes.
     */
    selectNestedCheckboxes(path, value) {
      let {
        values,
        _fields,
        _checkboxSelection
      } = this.getProperties('values', '_fields', '_checkboxSelection');

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
      changeCheckboxes(_fields.get(path));
      this._fillCheckboxSelectionTree(_checkboxSelection);
      this._recalculateErrors();
      this.valuesHaveChanged();
    }
  }
});
