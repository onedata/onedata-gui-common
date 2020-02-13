import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { computed } from '@ember/object';
import { validator } from 'ember-cp-validations';

export default TextField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/text-like-field',

  /**
   * @public
   * @type {String}
   */
  inputType: 'number',

  /**
   * @virtual optional
   * @type {number}
   */
  gt: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  gte: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  lt: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  lte: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  integer: false,

  /**
   * @type {ComputedProperty<Object>}
   */
  numberValidator: computed(
    'gt',
    'gte',
    'lt',
    'lte',
    'integer',
    function numberValidator() {
      const {
        gt,
        gte,
        lt,
        lte,
        integer,
      } = this.getProperties(
        'gt',
        'gte',
        'lt',
        'lte',
        'integer'
      );

      return validator('number', {
        allowString: true,
        // empty values are handled by `isOptional` field
        allowBlank: true,
        gt,
        gte,
        lt,
        lte,
        integer,
      });
    }
  ),

  init() {
    this._super(...arguments);

    this.registerInternalValidatorField('numberValidator');
  },
})
