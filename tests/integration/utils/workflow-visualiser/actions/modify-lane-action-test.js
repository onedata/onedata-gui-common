import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ModifyLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-lane-action';
import { get, getProperties } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';

describe('Integration | Utility | workflow visualiser/actions/modify lane action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const lane = Lane.create({
      name: 'lane1',
      iteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 's1',
      },
    });
    const action = ModifyLaneAction.create({
      ownerSource: this,
      context: {
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
    expect(getModalHeader().find('h1').text().trim()).to.equal('Modify lane');
    expect(getModalBody().find('.name-field .form-control')).to.have.value('lane1');
  });

  it(
    'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
    async function () {
      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.btn-cancel')[0]);
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
      await click(getModalFooter().find('.btn-submit')[0]);
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
      await click(getModalFooter().find('.btn-submit')[0]);
      rejectRemove();
      await wait();
      const actionResult = await resultPromise;

      expect(modifyLaneStub).to.be.calledOnce;
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
