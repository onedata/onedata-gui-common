import Component from '@ember/component';
import { Promise } from 'rsvp';

export default Component.extend({
  buttonTypes: Object.freeze([
    'default',
    'primary',
    'success',
    'info',
    'warning',
    'danger',
    'link',
  ]),

  actions: {
    clickAction() {
      console.log('Button clicked');
      return new Promise((resolve) => setTimeout(resolve, 2000));
    },
  },
});
