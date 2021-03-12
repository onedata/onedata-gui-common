import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import RemoveParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-block-action';
import { getProperties, get } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const parallelBlockName = 'block1';

describe('Integration | Utility | workflow visualiser/actions/remove parallel block action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const parallelBlock = ParallelBlock.create({ name: parallelBlockName });
    const action = RemoveParallelBlockAction.create({
      ownerSource: this,
      context: { parallelBlock },
    });
    this.setProperties({ parallelBlock, action });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('remove-parallel-block-action-trigger');
    expect(icon).to.equal('x');
    expect(String(title)).to.equal('Remove');
  });

  it('shows modal on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('question-modal');
    expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist;
    expect(getModalHeader().find('h1').text().trim()).to.equal('Remove parallel block');
    expect(getModalBody().text().trim()).to.contain(
      `You are about to delete the parallel block "${parallelBlockName}".`
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
    'executes removing parallel block on submit and returns promise with successful ActionResult',
    async function () {
      const removeLaneStub = sinon.stub(this.get('parallelBlock'), 'remove').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.question-yes')[0]);
      const actionResult = await resultPromise;

      expect(removeLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes removing parallel block on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const removeLaneStub = sinon.stub(this.get('parallelBlock'), 'remove')
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
  testCase.render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
