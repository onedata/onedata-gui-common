/**
 * @author Jakub Liput
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { Promise } from 'rsvp';
import { run } from '@ember/runloop';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend({
  resolvingProxy: undefined,
  rejectingProxy: undefined,

  init() {
    this._super(...arguments);
    this._resetProxy();
  },

  _resetProxy() {
    this.set('resolvingProxy', PromiseObject.create({
      promise: new Promise(resolve => {
        run.later(resolve, 2000);
      }),
    }));

    this.set('rejectingProxy', PromiseObject.create({
      promise: new Promise((resolve, reject) => {
        run.later(() => reject({ message: 'some reason' }), 2000);
      }),
    }));

    this.set('infiniteProxy', PromiseObject.create({
      promise: new Promise(() => {}),
    }));
  },

  actions: {
    resetProxy() {
      this._resetProxy();
    },
  },
});
