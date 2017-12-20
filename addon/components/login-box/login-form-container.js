import Ember from 'ember';
import layout from '../../templates/components/login-box/login-form-container';

export default Ember.Component.extend({
  layout,

  /**
   * @virtual
   * @type {function}
   */
  authenticationSuccess: () => {},

  /**
   * @virtual
   * @type {function}
   */
  authenticationFailure: () => {},

  /**
   * @virtual
   * @type {function}
   */
  authenticationStarted: () => {},
});
