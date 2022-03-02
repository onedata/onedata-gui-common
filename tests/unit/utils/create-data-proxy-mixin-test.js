import { expect } from 'chai';
import { describe, it } from 'mocha';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import EmberObject, { get } from '@ember/object';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Unit | Utility | create data proxy mixin', function () {
  it('adds property that will eventually contain resolved data using fetch function',
    function () {
      const data = 'hello';
      const fetch = sinon.stub().resolves(data);

      const mixin = createDataProxyMixin('world', fetch);
      const obj = EmberObject.extend(mixin, {}).create();
      obj.updateWorldProxy();

      expect(get(obj, 'worldProxy.isFulfilled')).to.be.false;
      return wait().then(() => {
        expect(get(obj, 'worldProxy.isFulfilled')).to.be.true;
        expect(get(obj, 'world')).to.equal(data);
      });
    }
  );

  it('has getDataProxy method which will generate new proxy if not found', function () {
    const data = 'hello';
    const fetch = sinon.stub().resolves(data);

    const mixin = createDataProxyMixin('world', fetch);
    const obj = EmberObject.extend(mixin, {}).create();

    obj.getWorldProxy();
    return wait()
      .then(() => {
        expect(fetch).to.be.calledOnce;
        expect(get(obj, 'worldProxy.isFulfilled')).to.be.true;
        expect(get(obj, 'world')).to.equal(data);
        obj.getWorldProxy();
      })
      .then(() => {
        expect(fetch).to.be.calledOnce;
      });
  });

  it('has getDataProxy method which can force reload proxy', function () {
    const fetch = sinon.stub()
      .onFirstCall().resolves(1)
      .onSecondCall().resolves(2);

    const mixin = createDataProxyMixin('world', fetch);
    const obj = EmberObject.extend(mixin, {}).create();

    obj.getWorldProxy();
    return wait()
      .then(() => {
        expect(fetch).to.be.calledOnce;
        expect(get(obj, 'world')).to.equal(1);
        obj.getWorldProxy({ reload: true });
        return wait();
      })
      .then(() => {
        expect(fetch).to.be.calledTwice;
        expect(get(obj, 'world')).to.equal(2);
      });
  });

  it('passes arguments in updateDataProxy to fetch function', function () {
    const fetch = sinon.stub().resolves('hello');

    const mixin = createDataProxyMixin('world', fetch);
    const obj = EmberObject.extend(mixin, {}).create();
    obj.updateWorldProxy({ fetchArgs: [1, 2] });

    return wait().then(() => {
      expect(fetch).to.be.calledOnce;
      expect(fetch).to.be.calledWith(1, 2);
    });
  });

  it('supports using one proxy as a source of data for another proxy', function () {
    const fetchOriginal = sinon.stub()
      .onFirstCall().resolves(1)
      .onSecondCall().resolves(2);
    const mixinOriginal = createDataProxyMixin('world', fetchOriginal);
    const objOriginal = EmberObject.extend(mixinOriginal, {}).create();
    const fetchUsingProxy = function fetchUsingProxy() {
      return objOriginal.getWorldProxy({ reload: true });
    };

    const mixinUsingProxy = createDataProxyMixin('world', fetchUsingProxy);
    const obj = EmberObject.extend(mixinUsingProxy, {}).create();
    obj.updateWorldProxy();

    return wait().then(() => {
      expect(fetchOriginal).to.be.calledOnce;
      expect(get(objOriginal, 'world'), 'first original').to.equal(1);
      expect(get(obj, 'world'), 'first proxied').to.equal(1);
      obj.updateWorldProxy();
      return wait().then(() => {
        expect(fetchOriginal).to.be.calledTwice;
        expect(get(objOriginal, 'world'), 'second original').to.equal(2);
        expect(get(obj, 'world'), 'second proxied').to.equal(2);
      });
    });
  });

  it('can be used with ArrayProxy', function () {
    const arrData = [1, 2, 3];
    const fetch = sinon.stub().resolves(arrData);

    const mixin = createDataProxyMixin('world', { type: 'array' });
    const obj = EmberObject.extend(mixin, {
      fetchWorld: fetch,
    }).create();
    obj.updateWorldProxy();

    return wait().then(() => {
      expect(typeof get(obj, 'worldProxy.filter')).to.equal('function');
      expect(get(obj, 'worldProxy').objectAt(0)).to.equal(arrData[0]);
    });
  });

  it('initializes proxy if getting dataProxy for the first time', function () {
    const data = 'hello';
    const fetch = sinon.stub().resolves(data);

    const mixin = createDataProxyMixin('world', fetch);
    const obj = EmberObject.extend(mixin, {}).create();

    const firstGetResult = obj.get('worldProxy');
    expect(get(firstGetResult, 'isFulfilled')).to.be.false;
    expect(get(firstGetResult, 'content')).to.equal(null);
    return wait()
      .then(() => {
        expect(fetch).to.be.calledOnce;
        expect(get(firstGetResult, 'isFulfilled')).to.be.true;
        expect(get(firstGetResult, 'content')).to.equal(data);

        obj.get('worldProxy');
      })
      .then(() => {
        expect(fetch).to.be.calledOnce;
      });
  });

  it('allows to update proxy content without changing pending state', function () {
    const fetch = sinon.stub()
      .onCall(0).resolves('foo')
      .onCall(1).resolves('bar');

    const mixin = createDataProxyMixin('world', fetch);
    const obj = EmberObject.extend(mixin, {}).create();

    return obj.get('worldProxy')
      .then(() => {
        expect(fetch).to.be.calledOnce;
        const update = obj.updateWorldProxy({ replace: true });
        expect(fetch).to.be.calledTwice;
        expect(obj.get('worldProxy.isPending')).to.equal(false);
        expect(obj.get('worldProxy.isSettled')).to.equal(true);
        return update;
      })
      .then(() => {
        expect(obj.get('world')).to.equal('bar');
      });
  });
});
