import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import CreateStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-store-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import { click, fillIn } from 'ember-native-dom-helpers';

describe('Integration | Utility | workflow visualiser/actions/create store action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const createStub = sinon.stub();
    const action = CreateStoreAction.create({
      ownerSource: this.owner,
      createStoreCallback: createStub,
    });
    this.setProperties({ action, createStub });
  });

  it('has correct title, className and icon', function () {
    const {
      title,
      className,
      icon,
    } = getProperties(this.get('action'), 'title', 'className', 'icon');
    expect(String(title)).to.equal('Add store');
    expect(className).to.equal('create-store-action-trigger');
    expect(icon).to.equal('plus');
  });

  it('shows modal with empty store form on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('store-modal');
    expect(getModalHeader().find('h1').text().trim()).to.equal('Create new store');
    expect(getModalBody().find('.name-field .form-control')).to.have.value('');
  });

  it(
    'executes creating store on execute and returns promise with successful ActionResult',
    async function () {
      const createStub = this.get('createStub');
      createStub.resolves();

      const { resultPromise } = await executeAction(this);
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'store1');
      await click(getModalFooter().find('.btn-submit')[0]);
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith({
        name: 'store1',
        description: '',
        type: 'list',
        config: {
          itemDataSpec: {
            type: 'integer',
            valueConstraints: {},
          },
        },
        defaultInitialContent: null,
        requiresInitialContent: false,
      });
      expect(get(actionResult, 'status')).to.equal('done');
    }
  );

  it(
    'executes creating store on execute and returns promise with failed ActionResult on error',
    async function () {
      let rejectCreate;
      const createStub = this.get('createStub');
      createStub.returns(new Promise((resolve, reject) => rejectCreate = reject));

      const { resultPromise } = await executeAction(this);
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'store1');
      await click(getModalFooter().find('.btn-submit')[0]);
      rejectCreate();
      await wait();
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce;
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
