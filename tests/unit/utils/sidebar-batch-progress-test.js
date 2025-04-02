import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import SidebarBatchProgress from 'onedata-gui-common/utils/sidebar-batch-progress';
import EmberObject, { computed } from '@ember/object';

describe('Unit | Utility | sidebar-batch-progress', function () {
  it('has observable progress computed property which is fraction of done/total', function () {
    // given
    class DummyObject extends EmberObject {
      /** @type {SidebarBatchProgress} */
      sidebarBatchProgress;

      @computed('sidebarBatchProgress.progress')
      get test() {
        return this.sidebarBatchProgress.progress;
      }
    }
    const sidebarBatchProgress = new SidebarBatchProgress(100);
    const tester = DummyObject.create({
      sidebarBatchProgress,
    });

    // when-then
    expect(tester.test).to.equal(0);
    sidebarBatchProgress.doneCount = 25;
    expect(tester.test).to.equal(0.25);
  });

  it('can be instantiated without totalCount and then added in the lifecycle', function () {
    // given
    const sidebarBatchProgress = new SidebarBatchProgress();

    // when-then
    expect(sidebarBatchProgress.isValid).to.be.false;
    expect(sidebarBatchProgress.progress).to.equal(0);
    sidebarBatchProgress.reset(100);
    expect(sidebarBatchProgress.isValid).to.be.true;
    sidebarBatchProgress.doneCount = 25;
    expect(sidebarBatchProgress.progress).to.equal(0.25);
  });

  it('throws error when trying to set doneCount without totalCount initialized', function () {
    // given
    const sidebarBatchProgress = new SidebarBatchProgress();

    // when-then
    expect(() => {
      sidebarBatchProgress.doneCount = 25;
    }).to.throw();
  });

  it('can change totalCount which resets doneCount', function () {
    // given
    const sidebarBatchProgress = new SidebarBatchProgress(200);
    sidebarBatchProgress.doneCount = 50;

    // when-then
    expect(sidebarBatchProgress.progress).to.equal(0.25);
    sidebarBatchProgress.reset(100);
    expect(sidebarBatchProgress.doneCount).to.equal(0);
    expect(sidebarBatchProgress.progress).to.equal(0);
    sidebarBatchProgress.doneCount = 25;
    expect(sidebarBatchProgress.progress).to.equal(0.25);
  });

  it('can be de-initialized to be in the invalid state', function () {
    // given
    const sidebarBatchProgress = new SidebarBatchProgress(100);
    sidebarBatchProgress.doneCount = 25;

    // when-then
    expect(sidebarBatchProgress.progress).to.equal(0.25);
    sidebarBatchProgress.reset();
    expect(sidebarBatchProgress.isValid).to.be.false;
    expect(sidebarBatchProgress.doneCount).to.equal(0);
    expect(sidebarBatchProgress.progress).to.equal(0);
  });
});
