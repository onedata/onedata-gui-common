import { setupOnerror, resetOnerror } from '@ember/test-helpers';

export function suppressRejections() {
  setupOnerror(() => {});
}

export function unsuppressRejections() {
  resetOnerror();
}
