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
 * updatePropertyNameProxy({ replace: boolean, fetchArgs: Array }): Promise<T>
 * 
 * // implement or provide `fetch`, do actual data fetching
 * fetchPropertyName(fetchArgs): Promise<T>
 * 
 * // PromiseObject with data, can be undefined if `updateDataProxy` or
 * // `getDataProxy` was not invoked yet
 * propertyNameProxy: PromiseObject<T>
 * 
 * // object with data, can be undefined if data not yet fetched or rejected
 * PropertyName: T
 * 
 * // returns dataProxy or creates it when not created yet
 * getPropertyNameProxy({ reload: boolean, fetchArgs: Array }): PromiseObject<T>
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
  const updateDataProxyName = `update${classify(name)}Proxy`;
  const fetchDataName = `fetch${classify(name)}`;
  const dataProxyName = `${camelize(name)}Proxy`;
  const getDataProxyName = `get${classify(name)}Proxy`;

  return Mixin.create({
    /**
     * If `replace` is true, do not create new ProxyObject, but
     * replace content, so `isPending` of the ProxyObject will not be changed
     */
    [updateDataProxyName]({ replace = false, fetchArgs = [] } = {}) {
      const promise = this[fetchDataName](...fetchArgs);
      const proxyProperty = dataProxyName;
      if (replace && this.get(`${proxyProperty}.content`)) {
        return promise
          .catch(error => {
            safeExec(this, 'set', `${proxyProperty}.content`, undefined);
            safeExec(this, 'set', `${proxyProperty}.reason`, error);
            safeExec(this, 'set', `${proxyProperty}.isFulfilled`, false);
            safeExec(this, 'set', `${proxyProperty}.isRejected`, true);
            throw error;
          })
          .then(content => {
            safeExec(this, 'set', `${proxyProperty}.content`, content);
            safeExec(this, 'set', `${proxyProperty}.reason`, undefined);
            safeExec(this, 'set', `${proxyProperty}.isFulfilled`, true);
            safeExec(this, 'set', `${proxyProperty}.isRejected`, false);
            return content;
          });
      } else {
        safeExec(
          this,
          'set',
          proxyProperty,
          PromiseObject.create({ promise })
        );
        return promise;
      }
    },

    [fetchDataName]: fetch,

    [dataProxyName]: null,

    [name]: reads(`${dataProxyName}.content`),

    [getDataProxyName]({ reload = false, fetchArgs = [] } = {}) {
      const dataProxy = this.get(`${camelize(name)}Proxy`);
      if (!reload && dataProxy) {
        return dataProxy;
      } else {
        return this[updateDataProxyName]({ replace: true, fetchArgs });
      }
    },
  });
}
