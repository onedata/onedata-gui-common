import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';
import { getProperties, get } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const laneName = 'lane1';

describe('Integration | Utility | workflow visualiser/actions/remove lane action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const lane = Lane.create({ name: laneName });
    const action = RemoveLaneAction.create({
      ownerSource: this.owner,
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
    expect(className).to.equal('remove-lane-action-trigger');
    expect(icon).to.equal('x');
    expect(String(title)).to.equal('Remove');
  });

  it('shows modal on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('question-modal');
    expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded')).to.exist;
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Remove lane');
    expect(getModalBody().textContent.trim()).to.contain(
      `You are about to delete the lane "${laneName}".`
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
    'executes removing lane on submit and returns promise with successful ActionResult',
    async function () {
      const removeLaneStub = sinon.stub(this.get('lane'), 'remove').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      const actionResult = await resultPromise;

      expect(removeLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes removing lane on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const removeLaneStub = sinon.stub(this.get('lane'), 'remove')
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
