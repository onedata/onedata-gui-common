import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import ProgressTracker from 'onedata-gui-common/utils/progress-tracker';
import EmberObject, { computed } from '@ember/object';

describe('Unit | Utility | progress-tracker', function () {
  it('has observable progress computed property which is fraction of done/total', function () {
    // given
    class DummyObject extends EmberObject {
      /** @type {ProgressTracker} */
      progressTracker;

      @computed('progressTracker.progress')
      get test() {
        return this.progressTracker.progress;
      }
    }
    const progressTracker = new ProgressTracker(100);
    const tester = DummyObject.create({
      progressTracker,
    });

    // when-then
    expect(tester.test).to.equal(0);
    progressTracker.doneCount = 25;
    expect(tester.test).to.equal(0.25);
  });

  it('can be instantiated without totalCount and then added in the lifecycle', function () {
    // given
    const progressTracker = new ProgressTracker();

    // when-then
    expect(progressTracker.isValid).to.be.false;
    expect(progressTracker.progress).to.equal(0);
    progressTracker.reset(100);
    expect(progressTracker.isValid).to.be.true;
    progressTracker.doneCount = 25;
    expect(progressTracker.progress).to.equal(0.25);
  });

  it('throws error when trying to set doneCount without totalCount initialized', function () {
    // given
    const progressTracker = new ProgressTracker();

    // when-then
    expect(() => {
      progressTracker.doneCount = 25;
    }).to.throw();
  });

  it('can change totalCount which resets doneCount', function () {
    // given
    const progressTracker = new ProgressTracker(200);
    progressTracker.doneCount = 50;

    // when-then
    expect(progressTracker.progress).to.equal(0.25);
    progressTracker.reset(100);
    expect(progressTracker.doneCount).to.equal(0);
    expect(progressTracker.progress).to.equal(0);
    progressTracker.doneCount = 25;
    expect(progressTracker.progress).to.equal(0.25);
  });

  it('can be de-initialized to be in the invalid state', function () {
    // given
    const progressTracker = new ProgressTracker(100);
    progressTracker.doneCount = 25;

    // when-then
    expect(progressTracker.progress).to.equal(0.25);
    progressTracker.reset();
    expect(progressTracker.isValid).to.be.false;
    expect(progressTracker.doneCount).to.equal(0);
    expect(progressTracker.progress).to.equal(0);
  });
});
