import { afterEach } from 'mocha';
import resetStorages from 'ember-local-storage/test-support/reset-storage';

export default function clearStore() {
  if (window.localStorage) {
    window.localStorage.clear();
  }
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
  resetStorages();
}

export function clearStoreAfterEach() {
  afterEach(function () {
    clearStore();
  });
}
