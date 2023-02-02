import { afterEach } from 'mocha';
import resetStorages from 'ember-local-storage/test-support/reset-storage';

export default function clearStore() {
  resetStorages();
  if (window.localStorage) {
    window.localStorage.clear();
  }
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
}

export function clearStoreAfterEach() {
  afterEach(function () {
    clearStore();
  });
}
