import { afterEach } from 'mocha';
import resetStorages from 'ember-local-storage/test-support/reset-storage';
import globals from 'onedata-gui-common/utils/globals';

export default function clearStore() {
  resetStorages();
  if (globals.localStorage) {
    globals.localStorage.clear();
  }
  if (globals.sessionStorage) {
    globals.sessionStorage.clear();
  }
}

/**
 * @param {() => void} afterEachFun
 */
export function clearStoreAfterEach(afterEachFun = afterEach) {
  afterEachFun(function () {
    clearStore();
  });
}
