import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import CreateLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-lane-action';
import { getProperties, get, set } from '@ember/object';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { lookupService } from '../../../../helpers/stub-service';

describe('Integration | Utility | workflow-visualiser/actions/create-lane-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    set(
      lookupService(this, 'workflow-manager'),
      'atmLaneFailForExceptionsRatio',
      0.1
    );
    const createStub = sinon.stub();
    const action = CreateLaneAction.create({
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
      createLaneCallback: createStub,
    });
    this.setProperties({ action, createStub });
  });

  it('has correct className and icon', function () {
    const {
      className,
      icon,
    } = getProperties(this.get('action'), 'className', 'icon');
    expect(className).to.equal('create-lane-action-trigger');
    expect(icon).to.equal('plus');
  });

  it('shows modal with empty lane form on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('lane-modal');
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Create new lane');
    expect(getModalBody().querySelector('.name-field .form-control'))
      .to.have.value('');
  });

  it(
    'executes creating lane on execute and returns promise with successful ActionResult',
    async function () {
      const createStub = this.get('createStub');
      createStub.resolves();

      const { resultPromise } = await executeAction(this);
      await fillIn(getModalBody().querySelector('.name-field .form-control'), 'lane1');
      await click(getModalFooter().querySelector('.btn-submit'));
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith({
        name: 'lane1',
        maxRetries: 0,
        failForExceptionsRatio: 0.1,
        storeIteratorSpec: {
          storeSchemaId: 's1',
          maxBatchSize: 10,
        },
        parallelBoxes: [],
      });
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes creating lane on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectCreate;
      const createStub = this.get('createStub');
      createStub.returns(new Promise((resolve, reject) => rejectCreate = reject));

      const { resultPromise } = await executeAction(this);
      await fillIn(getModalBody().querySelector('.name-field .form-control'), 'lane1');
      await click(getModalFooter().querySelector('.btn-submit'));
      rejectCreate();
      await settled();
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce;
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
