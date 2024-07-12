import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { syncObserver, asyncObserver } from 'onedata-gui-common/utils/observer';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | observer', function () {
  afterEach(function () {
    this.obj?.destroy();
  });

  it('[syncObserver] creates sync observer', function () {
    const obsSpy = sinon.spy();
    const Cls = EmberObject.extend({
      prop: 1,
      obs: syncObserver('prop', function obs() {
        obsSpy();
      }),
    });

    this.obj = Cls.create();
    expect(obsSpy).to.have.not.been.called;
    this.obj.set('prop', 2);

    expect(obsSpy).to.have.been.calledOnce;
  });

  it('[asyncObserver] creates async observer', async function () {
    const obsSpy = sinon.spy();
    const Cls = EmberObject.extend({
      prop: 1,
      obs: asyncObserver('prop', function obs() {
        obsSpy();
      }),
    });

    this.obj = Cls.create();
    expect(obsSpy).to.have.not.been.called;
    this.obj.set('prop', 2);

    expect(obsSpy).to.have.not.been.called;
    await settled();
    expect(obsSpy).to.have.been.calledOnce;
  });
});
