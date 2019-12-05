import BaseValidator from 'ember-cp-validations/validators/base';

const Json = BaseValidator.extend({
  validate(value) {
    // Checking empty value should be handled by `presence` validator
    if (value === '' || value === undefined || value === null) {
      return true;
    }

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return 'JSON is not valid';
    }
  },
});

Json.reopenClass({
  /**
   * Define attribute specific dependent keys for your validator
   *
   * [
   * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
   * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
   * ]
   *
   * @param {String}  attribute   The attribute being evaluated
   * @param {Unknown} options     Options passed into your validator
   * @return {Array}
   */
  getDependentsFor( /* attribute, options */ ) {
    return [];
  }
});

export default Json;
