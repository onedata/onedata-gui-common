import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import CreateParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-parallel-box-action';
import { getProperties, get } from '@ember/object';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { settled } from '@ember/test-helpers';

const newParallelBoxMatcher = sinon.match({
  name: 'Parallel box',
  tasks: [],
});

describe('Integration | Utility | workflow-visualiser/actions/create-parallel-box-action', function () {
  setupTest();

  beforeEach(function () {
    const createStub = sinon.stub();
    const action = CreateParallelBoxAction.create({
      ownerSource: this.owner,
      createParallelBoxCallback: createStub,
    });
    this.setProperties({ action, createStub });
  });

  it('has correct className and icon', function () {
    const {
      className,
      icon,
    } = getProperties(this.get('action'), 'className', 'icon');
    expect(className).to.equal('create-parallel-box-action-trigger');
    expect(icon).to.equal('add-filled');
  });

  it(
    'executes creating parallel box on execute and returns promise with successful ActionResult',
    async function () {
      const createStub = this.get('createStub');
      createStub.resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith(newParallelBoxMatcher);
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes creating parallel box on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectCreate;
      const createStub = this.get('createStub');
      createStub.returns(new Promise((resolve, reject) => rejectCreate = reject));

      const { resultPromise } = await executeAction(this);
      rejectCreate();
      await settled();
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith(newParallelBoxMatcher);
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  const resultPromise = testCase.get('action').execute();
  await settled();
  return { resultPromise };
}
