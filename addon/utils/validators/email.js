/**
 * Validator and utils for validating e-mail adresses.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { validator } from 'ember-cp-validations';

/**
 * Taken from: http: //emailregex.com/
 * @type {RegExp}
 */
export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default (options) => validator('format', {
  regex: emailRegex,
  allowBlank: false,
  message() {
    if (this.model.i18n) {
      return String(this.model.i18n.t('utils.validators.email.mustBeValidEmail'));
    }
  },
  ...options,
});
