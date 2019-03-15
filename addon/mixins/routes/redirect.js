/**
 * For routes that can eventually redirect to other domain - prevents to
 * redirect if using back/forward button.
 * 
 * @module mixins/routes/redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * @virtual
   */
  checkComeFromOtherRoute( /* currentHash */ ) {
    throw new Error('not implemented');
  },

  /**
   * Some routes using this mixin can be redirecting only conditionally
   * or in some way internally, so this property can be overriden.
   */
  isRedirectingTransition( /* transition */ ) {
    return true;
  },

  /**
   * If the page was reached using back/forward in browser, the `back-forward`
   * instance initializer should set `back_forward` query param flag to true.
   * If we reached this route from back/forward, then we should prevent
   * redirecting because it will leave our app.
   * Otherwise, we should set the last seen route in the sessionStorage,
   * to remember it when we want to go back to this route and prevent redirect.
   * @param {Transition} transition 
   */
  beforeModel(transition) {
    const superResult = this._super(...arguments);
    if (this.isRedirectingTransition(transition)) {
      if (transition.queryParams.back_forward) {
        console.debug(
          'redirection route: detected back/forward - preventing redirect'
        );
        delete transition.queryParams.back_forward;
        const hashBeforeRedirect = sessionStorage.getItem('hash-before-redirect');
        sessionStorage.removeItem('hash-before-redirect');
        transition.abort();
        window.location.replace(hashBeforeRedirect || '#/');
      } else {
        const currentHash = window.location.hash;
        if (this.checkComeFromOtherRoute(currentHash)) {
          sessionStorage.setItem('hash-before-redirect', currentHash);
        } else {
          sessionStorage.removeItem('hash-before-redirect');
        }
      }
    }
    return superResult;
  },
});
