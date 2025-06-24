import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { syncObserver, asyncObserver, PropertyAsyncObserver } from 'onedata-gui-common/utils/observer';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';

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

  it('[PropertyAsyncObserver] invokes onChange callback for property change in EmberObject', async function () {
    const onChangeSpy = sinon.spy();
    const Cls = EmberObject.extend({
      prop: 1,
      init() {
        this._super(...arguments);
        this.obs = PropertyAsyncObserver.create({
          path: 'source.prop',
          onChange: onChangeSpy,
          source: this,
        });
      },
      willDestroy() {
        this.obs.destroy();
      },
    });

    this.obj = Cls.create();
    expect(onChangeSpy).to.have.not.been.called;
    this.obj.set('prop', 2);

    // async by default
    expect(onChangeSpy).to.have.not.been.called;
    await settled();
    expect(onChangeSpy).to.have.been.calledOnce;
  });

  it('[PropertyAsyncObserver] invokes onChange callback for tracked property change of plain object',
    async function () {
      const onChangeSpy = sinon.spy();
      const Cls = class Source {
        @tracked
        prop = 1;

        constructor() {
          this.obs = PropertyAsyncObserver.create({
            path: 'source.prop',
            onChange: onChangeSpy,
            source: this,
          });
        }

        destroy() {}
      };

      this.obj = new Cls();
      expect(onChangeSpy).to.have.not.been.called;
      this.obj.prop = 2;

      // async by default
      expect(onChangeSpy).to.have.not.been.called;
      await settled();
      expect(onChangeSpy).to.have.been.calledOnce;
    }
  );
});
