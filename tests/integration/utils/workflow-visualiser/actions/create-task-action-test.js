import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-task-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const newTaskMatcher = sinon.match({
  type: 'task',
  name: 'Untitled task',
});

describe('Integration | Utility | workflow visualiser/actions/create task action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const createStub = sinon.stub();
    const action = CreateTaskAction.create({
      ownerSource: this,
      createTaskCallback: createStub,
    });
    this.setProperties({ action, createStub });
  });

  it('has correct className and icon', function () {
    const {
      className,
      icon,
    } = getProperties(this.get('action'), 'className', 'icon');
    expect(className).to.equal('create-task-action-trigger');
    expect(icon).to.equal('add-filled');
  });

  it(
    'executes creating task on execute and returns promise with successful ActionResult',
    async function () {
      const createStub = this.get('createStub');
      createStub.resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith(newTaskMatcher);
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes creating task on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectCreate;
      const createStub = this.get('createStub');
      createStub.returns(new Promise((resolve, reject) => rejectCreate = reject));

      const { resultPromise } = await executeAction(this);
      rejectCreate();
      await wait();
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith(newTaskMatcher);
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
