import Component from '@ember/component';

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
});
