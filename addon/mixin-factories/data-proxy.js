/**
 * FIXME: doc
 * 
 * updateDataProxy(): Promise<T>
 * fetchData(): Promise<T>
 * dataProxy: PromiseObject<T>
 * data: T
 * 
 * @module mixin-factories/data-proxy
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

export default function dataProxy(name, fetch = notImplementedReject) {
  return Mixin.create({
    [`update${classify(name)}Proxy`](reload = false) {
      const promise = this[`fetch${classify(name)}`]();
      const proxyProperty = `${camelize(name)}Proxy`;
      if (reload) {
        return promise.then(content => {
          safeExec(this, 'set', `${proxyProperty}.content`, content);
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
