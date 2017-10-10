import { Error as EmberError } from 'ember-debug';
import { computed, setProperties, get } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * After promise resolve, this property will be set to resolved value
   * @type {string}
   */
  resolvedContentProperty: 'content',

  /**
    If the proxied promise is rejected this will contain the reason
    provided.
    @property reason
    @default null
    @public
  */
  reason: null,

  /**
    Once the proxied promise has settled this will become `false`.
    @property isPending
    @default true
    @public
  */
  isPending: computed.not('isSettled').readOnly(),

  /**
    Once the proxied promise has settled this will become `true`.
    @property isSettled
    @default false
    @public
  */
  isSettled: computed.or('isRejected', 'isFulfilled').readOnly(),

  /**
    Will become `true` if the proxied promise is rejected.
    @property isRejected
    @default false
    @public
  */
  isRejected: false,

  /**
    Will become `true` if the proxied promise is fulfilled.
    @property isFulfilled
    @default false
    @public
  */
  isFulfilled: false,

  /**
    The promise whose fulfillment value is being proxied by this object.
    This property must be specified upon creation, and should not be
    changed once created.
    Example:
    ```javascript
    Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({
      promise: <thenable>
    });
    ```
    @property promise
    @public
  */
  promise: computed({
    get() {
      throw new EmberError('PromiseProxy\'s promise must be set');
    },
    set(key, promise) {
      return this._tap(promise);
    }
  }),

  /**
    An alias to the proxied promise's `then`.
    See RSVP.Promise.then.
    @method then
    @param {Function} callback
    @return {RSVP.Promise}
    @public
  */
  then: promiseAlias('then'),

  /**
    An alias to the proxied promise's `catch`.
    See RSVP.Promise.catch.
    @method catch
    @param {Function} callback
    @return {RSVP.Promise}
    @since 1.3.0
    @public
  */
  'catch': promiseAlias('catch'),

  /**
    An alias to the proxied promise's `finally`.
    See RSVP.Promise.finally.
    @method finally
    @param {Function} callback
    @return {RSVP.Promise}
    @since 1.3.0
    @public
  */
  'finally': promiseAlias('finally'),

  _tap(promise) {
    const resolvedContentProperty = this.get('resolvedContentProperty');

    setProperties(this, {
      isFulfilled: false,
      isRejected: false
    });

    return promise.then(value => {
      if (!this.isDestroyed && !this.isDestroying) {
        setProperties(this, {
          [resolvedContentProperty]: value,
          isFulfilled: true
        });
      }
      return value;
    }, reason => {
      if (!this.isDestroyed && !this.isDestroying) {
        setProperties(this, {
          reason,
          isRejected: true
        });
      }
      throw reason;
    }, 'Ember: CustomPromiseProxy');
  },
});

function promiseAlias(name) {
  return function () {
    let promise = get(this, 'promise');
    return promise[name](...arguments);
  };
}
