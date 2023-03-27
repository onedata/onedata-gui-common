import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import Looper from 'onedata-gui-common/utils/looper';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | looper', function () {
  beforeEach(function () {
    this.fakeClock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: false,
    });
  });

  afterEach(function () {
    destroyLooper(this);
    this.fakeClock.restore();
  });

  it('invokes registered events in given interval', async function () {
    setLooper(this, {
      immediate: false,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(31);

    expect(tickSpy).to.be.calledThrice;
  });

  it('invokes registered events immediately with immediate option', async function () {
    setLooper(this, {
      immediate: true,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(9);

    expect(tickSpy).to.be.calledOnce;
  });

  it('does not invoke registered events before interval time without immediate option', async function () {
    setLooper(this, {
      immediate: false,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(9);

    expect(tickSpy).to.have.been.not.called;
  });

  it('invokes registered events immediately and in given interval with immediate option', async function () {
    setLooper(this, {
      immediate: true,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(11);

    expect(tickSpy).to.be.calledTwice;
  });

  it('can stop interval', async function () {
    setLooper(this, {
      immediate: false,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);
    this.looper.stop();

    this.fakeClock.tick(31);

    expect(tickSpy).to.not.be.called;
  });

  it('does not invoke event after destroy', async function () {
    setLooper(this, {
      immediate: false,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);
    this.fakeClock.tick(1);

    this.looper.destroy();
    this.fakeClock.tick(31);

    expect(tickSpy).to.not.be.called;
  });

  it('can have its interval restarted', async function () {
    setLooper(this, {
      immediate: false,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(9);
    this.looper.restartInterval();
    // 9 + 12 = 21 --- if restart would not work, the tick could be invoked 2 times
    this.fakeClock.tick(12);

    expect(tickSpy).to.have.been.calledOnce;
  });

  it('does not invoke tick on restartInterval when immediate option is used', async function () {
    setLooper(this, {
      immediate: true,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(9);
    this.looper.restartInterval();
    this.fakeClock.tick(12);

    expect(tickSpy).to.have.been.calledOnce;
  });

  it('sets next invocation time to new interval when interval is changed on working object', async function () {
    setLooper(this, {
      immediate: false,
      interval: 10,
    });
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(9);
    this.looper.set('interval', 20);
    this.fakeClock.tick(21);

    expect(tickSpy).to.have.been.calledOnce;
  });

  it('invokes event immediately when interval is changed on working object with immediate option',
    async function () {
      setLooper(this, {
        immediate: true,
        interval: 10,
      });
      const tickSpy = sinon.spy();
      this.looper.on('tick', tickSpy);
      this.fakeClock.tick(1);
      tickSpy.resetHistory();

      this.fakeClock.tick(8);
      this.looper.set('interval', 20);
      this.fakeClock.tick(21);

      expect(tickSpy).to.have.been.calledTwice;
    }
  );
});

function setLooper(mochaContext, looperOptions = {}) {
  mochaContext.looper = Looper.create({
    immediate: false,
    interval: 50,
    ...looperOptions,
  });
  return mochaContext.looper;
}

function destroyLooper(mochaContext) {
  mochaContext.looper?.destroy();
}
