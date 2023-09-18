import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import RemoveStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-store-action';
import { getProperties, get } from '@ember/object';
import {
  getModal,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Integration | Utility | workflow-visualiser/actions/remove-store-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const store = Store.create({ name: 'store1' });
    const action = RemoveStoreAction.create({
      ownerSource: this.owner,
      context: { store },
    });
    this.setProperties({ store, action });
  });

  it('has correct className, icon and title', function () {
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal('remove-store-action-trigger');
    expect(icon).to.equal('browser-delete');
    expect(String(title)).to.equal('Remove');
  });

  it('shows modal on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('remove-store-modal');
    expect(getModalBody().textContent.trim()).to.contain(
      'You are about to delete the store store1.'
    );
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
    'executes removing store on submit and returns promise with successful ActionResult',
    async function () {
      const removeStoreStub = sinon.stub(this.get('store'), 'remove').resolves();

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      const actionResult = await resultPromise;

      expect(removeStoreStub).to.be.calledOnce;
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes removing store on submit and returns promise with failed ActionResult on error',
    async function () {
      let rejectRemove;
      const removeStoreStub = sinon.stub(this.get('store'), 'remove')
        .returns(new Promise((resolve, reject) => rejectRemove = reject));

      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().querySelector('.question-yes'));
      rejectRemove();
      await settled();
      const actionResult = await resultPromise;

      expect(removeStoreStub).to.be.calledOnce;
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
