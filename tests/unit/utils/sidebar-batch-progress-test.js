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
});
