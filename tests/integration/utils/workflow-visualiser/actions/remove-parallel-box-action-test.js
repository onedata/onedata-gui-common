import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import RemoveParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-box-action';
import { getProperties, get } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const parallelBoxName = 'box1';

describe('Integration | Utility | workflow visualiser/actions/remove parallel box action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const parallelBox = ParallelBox.create({ name: parallelBoxName });
    const action = RemoveParallelBoxAction.create({
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
    expect(className).to.equal('remove-parallel-box-action-trigger');
    expect(icon).to.equal('x');
    expect(String(title)).to.equal('Remove');
  });

  it('shows modal on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('question-modal');
    expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded')).to.exist;
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Remove parallel box');
    expect(getModalBody().textContent.trim()).to.contain(
      `You are about to delete the parallel box "${parallelBoxName}".`
    );
    const yesButton = getModalFooter().querySelector('.question-yes');
    expect(yesButton.textContent.trim()).to.equal('Remove');
    expect(yesButton).to.have.class('btn-danger');
  });

  it(
    'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
    async function () {
      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-no'));
      const actionResult = await resultPromise;

      expect(get(actionResult, 'status')).to.equal('cancelled');
    }
  );

  it(
    'executes removing parallel box on submit and returns promise with successful ActionResult',
    async function () {
      const removeLaneStub = sinon.stub(this.get('parallelBox'), 'remove').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      const actionResult = await resultPromise;

      expect(removeLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes removing parallel box on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const removeLaneStub = sinon.stub(this.get('parallelBox'), 'remove')
        .returns(new Promise((resolve, reject) => rejectRemove = reject));

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      rejectRemove();
      await settled();
      const actionResult = await resultPromise;

      expect(removeLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );
});

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await settled();
  return { resultPromise };
}
