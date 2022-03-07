import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import MoveDownParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-down-parallel-box-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Utility | workflow visualiser/actions/move down parallel box action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const parallelBox = ParallelBox.create({ isLast: false });
    const action = MoveDownParallelBoxAction.create({
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
    expect(className).to.equal('move-down-parallel-box-action-trigger');
    expect(icon).to.equal('move-down');
    expect(String(title)).to.equal('Move down');
  });

  it('is enabled when parallel box has false "isLast"', function () {
    this.set('parallelBox.isLast', false);

    expect(this.get('action.disabled')).to.be.false;
  });

  it('is disabled when parallel box has true "isLast', function () {
    this.set('parallelBox.isLast', true);

    expect(this.get('action.disabled')).to.be.true;
  });

  it(
    'executes moving parallel box on execute and returns promise with successful ActionResult',
    async function () {
      const clearLaneStub = sinon.stub(this.get('parallelBox'), 'move').resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(clearLaneStub).to.be.calledOnce.and.to.be.calledWith(1);
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

      expect(moveLaneStub).to.be.calledOnce.and.to.be.calledWith(1);
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
