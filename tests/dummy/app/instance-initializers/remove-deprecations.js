import { registerDeprecationHandler } from '@ember/debug';

export default {
  initialize: () => {
    registerDeprecationHandler((message, options, next) => {
      return;
    });
  },
};
