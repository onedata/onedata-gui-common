import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ModifyLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-lane-action';
import { get, getProperties } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { selectChoose } from '../../../../helpers/ember-power-select';

describe('Integration | Utility | workflow visualiser/actions/modify lane action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const lane = Lane.create({
      name: 'lane1',
      maxRetries: 0,
      storeIteratorSpec: {
        storeSchemaId: 's1',
        maxBatchSize: 100,
      },
    });
    const action = ModifyLaneAction.create({
      ownerSource: this.owner,
      context: {
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
        lane,
      },
    });
    this.setProperties({ lane, action });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('modify-lane-action-trigger');
    expect(icon).to.equal('rename');
    expect(String(title)).to.equal('Modify');
  });

  it('shows modal with lane data on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('lane-modal');
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Modify lane');
    expect(getModalBody().querySelector('.name-field .form-control'))
      .to.have.value('lane1');
    expect(
      getModalBody().querySelector('.sourceStore-field .dropdown-field-trigger')
      .textContent.trim()
    ).to.equal('store1');
  });

  it(
    'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
    async function () {
      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.btn-cancel'));
      const actionResult = await resultPromise;

      expect(get(actionResult, 'status')).to.equal('cancelled');
    }
  );

  it(
    'executes modifying lane on submit and returns promise with successful ActionResult',
    async function () {
      const modifyLaneStub = sinon.stub(this.get('lane'), 'modify').resolves();

      const { resultPromise } = await executeAction(this);
      await fillIn('.name-field .form-control', 'lane2');
      await click(getModalFooter().querySelector('.btn-submit'));
      const actionResult = await resultPromise;

      expect(modifyLaneStub).to.be.calledOnce.and.to.be.calledWith({
        name: 'lane2',
      });
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes modifying store on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const modifyLaneStub = sinon.stub(this.get('lane'), 'modify')
        .returns(new Promise((resolve, reject) => rejectRemove = reject));

      const { resultPromise } = await executeAction(this);
      await fillIn('.name-field .form-control', 'lane2');
      await click(getModalFooter().querySelector('.btn-submit'));
      rejectRemove();
      await settled();
      const actionResult = await resultPromise;

      expect(modifyLaneStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('failed');
    }
  );

  it('injects createStoreAction to modal', async function () {
    const executeStub = sinon.stub().resolves({ status: 'failed' });
    this.set('action.createStoreAction', { execute: executeStub });

    await executeAction(this);

    expect(executeStub).to.not.be.called;
    await selectChoose(
      getModalBody().querySelector('.sourceStore-field'),
      'Create store...'
    );

    expect(executeStub).to.be.calledOnce;
  });
});

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await settled();
  return { resultPromise };
}
