import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import Looper from 'onedata-gui-common/utils/looper';
import sinon from 'sinon';

describe('Unit | Utility | looper', function () {
  beforeEach(function () {
    this.fakeClock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: false,
    });
    this.looper = Looper.create({
      immediate: false,
      interval: 50,
    });
  });

  afterEach(function () {
    this.looper.destroy();
    this.fakeClock.restore();
  });

  it('invokes registered events in given interval', function () {
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);

    this.fakeClock.tick(160);

    expect(tickSpy).to.be.calledThrice;
  });

  it('can stop interval', function () {
    const tickSpy = sinon.spy();
    this.looper.on('tick', tickSpy);
    this.looper.stop();

    this.fakeClock.tick(160);

    expect(tickSpy).to.not.be.called;
  });
});
