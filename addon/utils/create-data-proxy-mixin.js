/**
 * Creates mixin that will add methods and properties that provide data
 * got from some promise.
 * 
 * You should provide `fetch` method or implement `fetchName` method in object
 * that will return Promise that resolves data.
 * 
 * Properties and methods added to object:
 * 
 * ```
 * updateDataProxy(): Promise<T>
 * fetchData(): Promise<T> // implement or provide `fetch`
 * dataProxy: PromiseObject<T>
 * data: T
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
    [`update${classify(name)}Proxy`](reload = false) {
      const promise = this[`fetch${classify(name)}`]();
      const proxyProperty = `${camelize(name)}Proxy`;
      if (reload) {
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
  });
}
