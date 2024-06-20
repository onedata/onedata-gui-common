/**
 * Use this mixin in objects, that does not have information about Ember owner
 * and cannot resolve service injections on their own. Needs specified `ownerSource`
 * (usually whatever component or service), that hold a reference to the Ember owner.
 *
 * These module exports also DynamicOwnerInjector that adds support for setting value of
 * `ownerSource` after object creation. The `ownerSource` can be set both by `set` or
 * using computed property that changes its value during runtime.
 *
 * In both cases, only setting `ownerSource` from null to a value is supported.
 * You cannot change the existing non-null value of `ownerSource`.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { observer } from '@ember/object';
import { getOwner } from '@ember/application';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

/**
 *
 * @param {EmberObject} obj
 * @param {EmberObject} ownerSource
 * @returns
 */
export function applyOwnerSource(obj, ownerSource) {
  if (!ownerSource) {
    return;
  }
  if (getOwner(obj)) {
    // console.warn('OwnerInjector: the object already has an owner, ignoring ownerSource change.');
    return;
  }
  const ownerInjection = typeof ownerSource.ownerInjection === 'function' ?
    ownerSource.ownerInjection() : getOwner(ownerSource).ownerInjection();
  obj.setProperties(ownerInjection);
}

export const OwnerInjector = Mixin.create({
  /**
   * Ember framework object, that contains information about owner.
   * @type {Object}
   * @virtual
   */
  ownerSource: undefined,

  init() {
    if (!this.ownerSource) {
      throw new Error(
        'OwnerInjector: no ownerSource provided on object create. If you want to set the ownerSource value after creation, use DynamicOwnerInjector.'
      );
    }
    applyOwnerSource(this, this.ownerSource);
    this._super(...arguments);
  },
});

export const DynamicOwnerInjector = Mixin.create({
  /**
   * Ember framework object, that contains information about owner.
   * @type {Object}
   * @virtual
   */
  ownerSource: undefined,

  ownerSourceObserver: observer('ownerSource', function ownerSourceObserver() {
    safeExec(this, () => {
      applyOwnerSource(this, this.ownerSource);
    });
  }),

  init() {
    this.ownerSourceObserver();
    this._super(...arguments);
  },
});

export default OwnerInjector;
