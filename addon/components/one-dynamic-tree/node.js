/**
 * A component represents tree node, used internally by the one-dynamic-tree
 * component. For example of tree usage, see one-dynamic-tree documentation.
 *
 * @module components/one-dynamic-tree/node
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { reads } from '@ember/object/computed';
import EmberObject, {
  observer,
  computed,
  defineProperty,
} from '@ember/object';
import layout from '../../templates/components/one-dynamic-tree/node';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';
import { dotToDash } from 'onedata-gui-common/helpers/dot-to-dash';

const CHECKBOX_SELECTION_PATH_REPLACE_REGEX = new RegExp('\\.', 'g');

export default Component.extend(DisabledPaths, {
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
   * Input id.
   * @type {computed.string}
   */
  inputId: computed('_path', function () {
    const _path = this.get('_path');
    return 'field-' + dotToDash([_path]);
  }),

  /**
   * 'Select all checkboxes' field definition.
   * @type {Ember.Object}
   */
  _selectCheckboxesField: computed('_path', function () {
    return EmberObject.create({
      name: this.get('_path'),
      type: 'checkbox',
      threeState: true,
    });
  }),

  /**
   * Field.
   * @type {Ember.Object}
   */
  _field: computed('fields', '_path', function () {
    return this.get(`fields.${this.get('_path')}`);
  }),

  /**
   * If true, a field is rendered
   */
  _renderField: computed('definition', function () {
    const definition = this.get('definition');
    return !!(!definition.subtree && definition.field);
  }),

  /**
   * If true, subtree select checkbox will be visible.
   * @type {computed.boolean}
   */
  _allowSubtreeCheckboxSelect: computed(
    '_renderField',
    'definition.allowSubtreeCheckboxSelect',
    function () {
      const {
        _renderField,
        definition,
      } = this.getProperties('_renderField', 'definition');
      return !_renderField && definition.allowSubtreeCheckboxSelect;
    }
  ),

  /**
   * Path to value in `values` property
   * @type {computed.string}
   */
  _path: computed('definition', 'parentPath', function () {
    const {
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
   * True if node field should be disabled
   * @type {computed.boolean}
   */
  _isFieldDisabled: computed('_path', 'disabledFieldsPaths.[]', function () {
    return this.isPathDisabled(this.get('_path'));
  }),

  /**
   * Creates new _areNestedCheckboxesSelected property at each path change
   */
  _pathSelectionObserver: observer('_path', function () {
    const _path = this.get('_path');
    const selectionPath = _path.replace(
      CHECKBOX_SELECTION_PATH_REPLACE_REGEX,
      '.nodes.'
    );
    defineProperty(
      this,
      '_areNestedCheckboxesSelected',
      reads(`checkboxSelection.nodes.${selectionPath}.value`)
    );
  }),

  init() {
    this._super(...arguments);
    this._pathSelectionObserver();
  },
});
