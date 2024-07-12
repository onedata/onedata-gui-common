import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import computedLastProxyContent from 'onedata-gui-common/utils/computed-last-proxy-content';
import EmberObject, {
  set,
  get,
  computed,
  observer,
} from '@ember/object';
import { promise, raw } from 'ember-awesome-macros';
import { Promise, resolve, reject } from 'rsvp';
import sinon from 'sinon';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { settled } from '@ember/test-helpers';

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

describe('Unit | Utility | computed-last-proxy-content', function () {
  afterEach(function () {
    this.obj?.destroy();
  });

  it('returns undefined if proxy is not yet resolved', function () {
    const Cls = ClsBase.extend({
      proxy: promise.object(raw(new Promise(() => {}))),
    });

    this.obj = Cls.create();

    expect(get(this.obj, 'value')).to.equal(undefined);
  });

  it('returns resolved value if proxy resolves one time', function () {
    const val = 'val';
    const Cls = ClsBase.extend({
      proxy: promise.object(raw(resolve(val))),
    });

    this.obj = Cls.create();

    return get(this.obj, 'proxy').then(() => {
      expect(get(this.obj, 'value')).to.equal(val);
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

    this.obj = Cls.create();

    return get(this.obj, 'proxy').then(() => {
      get(this.obj, 'value');
      set(this.obj, 'dependency', val2);
      get(this.obj, 'proxy.content');
      expect(get(this.obj, 'value')).to.equal(val1);
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

    this.obj = Cls.create();

    return get(this.obj, 'proxy').then(() => {
      get(this.obj, 'value');
      set(this.obj, 'dependency', val2);
      return get(this.obj, 'proxy');
    }).catch((error) => {
      if (error === secondValueError) {
        expect(get(this.obj, 'value')).to.equal(val1);
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

    this.obj = Cls.create();

    return get(this.obj, 'proxy').then(() => {
      set(this.obj, 'dependency', val2);
      return get(this.obj, 'proxy');
    }).then(() => {
      expect(get(this.obj, 'value')).to.equal(val2);
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

    this.obj = Cls.create();

    return get(this.obj, 'proxy').then(() => {
      set(this.obj, 'dependency', val2);
      return get(this.obj, 'proxy');
    }).then(() => {
      expect(get(this.obj, 'value')).to.equal(val2);
    });
  });

  it('does not trigger observer if proxy is pending', async function () {
    const Cls = EmberObject.extend({
      dependency: 1,
      proxy: computed('dependency', function proxy() {
        return promiseObject((async () => this.dependency)());
      }),
      lastValue: computedLastProxyContent('proxy'),
      lastValueObserver: observer('lastValue', function lastValueObserver() {
        this.observerSpy(this.lastValue);
      }),
      init() {
        this._super(...arguments);
        this.lastValue;
      },
    });

    const observerSpy = sinon.spy();
    this.obj = Cls.create({
      observerSpy,
    });
    await settled();

    this.obj.set('dependency', 2);
    await settled();

    expect(observerSpy).to.be.calledTwice;
    expect(observerSpy).to.be.calledWith(1);
    expect(observerSpy).to.be.calledWith(2);
  });
});
