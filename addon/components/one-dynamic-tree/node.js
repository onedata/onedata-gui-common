import Ember from 'ember';
import layout from '../../templates/components/one-dynamic-tree/node';

const {
  computed,
  computed: {
    readOnly,
  },
  observer,
  on,
} = Ember;

const CHECKBOX_SELECTION_PATH_REPLACE_REGEX = new RegExp('\\.', 'g');

export default Ember.Component.extend({
  layout,
  tagName: '',

  /**
   * Parent tree component.
   * To inject.
   * @type {Ember.Component}
   */
  parentTree: null,

  /**
   * Path to the parent item.
   * @type {string}
   */
  parentPath: '',

  /**
   * Node definition.
   * To inject.
   * @type {Object}
   */
  definition: null,

  /**
   * Tree values.
   * To inject.
   * @type {Ember.Object}
   */
  values: null,

  /**
   * Tree fields.
   * To inject.
   * @type {Ember.Object}
   */
  fields: null,

  /**
   * Tree checkboxes state.
   * To inject.
   * @type {Ember.Object}
   */
  checkboxSelection: null,

  /**
   * Input value changed action.
   * To inject.
   * @type {Function}
   */
  inputValueChanged: () => {},

  /**
   * Input focused out action.
   * To inject.
   * @type {Function}
   */
  inputFocusedOut: () => {},

  /**
   * Selects/deselects all nested checkboxes.
   * To inject.
   * @type {Function}
   */
  selectNestedCheckboxes: () => {},

  /**
   * If true, all nested checkboxes are selected.
   * @type {computed.boolean}
   */
  _areNestedCheckboxesSelected: null,

  /**
   * Select all checkboxes field definition.
   * @type {Ember.Object}
   */
  _selectCheckboxesField: computed('_path', function () {
    return Ember.Object.create({
      name: this.get('_path'),
      type: 'checkbox',
    });
  }),

  /**
   * Field.
   * @type {Ember.Object}
   */
  _field: computed('fields', '_path', function () {
    let {
      fields,
      _path,
    } = this.getProperties('fields', '_path');
    return fields.get(_path);
  }),

  /**
   * If true, a field is rendered
   */
  _renderField: computed('definition', function () {
    let definition = this.get('definition');
    return !!(!definition.subtree && definition.field);
  }),

  /**
   * Path to value in values property
   * @type {computed.string}
   */
  _path: computed('definition', 'parentPath', function () {
    let {
      definition,
      parentPath,
    } = this.getProperties('definition', 'parentPath');
    let path = parentPath;
    if (parentPath) {
      path += '.';
    }
    return path + definition.name;
  }),

  /**
   * Creates new _areNestedCheckboxesSelected property at each path change
   */
  _pathSelectionObserver: on('init', observer('_path', function () {
    let _path = this.get('_path');
    let selectionPath = _path.replace(
      CHECKBOX_SELECTION_PATH_REPLACE_REGEX,
      '.nodes.'
    );
    this.set(
      '_areNestedCheckboxesSelected',
      readOnly(`checkboxSelection.nodes.${selectionPath}.value`)
    );
  })),
});
