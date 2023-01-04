import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import { getProperties, get } from '@ember/object';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const laneName = 'lane1';

describe('Integration | Utility | workflow visualiser/actions/clear lane action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const lane = Lane.create({
      name: laneName,
      elements: [ParallelBox.create()],
    });
    const action = ClearLaneAction.create({
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
    expect(className).to.equal('clear-lane-action-trigger');
    expect(icon).to.equal('checkbox-filled-x');
    expect(String(title)).to.equal('Clear');
  });

  it('is enabled when lane has at least one parallel box', function () {
    this.set('lane.elements', [ParallelBox.create()]);

    expect(this.get('action.disabled')).to.be.false;
  });

  it('is disabled when lane has no parallel box', function () {
    this.set('lane.elements', [InterblockSpace.create()]);

    expect(this.get('action.disabled')).to.be.true;
  });

  it('shows modal on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('question-modal');
    expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded')).to.exist;
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Clear lane');
    expect(getModalBody().textContent.trim()).to.contain(
      `You are about to clear the lane "${laneName}".`
    );
    const yesButton = getModalFooter().querySelector('.question-yes');
    expect(yesButton.textContent.trim()).to.equal('Clear');
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
    'executes clearing lane on submit and returns promise with successful ActionResult',
    async function () {
      const clearLaneStub = sinon.stub(this.get('lane'), 'clear').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      const actionResult = await resultPromise;

      expect(clearLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes clearing lane on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectClear;
      const clearLaneStub = sinon.stub(this.get('lane'), 'clear')
        .returns(new Promise((resolve, reject) => rejectClear = reject));

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      rejectClear();
      await settled();
      const actionResult = await resultPromise;

      expect(clearLaneStub).to.be.calledOnce;
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
