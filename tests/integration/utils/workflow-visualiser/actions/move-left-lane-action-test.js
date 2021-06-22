import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Utility | workflow visualiser/actions/move left lane action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const lane = Lane.create({ isFirst: false });
    const action = MoveLeftLaneAction.create({
      ownerSource: this,
      context: { lane },
    });
    this.setProperties({ lane, action });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('move-left-lane-action-trigger');
    expect(icon).to.equal('move-left');
    expect(String(title)).to.equal('Move left');
  });

  it('is enabled when lane has false "isFirst"', function () {
    this.set('lane.isFirst', false);

    expect(this.get('action.disabled')).to.be.false;
  });

  it('is disabled when lane has true "isLast', function () {
    this.set('lane.isFirst', true);

    expect(this.get('action.disabled')).to.be.true;
  });

  it(
    'executes moving lane on execute and returns promise with successful ActionResult',
    async function () {
      const clearLaneStub = sinon.stub(this.get('lane'), 'move').resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(clearLaneStub).to.be.calledOnce.and.to.be.calledWith(-1);
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes moving lane on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectMove;
      const moveLaneStub = sinon.stub(this.get('lane'), 'move')
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
