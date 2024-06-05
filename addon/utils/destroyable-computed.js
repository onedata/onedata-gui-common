/**
 * Utils for automatically destroying (invoking destructors) Ember Objects that are
 * created in computed properties, so they can be recomputed and left undestroyed garbage.
 *
 * Starting with Ember 3.16, Ember Objects that use observers must have their `destroy`
 * method invoked manually, because otherwise they are going to be dangling in the
 * internal SYNC_OBSERVERS Ember map, collecting objects that use observers.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

/**
 * Wraps Ember `computed` with code destroying the previosly computed object value if
 * computed is recomputed (invoked multiple times). The values that haven't been destroyed
 * yet are stored in the `destroyableValuesSet` property of the parent which is cleared in
 * the parent object destroy (use `destroyDestroyableComputedValues(this)` in the
 * `willDestroy` hook).
 *
 * This macro supports also array of destroyable objects as values from computed - if
 * the value is an array, it tries to destroy each object in it rescursively.
 *
 * When using this macro, remember to:
 * - use `initDestroyableCache` in the `init`,
 * - use `destroyDestroyableComputedValues(this)` in the `willDestroy` hook.
 *
 * You should omit usage of the above two methods if the object inherits from the object
 * with these methods already applied.
 *
 * @param  {...any} computedArgs The same arguments as in `computed`.
 * @returns {ComputedProperty}
 */
export function destroyableComputed(...computedArgs) {
  let cache;
  return computed(...computedArgs.slice(0, computedArgs.length - 1), function () {
    const fun = computedArgs[computedArgs.length - 1];
    if (cache) {
      destroyCached(cache);
      this.destroyableValuesSet.delete(cache);
    }
    const value = fun.bind(this)(...arguments);
    cache = value;
    this.destroyableValuesSet.add(cache);
    return cache;
  });
}

/**
 * Prepares the object for `destroyableComputed` macro usage. Should be invoked before
 * `this._super`.
 *
 * @param {EmberObject} self
 * @returns {void}
 */
export function initDestroyableCache(self) {
  if (self.destroyableValuesSet) {
    console.error('initDestroyableCache: destroyableValuesSet is already present in the object');
    return;
  }
  self.set('destroyableValuesSet', new Set());
}

/**
 * Destroys values created by destroyable computed propertie that are left undestroyed.
 * Should be invoked in the `willDestroy` hook.
 *
 * @param {EmberObject} self
 * @returns {void}
 */
export function destroyDestroyableComputedValues(self) {
  if (!self.destroyableValuesSet) {
    console.error(
      'destroyDestroyableComputedValues: no destroyableValuesSet found in object, use initDestroyableCache in init'
    );
    return;
  }
  self.destroyableValuesSet.values().forEach(obj => destroyCached(obj));
}

function destroyCached(obj) {
  if (typeof obj.destroy === 'function') {
    obj.destroy();
  }
  if (Array.isArray(obj)) {
    obj.forEach(item => destroyCached(item));
  }
}
