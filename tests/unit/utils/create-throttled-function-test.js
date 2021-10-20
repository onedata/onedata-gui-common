import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import createThrottledFunction from 'onedata-gui-common/utils/create-throttled-function';
import sinon from 'sinon';

describe('Unit | Utility | create throttled function', function () {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers({
      now: Date.now(),
    });
    this.spy = sinon.spy();
  });

  afterEach(function () {
    this.clock.restore();
  });

  it('does not call passed function if no call occurred on throttler', function () {
    createThrottledFunction(this.spy, 100);

    this.clock.tick(200);

    expect(this.spy).to.be.not.called;
  });

  it('does not throttle on first call', function () {
    const throttled = createThrottledFunction(this.spy, 100);

    throttled();

    expect(this.spy).to.be.calledOnce;
  });

  it('postpones execution on first call in non-immediate mode', function () {
    const throttled = createThrottledFunction(this.spy, 100, false);

    throttled();

    expect(this.spy).to.have.not.been.called;

    this.clock.tick(100);

    expect(this.spy).to.have.been.calledOnce;
  });

  it('postpones execution on first and next call in non-immediate mode', function () {
    const throttled = createThrottledFunction(this.spy, 100, false);

    throttled();

    expect(this.spy).to.have.not.been.called;

    this.clock.tick(100);

    throttled();

    expect(this.spy).to.have.been.calledOnce;

    this.clock.tick(100);

    expect(this.spy).to.have.been.calledTwice;
  });

  it('throttles two immediate calls', function () {
    const throttled = createThrottledFunction(this.spy, 100);

    throttled();
    throttled();

    expect(this.spy).to.be.calledOnce;

    this.clock.tick(100);

    expect(this.spy).to.be.calledTwice;

    this.clock.tick(100);

    expect(this.spy).to.be.calledTwice;
  });

  it('throttles a hundred immediate calls', function () {
    const throttled = createThrottledFunction(this.spy, 100);

    for (let i = 0; i < 100; i++) {
      throttled();
    }

    expect(this.spy).to.be.calledOnce;

    this.clock.tick(100);

    expect(this.spy).to.be.calledTwice;

    this.clock.tick(100);

    expect(this.spy).to.be.calledTwice;
  });

  it('does not throttle calls with proper interval', function () {
    const throttled = createThrottledFunction(this.spy, 100);

    throttled();
    this.clock.tick(100);
    throttled();
    this.clock.tick(100);
    throttled();

    expect(this.spy).to.be.calledThrice;

    this.clock.tick(100);

    expect(this.spy).to.be.calledThrice;
  });

  it('throttles calls with interval very close to the proper', function () {
    const throttled = createThrottledFunction(this.spy, 100);

    throttled();
    this.clock.tick(99);
    throttled();
    this.clock.tick(99);
    throttled();

    expect(this.spy).to.be.calledTwice;

    this.clock.tick(100);

    expect(this.spy).to.be.calledThrice;
  });
});
