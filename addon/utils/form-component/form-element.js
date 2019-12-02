import EmberObject, { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @type {Array<Utils.FormComponent.FormElement>}
   */
  fields: Object.freeze([]),

  /**
   * @type {boolean}
   */
  isEnabled: true,

  /**
   * @type {string}
   */
  mode: 'edit',

  /**
   * @type {boolean}
   */
  isModified: false,

  /**
   * @type {Utils.FormComponent.FormElement}
   */
  parent: undefined,

  /**
   * @type {string}
   */
  name: undefined,

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {Array<Utils.FormComponent.FormField>}
   */
  invalidFields: Object.freeze([]),

  /**
   * @type {any}
   */
  defaultValue: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  path: computed('parent.path', 'name', function path() {
    const parentPath = this.get('parent.path');
    const name = this.get('name');

    if (name) {
      return parentPath ? `${parentPath}.${name}` : name;
    }
  }),

  /**
   * @type {EmberObject}
   */
  valuesSource: reads('parent.valuesSource'),

  /**
   * Set by valuePropertySetter
   * @type {ComputedProperty<any>}
   */
  value: undefined,

  valuePropertySetter: observer(
    'path',
    function valuePropertySetter() {
      const path = this.get('path');
      this.set('value', path ? reads(`valuesSource.${path}`) : reads('valuesSource'));
    }
  ),

  init() {
    this._super(...arguments);

    this.valuePropertySetter();
  },

  /**
   * @public
   * @param {string} mode one of: 'edit', 'show'
   * @returns {undefined}
   */
  changeMode(mode) {
    this.set('mode', mode);
  },

  /**
   * @public
   */
  enable() {
    this.set('isEnabled', true);
  },

  /**
   * @public
   */
  disable() {
    this.set('isEnabled', false);
  },

  /**
   * @public
   */
  markAsModified() {
    this.set('isModified', true);
  },

  /**
   * @public
   */
  markAsNotModified() {
    this.set('isModified', false);
  },

  /**
   * @public
   */
  valueChanged(value) {
    this.onValueChange(value, this);
  },

  /**
   * @public
   */
  focusLost() {
    this.onFocusLost(this);
  },

  /**
   * @virtual
   * @public
   */
  dumpDefaultValue() {
    return this.get('defaultValue');
  },

  /**
   * @public
   */
  reset() {
    this.valueChanged(this.dumpDefaultValue());
    this.markAsNotModified();
  },

  /**
   * @public
   */
  onValueChange(value, field) {
    const parent = this.get('parent');

    if (parent) {
      parent.onValueChange(value, field);
    }
  },

  /**
   * @public
   */
  onFocusLost(field) {
    const parent = this.get('parent');

    if (parent) {
      parent.onFocusLost(field);
    }
  }
});
