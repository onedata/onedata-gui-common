// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

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
 * // `getDataProxy` was not invoked yet; PLEASE DO NOT USE IT DIRECTLY,
 * // use `propertyNameProxy` (without underscore) instead
 * _propertyNameProxy: PromiseObject<T>
 *
 * // get PromiseObject with data, and initialize it if getting first time
 * propertyNameProxy: ComputedProperty<PromiseObject<T>>
 *
 * // object with data, can be undefined if data not yet fetched or rejected
 * propertyName: T
 *
 * // returns dataProxy or creates it when not created yet
 * getPropertyNameProxy({ reload: boolean, fetchArgs: Array }): PromiseObject<T>
 * ```
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { classify, camelize } from '@ember/string';
import { reads } from '@ember/object/computed';
import { get, computed, set, setProperties } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default function createDataProxyMixin(name, options) {
  const updateDataProxyName = `update${classify(name)}Proxy`;
  const fetchDataName = `fetch${classify(name)}`;
  const dataProxyName = `${camelize(name)}Proxy`;
  const internalDataProxyName = `_${dataProxyName}`;
  const getDataProxyName = `get${classify(name)}Proxy`;

  let _options;
  if (typeof options === 'function') {
    _options = { fetch: options };
  } else if (!options) {
    _options = {};
  } else {
    _options = Object.assign({}, options);
  }
  if (!_options.fetch) {
    _options.fetch = notImplementedReject;
  }

  return Mixin.create({
    /**
     * If `replace` is true, do not create new ProxyObject, but
     * replace content, so `isPending` of the ProxyObject will not be changed
     *
     * If you want to use `replace = true` and it is possible to have a
     * falsy value as proxy content (`null`, `0` etc.) then `replaceEmpty = true`
     * must be specified. Otherwise replace will not work when empty value inside
     * proxy content occurs.
     */
    [updateDataProxyName]({
      replace = false,
      replaceEmpty = false,
      fetchArgs = [],
    } = {}) {
      const promise = this[fetchDataName](...fetchArgs);
      const internalDataProxy = this.get(internalDataProxyName);
      if (internalDataProxy && get(internalDataProxy, 'isPending')) {
        return internalDataProxy;
      } else {
        if (
          replace &&
          this.get(`${internalDataProxyName}.${replaceEmpty ? 'isSettled' : 'content'}`)
        ) {
          return promise
            .catch(error => {
              set(internalDataProxy, 'reason', error);
              if (get(internalDataProxy, 'isFulfilled')) {
                setProperties(internalDataProxy, {
                  isRejected: true,
                  isFulfilled: true,
                });
              }
              throw error;
            })
            .then(value => {
              set(internalDataProxy, 'content', value);
              if (get(internalDataProxy, 'isRejected')) {
                setProperties(internalDataProxy, {
                  reason: null,
                  isRejected: false,
                  isFulfilled: true,
                });
              }
              return value;
            });
        } else {
          const proxy =
            (_options.type === 'array' ? promiseArray : promiseObject)(promise);
          safeExec(
            this,
            'set',
            internalDataProxyName,
            proxy
          );
          return proxy;
        }
      }
    },

    [fetchDataName]: _options.fetch,

    [dataProxyName]: computed(internalDataProxyName, {
      get() {
        return this[getDataProxyName]();
      },
      set(key, value) {
        // you should not do that, but we do not deny this
        return this.set(internalDataProxyName, value);
      },
    }),

    [internalDataProxyName]: null,

    [name]: reads(`${dataProxyName}.content`),

    [getDataProxyName]({ reload = false, fetchArgs = [] } = {}) {
      const internalDataProxy = this.get(internalDataProxyName);
      if (!reload && internalDataProxy) {
        return internalDataProxy;
      } else {
        return this[updateDataProxyName]({ replace: true, fetchArgs });
      }
    },
  });
}
