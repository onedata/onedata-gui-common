/**
 * Creates mixin that will add methods and properties that provide data
 * got from some promise.
 * 
 * You should provide `fetch` method or implement `fetchName` method in object
 * that will return Promise that resolves data.
 * 
 * Properties and methods added to object - data will be replaced with provided
 * `name` (eg. `updateDataProxy` -> `updateSomeNameProxy`):
 * 
 * ```
 * // creates proxy using `fetchData` or replaces content of proxy
 * updateDataProxy(replace: boolean, ...fetchArgs): Promise<T>
 * 
 * // implement or provide `fetch`, do actual data fetching
 * fetchData(...fetchArgs): Promise<T>
 * 
 * // PromiseObject with data, can be undefined if `updateDataProxy` or
 * // `getDataProxy` was not invoked yet
 * dataProxy: PromiseObject<T>
 * 
 * // object with data, can be undefined if data not yet fetched or rejected
 * data: T
 * 
 * // returns dataProxy or creates it when not created yet
 * getDataProxy(reload: boolean, ...fetchArgs): PromiseObject<T>
 * ```
 * 
 * @module utils/create-data-proxy-mixin
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { classify, camelize } from '@ember/string';
import { reads } from '@ember/object/computed';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default function createDataProxyMixin(name, fetch = notImplementedReject) {
  return Mixin.create({
    /**
     * If `replace` is true, do not create new ProxyObject, but
     * replace content, so `isPending` of the ProxyObject will not be changed
     */
    [`update${classify(name)}Proxy`](replace = false, ...fetchArgs) {
      const promise = this[`fetch${classify(name)}`](...fetchArgs);
      const proxyProperty = `${camelize(name)}Proxy`;
      if (replace && this.get(`${proxyProperty}.content`)) {
        return promise
          .catch(error => {
            safeExec(this, 'set', `${proxyProperty}.content`, undefined);
            safeExec(this, 'set', `${proxyProperty}.reason`, error);
            throw error;
          })
          .then(content => {
            safeExec(this, 'set', `${proxyProperty}.content`, content);
            safeExec(this, 'set', `${proxyProperty}.reason`, undefined);
            return this.get(proxyProperty);
          });
      } else {
        return safeExec(
          this,
          'set',
          proxyProperty,
          PromiseObject.create({ promise })
        );
      }
    },

    [`fetch${classify(name)}`]: fetch,

    [`${camelize(name)}Proxy`]: null,

    [name]: reads(`${camelize(name)}Proxy.content`),

    [`get${classify(name)}Proxy`](reload = false, ...args) {
      const dataProxy = this.get(`${camelize(name)}Proxy`);
      if (!reload && dataProxy) {
        return dataProxy;
      } else {
        return this[`update${classify(name)}Proxy`](true, ...args);
      }
    },
  });
}
