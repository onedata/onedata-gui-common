import Ember from 'ember';
import layout from '../templates/components/one-dynamic-tree';
import FieldsTree from 'onedata-gui-common/mixins/components/one-dynamic-tree/fields-tree';
import ValuesTree from 'onedata-gui-common/mixins/components/one-dynamic-tree/values-tree';
import CheckboxSelectionTree from 'onedata-gui-common/mixins/components/one-dynamic-tree/checkbox-selection-tree';
import DisabledPaths from 'onedata-gui-common/mixins/components/one-dynamic-tree/disabled-paths';

const {
  computed,
  observer,
  on,
  A
} = Ember;

export default Ember.Component.extend(
  ValuesTree, FieldsTree, CheckboxSelectionTree, DisabledPaths, {
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

        // Return an error only if a corresponding field exists in the fields tree.
        return validations.get('errors').filter((error) => {
          let path = error.get('attribute').substring('values.'.length);
          return !!_fieldsTree.get(path) && !this.isPathDisabled(path);
        });
      }
    ),

    /**
     * Validity status of tree values.
     */
    _isValid: computed.empty('_errors'),

    _fieldsObserver: on('init', 
      observer('_fieldsTree', 'disabledFieldsPaths.[]', function () {
        this._buildCheckboxSelectionTree();
        this._resetDisabledFields();
        this.valuesHaveChanged();
      })
    ),

    _valuesPrepareObserver: observer('definition', function () {
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
    },

    /**
     * Called when tree field value has changed.
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
        values,
        _errors,
        validations,
      } = this.getProperties(
        '_fieldsTree',
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
          let showValidation = node.get('optional') !== true || [undefined, null, ''].indexOf(values.get(node.get('name'))) === -1;

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
      recalculateNodeErrors(_fieldsTree);
    },

    actions: {
      /**
       * Changes a value in the values tree.
       * @param {string} path Path to the value in the values tree.
       * @param {*} value Value to persist in tree.
       */
      inputValueChanged(path, value) {
        this.changeValue(path, value);
        // TODO remove
        console.log(`Changed ${path} to ${value}`);
      },

      /**
       * Marks an input as 'visited' after focus out event.
       * @param {string} path Path to the value in the values tree.
       */
      inputFocusedOut(path) {
        this._markFieldAsModified(path);
        this.valuesHaveChanged(false, false)
        console.log(`${path} focused out`);
      },
    }
  }
);
