/**
 * Mark some resources to skip error checking before showing error message,
 * because error check was done in another place.
 *
 * Eg. when someone enters `clusters/:id/authentication-error` route using
 * URL we want to check the error before rendering message.
 *
 * However sometimes we redirect to this route internally because we detected
 * this error somewhere else and then we can skip error checking.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import globals from 'onedata-gui-common/utils/globals';

export default class DisabledErrorCheckList {
  constructor(type, storage = globals.sessionStorage) {
    this.type = type;
    this.storage = storage;
    this.errorCheckTypeKey = `${this.type}DisableErrorCheck`;
  }

  getErrorCheckArray() {
    const disableClustersCheck =
      this.storage.getItem(this.errorCheckTypeKey) || '';
    return disableClustersCheck.split(',');
  }

  setErrorCheckArray(array) {
    this.storage.setItem(
      this.errorCheckTypeKey,
      array.join(',')
    );
  }

  hasDisabledErrorCheckFor(id) {
    return this.getErrorCheckArray().includes(id);
  }

  hasEnabledErrorCheckFor(id) {
    return !this.hasDisabledErrorCheckFor(id);
  }

  disableErrorCheckFor(id) {
    const disabled = this.getErrorCheckArray();
    disabled.push(id);
    this.setErrorCheckArray(disabled);
  }

  enableErrorCheckFor(id) {
    const disabled = this.getErrorCheckArray();
    _.pull(disabled, id);
    this.setErrorCheckArray(disabled);
  }
}
