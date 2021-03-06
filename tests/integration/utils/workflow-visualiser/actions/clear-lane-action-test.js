import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import { getProperties, get } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { Promise } from 'rsvp';

const laneName = 'lane1';

describe('Integration | Utility | workflow visualiser/actions/clear lane action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const lane = Lane.create({
      name: laneName,
      elements: [ParallelBox.create()],
    });
    const action = ClearLaneAction.create({
      ownerSource: this,
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
    expect(icon).to.equal('remove');
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
    expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist;
    expect(getModalHeader().find('h1').text().trim()).to.equal('Clear lane');
    expect(getModalBody().text().trim()).to.contain(
      `You are about to clear the lane "${laneName}".`
    );
    const $yesButton = getModalFooter().find('.question-yes');
    expect($yesButton.text().trim()).to.equal('Clear');
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
    'executes clearing lane on submit and returns promise with successful ActionResult',
    async function () {
      const clearLaneStub = sinon.stub(this.get('lane'), 'clear').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.question-yes')[0]);
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
      await click(getModalFooter().find('.question-yes')[0]);
      rejectClear();
      await wait();
      const actionResult = await resultPromise;

      expect(clearLaneStub).to.be.calledOnce;
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
