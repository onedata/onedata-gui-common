import Component from '@ember/component';
import { later } from '@ember/runloop';

export default Component.extend({
  open: true,

  proceedPromise() {
    return new Promise((resolve) => {
      later(resolve, 2000);
    });
  },

  proceedThrow() {
    throw new Error();
  },

  proceedReturn() {
    return 'hello';
  },

  proceedUndefined() {
    return undefined;
  },

  actions: {
    proceed() {
      return this.proceedPromise();
    },
  },
});
