import EmberObject, { computed } from '@ember/object';
import { not, or, and } from 'ember-awesome-macros';

export const defaultValidate = () => null;

export default EmberObject.extend({
  /**
   * @virtual optional
   * @type {(key: string, value: string) => String|null}
   */
  validateKey: defaultValidate,

  /**
   * @type {string}
   */
  key: '',

  /**
   * @type {string}
   */
  value: '',

  /**
   * @type {boolean}
   */
  isEditingKey: false,

  /**
   * If true, then record is treated as unavailable  (e.g. is in the middle 
   * of animation of deleting)
   * @type {boolean}
   */
  isRemoved: false,

  /**
   * If true, animation of creating a record will not be applied to this
   * record. Helpful at the time of first component render, when everything
   * should be done without delays.
   * @type {boolean}
   */
  disableCreateAnimation: false,

  /**
   * True value means, that this record has the same key as some another record
   * @type {boolean}
   */
  isDuplicate: false,

  /**
   * @type {boolean}
   */
  showHeader: true,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isEmpty: and(not('key'), not('value')),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasValueWithoutKey: computed(
    'key',
    'value',
    function hasValuesWithoutKeys() {
      const {
        key,
        value,
      } = this.getProperties('key', 'value');
      return key === '' && value !== '';
    }
  ),

  keyValidationMessage: computed('key', 'validateKey', function keyValidationMessage() {
    const {
      key,
      validateKey,
    } = this.getProperties('key', 'validateKey');
    return validateKey(key);
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasKeyError: or('isDuplicate', 'hasValueWithoutKey', 'keyValidationMessage'),
});
