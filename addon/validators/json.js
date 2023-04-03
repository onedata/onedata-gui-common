/**
 * Defines JSON validator, which indicates error when JSON cannot be parsed.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BaseValidator from 'ember-cp-validations/validators/base';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const Json = BaseValidator.extend(I18n, {
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'validators.json',

  validate(value) {
    // Checking empty value should be handled by `presence` validator
    if (value === '' || value === undefined || value === null) {
      return true;
    }

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return this.t('parseError').string;
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
   * @returns {Array}
   */
  getDependentsFor( /* attribute, options */ ) {
    return [];
  },
});

export default Json;
