import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';
import { getProperties, get } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const taskName = 'task1';

describe('Integration | Utility | workflow visualiser/actions/remove task action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const task = Task.create({ name: taskName });
    const action = RemoveTaskAction.create({
      ownerSource: this.owner,
      context: { task },
    });
    this.setProperties({ task, action });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('remove-task-action-trigger');
    expect(icon).to.equal('x');
    expect(String(title)).to.equal('Remove');
  });

  it('shows modal on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('question-modal');
    expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist;
    expect(getModalHeader().find('h1').text().trim()).to.equal('Remove task');
    expect(getModalBody().text().trim()).to.contain(
      `You are about to delete the task "${taskName}".`
    );
    const $yesButton = getModalFooter().find('.question-yes');
    expect($yesButton.text().trim()).to.equal('Remove');
    expect($yesButton).to.have.class('btn-danger');
  });

  it(
    'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
    async function () {
      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.question-no')[0]);
      const actionResult = await resultPromise;

      expect(get(actionResult, 'status')).to.equal('cancelled');
    }
  );

  it(
    'executes removing task on submit and returns promise with successful ActionResult',
    async function () {
      const removeLaneStub = sinon.stub(this.get('task'), 'remove').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.question-yes')[0]);
      const actionResult = await resultPromise;

      expect(removeLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes removing task on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const removeLaneStub = sinon.stub(this.get('task'), 'remove')
        .returns(new Promise((resolve, reject) => rejectRemove = reject));

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.question-yes')[0]);
      rejectRemove();
      await wait();
      const actionResult = await resultPromise;

      expect(removeLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
