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

import { computed } from '@ember/object';
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

  /**
   * @override
   */
  isLoaded: computed('proxy.isFulfilled', {
    get() {
      return this.injectedIsLoaded ?? this.proxy?.isFulfilled;
    },
    set(key, value) {
      return this.injectedIsLoaded = value;
    },
  }),

  /**
   * @override
   */
  isLoading: computed('proxy.isPending', {
    get() {
      return this.injectedIsLoading ?? this.proxy?.isPending;
    },
    set(key, value) {
      return this.injectedIsLoading = value;
    },
  }),

  /**
   * @override
   */
  isError: computed('proxy.isRejected', {
    get() {
      return this.injectedIsError ?? this.proxy?.isRejected;
    },
    set(key, value) {
      return this.injectedIsError = value;
    },
  }),

  /**
   * @override
   */
  errorReason: computed('proxy.reason', {
    get() {
      return this.injectedErrorReason ?? this.proxy?.reason;
    },
    set(key, value) {
      return this.injectedErrorReason = value;
    },
  }),

  /**
   * @type {boolean | null}
   */
  injectedIsLoaded: null,

  /**
   * @type {boolean | null}
   */
  injectedIsLoading: null,

  /**
   * @type {boolean | null}
   */
  injectedIsError: null,

  /**
   * @type {boolean | null}
   */
  injectedErrorReason: null,
});
