import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-task-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise, resolve, reject } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';

const newTaskMatcher = sinon.match({
  name: 'task1',
});

describe('Integration | Utility | workflow visualiser/actions/create task action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const createStub = sinon.stub();
    const action = CreateTaskAction.create({
      ownerSource: this,
      stores: [
        Store.create({
          id: 's1',
          name: 'store1',
        }),
        Store.create({
          id: 's2',
          name: 'store2',
        }),
      ],
      taskDetailsProviderCallback: () => resolve({
        name: 'task1',
      }),
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
    'executes creating task on execute and returns promise with failed ActionResult on data provider error',
    async function () {
      const createStub = this.get('createStub');
      this.set('action.taskDetailsProviderCallback', () => reject());

      const { resultPromise } = await executeAction(this);
      await wait();
      const actionResult = await resultPromise;

      expect(createStub).to.not.be.called;
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );

  it(
    'executes creating task on execute and returns promise with failed ActionResult on create error',
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
