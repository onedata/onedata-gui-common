import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ModifyStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-store-action';
import { get } from '@ember/object';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';

describe('Integration | Utility | workflow-visualiser/actions/modify-store-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const store = Store.create({
      name: 'store1',
      description: 'storeDesc',
      type: 'range',
      defaultInitialContent: {
        start: 1,
        end: 10,
        step: 2,
      },
      requiresInitialContent: false,
    });
    const action = ModifyStoreAction.create({
      ownerSource: this.owner,
      context: { store },
    });
    this.setProperties({ store, action });
  });

  it('shows modal with store data on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('store-modal');
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Modify store');
    expect(getModalBody().querySelector('.name-field .form-control'))
      .to.have.value('store1');
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
    'executes modifying store on submit and returns promise with successful ActionResult',
    async function () {
      const modifyStoreStub = sinon.stub(this.get('store'), 'modify').resolves();

      const { resultPromise } = await executeAction(this);
      await fillIn('.name-field .form-control', 'store2');
      await click(getModalFooter().querySelector('.btn-submit'));
      const actionResult = await resultPromise;

      expect(modifyStoreStub).to.be.calledOnce.and.to.be.calledWith(sinon.match({
        name: 'store2',
      }));
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes modifying store on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const modifyStoreStub = sinon.stub(this.get('store'), 'modify')
        .returns(new Promise((resolve, reject) => rejectRemove = reject));

      const { resultPromise } = await executeAction(this);
      await fillIn('.name-field .form-control', 'store2');
      await click(getModalFooter().querySelector('.btn-submit'));
      rejectRemove();
      await settled();
      const actionResult = await resultPromise;

      expect(modifyStoreStub).to.be.calledOnce;
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
