/**
 * Wraps other template into loader or error alert basing on provided promise proxy state.
 *
 * It helps in building GUI with showing state of some async resource.
 *
 * An example:
 * ```
 * {{#promise-proxy-container proxy=someObjectPromiseProxy}}
 *   {{some-component model=someObjectPromiseProxy.content}} 
 * {{/promise-proxy-container}}
 * ```
 *
 * It will render loader (eg. spinner) if ``someObjectPromiseProxy`` is not settled.
 * It will render error message if ``someObjectPromiseProxy`` is rejected..
 * It will render ``some-component`` if promise has fulfilled.
 *
 * @module components/promise-proxy-container
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/promise-proxy-container';

const {
  Component,
} = Ember;

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {ObjectPromiseProxy}
   */
  proxy: null,
});
