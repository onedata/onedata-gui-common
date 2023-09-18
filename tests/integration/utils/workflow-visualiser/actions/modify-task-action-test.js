import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import ModifyTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-task-action';
import { getProperties, get } from '@ember/object';
import sinon from 'sinon';
import { Promise, resolve, reject } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { settled } from '@ember/test-helpers';

describe('Integration | Utility | workflow-visualiser/actions/modify-task-action', function () {
  setupTest();

  beforeEach(function () {
    const task = Task.create();
    const action = ModifyTaskAction.create({
      ownerSource: this.owner,
      definedStores: [
        Store.create({
          id: 's1',
          name: 'store1',
        }),
        Store.create({
          id: 's2',
          name: 'store2',
        }),
      ],
      task,
      taskDetailsProviderCallback: () => resolve({
        name: 'task2',
      }),
    });
    this.setProperties({ action, task });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('modify-task-action-trigger');
    expect(icon).to.equal('browser-rename');
    expect(String(title)).to.equal('Modify');
  });

  it(
    'executes modifying task on execute and returns promise with successful ActionResult',
    async function () {
      const modifyStub = sinon.stub(this.get('task'), 'modify').resolves();

      const { resultPromise } = await executeAction(this);
      const actionResult = await resultPromise;

      expect(modifyStub).to.be.calledOnce.and.to.be.calledWith({ name: 'task2' });
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes modifying task on execute and returns promise with failed ActionResult on data provider error',
    async function () {
      const modifyStub = sinon.stub(this.get('task'), 'modify').resolves();
      this.set('action.taskDetailsProviderCallback', () => reject());

      const { resultPromise } = await executeAction(this);
      await settled();
      const actionResult = await resultPromise;

      expect(modifyStub).to.not.be.called;
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );

  it(
    'executes modifying task on execute and returns promise with failed ActionResult on modify error',
    async function () {
      let rejectCreate;
      const modifyStub = sinon.stub(this.get('task'), 'modify')
        .returns(new Promise((resolve, reject) => rejectCreate = reject));

      const { resultPromise } = await executeAction(this);
      rejectCreate();
      await settled();
      const actionResult = await resultPromise;

      expect(modifyStub).to.be.calledOnce.and.to.be.calledWith({ name: 'task2' });
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  const resultPromise = testCase.get('action').execute();
  await settled();
  return { resultPromise };
}
