import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import MoveUpParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-up-parallel-box-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Utility | workflow visualiser/actions/move up parallel box action', function () {
  setupTest();

  beforeEach(function () {
    const parallelBox = ParallelBox.create({ isLast: false });
    const action = MoveUpParallelBoxAction.create({
      ownerSource: this.owner,
      context: { parallelBox },
    });
    this.setProperties({ parallelBox, action });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('move-up-parallel-box-action-trigger');
    expect(icon).to.equal('move-up');
    expect(String(title)).to.equal('Move up');
  });

  it('is enabled when parallel box has false "isFirst"', function () {
    this.set('parallelBox.isFirst', false);

    expect(this.get('action.disabled')).to.be.false;
  });

  it('is disabled when parallel box has true "isFirst', function () {
    this.set('parallelBox.isFirst', true);

    expect(this.get('action.disabled')).to.be.true;
  });

  it(
    'executes moving parallel box on execute and returns promise with successful ActionResult',
    async function () {
      const clearLaneStub = sinon.stub(this.get('parallelBox'), 'move').resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(clearLaneStub).to.be.calledOnce.and.to.be.calledWith(-1);
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes moving parallel box on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectMove;
      const moveLaneStub = sinon.stub(this.get('parallelBox'), 'move')
        .returns(new Promise((resolve, reject) => rejectMove = reject));

      const { resultPromise } = await executeAction(this);
      rejectMove();
      await wait();
      const actionResult = await resultPromise;

      expect(moveLaneStub).to.be.calledOnce.and.to.be.calledWith(-1);
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
