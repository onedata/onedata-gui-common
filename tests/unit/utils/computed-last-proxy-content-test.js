import { expect } from 'chai';
import { describe, it } from 'mocha';
import computedLastProxyContent from 'onedata-gui-common/utils/computed-last-proxy-content';
import EmberObject, { set, get, computed, observer } from '@ember/object';
import { promise, raw } from 'ember-awesome-macros';
import { Promise, resolve, reject } from 'rsvp';

const ClsBase = EmberObject.extend({
  /**
   * @virtual
   */
  proxy: undefined,

  value: computedLastProxyContent('proxy'),
  valueObserver: observer('value', function () {}),
  init() {
    this._super(...arguments);
    this.get('value');
  },
});

describe('Unit | Utility | computed last proxy content', function () {
  it('returns undefined if proxy is not yet resolved', function () {
    const Cls = ClsBase.extend({
      proxy: promise.object(raw(new Promise(() => {}))),
    });

    const obj = Cls.create();

    expect(get(obj, 'value')).to.equal(undefined);
  });

  it('returns resolved value if proxy resolves one time', function () {
    const val = 'val';
    const Cls = ClsBase.extend({
      proxy: promise.object(raw(resolve(val))),
    });

    const obj = Cls.create();

    return get(obj, 'proxy').then(() => {
      expect(get(obj, 'value')).to.equal(val);
    });
  });

  it('returns first resolved value if proxy is recomputed and pending', function () {
    const val1 = {};
    const val2 = {};
    const Cls = EmberObject.extend({
      dependency: val1,
      proxy: promise.object(computed('dependency', function proxy() {
        return resolve(this.get('dependency'));
      })),
      value: computedLastProxyContent('proxy'),
    });

    const obj = Cls.create();

    return get(obj, 'proxy').then(() => {
      get(obj, 'value');
      set(obj, 'dependency', val2);
      get(obj, 'proxy.content');
      expect(get(obj, 'value')).to.equal(val1);
    });
  });

  it('returns first resolved value if proxy is recomputed and rejected', function () {
    const val1 = {};
    const val2 = {};
    const secondValueError = {};
    const Cls = EmberObject.extend({
      dependency: val1,
      proxy: promise.object(computed('dependency', function proxy() {
        const dependency = this.get('dependency');
        if (dependency === val1) {
          return resolve(dependency);
        } else {
          return reject(secondValueError);
        }
      })),
      value: computedLastProxyContent('proxy'),
    });

    const obj = Cls.create();

    return get(obj, 'proxy').then(() => {
      get(obj, 'value');
      set(obj, 'dependency', val2);
      return get(obj, 'proxy');
    }).catch((error) => {
      if (error === secondValueError) {
        expect(get(obj, 'value')).to.equal(val1);
      } else {
        throw error;
      }
    });
  });

  it('returns second resolved value if proxy is recomputed and fulfilled', function () {
    const val1 = {};
    const val2 = {};
    const Cls = EmberObject.extend({
      dependency: val1,
      proxy: promise.object(computed('dependency', function proxy() {
        return resolve(this.get('dependency'));
      })),
      value: computedLastProxyContent('proxy'),
    });

    const obj = Cls.create();

    return get(obj, 'proxy').then(() => {
      set(obj, 'dependency', val2);
      return get(obj, 'proxy');
    }).then(() => {
      expect(get(obj, 'value')).to.equal(val2);
    });
  });

  it('returns second resolved value if proxy is recomputed and fulfilled', function () {
    const val1 = {};
    const val2 = {};
    const Cls = EmberObject.extend({
      dependency: val1,
      proxy: promise.object(computed('dependency', function proxy() {
        return resolve(this.get('dependency'));
      })),
      value: computedLastProxyContent('proxy'),
    });

    const obj = Cls.create();

    return get(obj, 'proxy').then(() => {
      set(obj, 'dependency', val2);
      return get(obj, 'proxy');
    }).then(() => {
      expect(get(obj, 'value')).to.equal(val2);
    });
  });
});
