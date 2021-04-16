import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-lane-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const newLaneMatcher = sinon.match({
  type: 'lane',
  name: 'Untitled lane',
  tasks: [],
});

describe('Integration | Utility | workflow visualiser/actions/create lane action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const createStub = sinon.stub();
    const action = CreateLaneAction.create({
      ownerSource: this,
      createLaneCallback: createStub,
    });
    this.setProperties({ action, createStub });
  });

  it('has correct className and icon', function () {
    const {
      className,
      icon,
    } = getProperties(this.get('action'), 'className', 'icon');
    expect(className).to.equal('create-lane-action-trigger');
    expect(icon).to.equal('plus');
  });

  it(
    'executes creating lane on execute and returns promise with successful ActionResult',
    async function () {
      const createStub = this.get('createStub');
      createStub.resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith(newLaneMatcher);
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes creating lane on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectCreate;
      const createStub = this.get('createStub');
      createStub.returns(new Promise((resolve, reject) => rejectCreate = reject));

      const { resultPromise } = await executeAction(this);
      rejectCreate();
      await wait();
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith(newLaneMatcher);
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
