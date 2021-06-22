import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import CreateLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-lane-action';
import { getProperties, get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import { click, fillIn } from 'ember-native-dom-helpers';

describe('Integration | Utility | workflow visualiser/actions/create lane action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const createStub = sinon.stub();
    const action = CreateLaneAction.create({
      ownerSource: this,
      stores: [
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
    expect(getModalHeader().find('h1').text().trim()).to.equal('Create new lane');
    expect(getModalBody().find('.name-field .form-control')).to.have.value('');
  });

  it(
    'executes creating lane on execute and returns promise with successful ActionResult',
    async function () {
      const createStub = this.get('createStub');
      createStub.resolves();

      const { resultPromise } = await executeAction(this);
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'lane1');
      await click(getModalFooter().find('.btn-submit')[0]);
      const actionResult = await resultPromise;

      expect(createStub).to.be.calledOnce.and.to.be.calledWith({
        name: 'lane1',
        storeIteratorSpec: {
          strategy: {
            type: 'serial',
          },
          storeSchemaId: 's1',
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
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'lane1');
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
  testCase.render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
