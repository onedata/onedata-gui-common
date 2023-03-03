/**
 * Wraps other template into loader or error alert basing on provided promise proxy state.
 *
 * It helps in building GUI with showing state of some async resource.
 *
 * An example:
 * ```
 * {{#promise-proxy-container proxy=somePromiseObject}}
 *   {{some-component model=somePromiseObject.content}}
 * {{/promise-proxy-container}}
 * ```
 *
 * It will render loader (eg. spinner) if `somePromiseObject` is not settled.
 * It will render error message if `somePromiseObject` is rejected..
 * It will render `some-component` if promise has fulfilled.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';

import LoadingContainer from 'onedata-gui-common/components/loading-container';
import layout from 'onedata-gui-common/templates/components/loading-container';

export default LoadingContainer.extend({
  layout,
  tagName: '',

  /**
   * @virtual
   * @type {PromiseObject}
   */
  proxy: null,

  isLoaded: reads('proxy.isFulfilled'),
  isLoading: reads('proxy.isPending'),
  isError: reads('proxy.isRejected'),
  errorReason: reads('proxy.reason'),
});
