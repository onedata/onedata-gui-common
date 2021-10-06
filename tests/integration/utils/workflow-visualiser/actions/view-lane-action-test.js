import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ViewLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-lane-action';
import { get, getProperties } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';

describe('Integration | Utility | workflow visualiser/actions/view lane action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const lane = Lane.create({
      name: 'lane1',
      storeIteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 's1',
      },
    });
    const action = ViewLaneAction.create({
      ownerSource: this,
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
    expect(className).to.equal('view-lane-action-trigger');
    expect(icon).to.equal('browser-info');
    expect(String(title)).to.equal('View details');
  });

  it('shows modal with lane data on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('lane-modal');
    expect(getModalHeader().find('h1').text().trim()).to.equal('Lane details');
    expect(getModalBody().find('.name-field .field-component').text().trim())
      .to.equal('lane1');
    expect(getModalBody().find('.sourceStore-field .field-component').text().trim())
      .to.equal('store1');
  });

  it(
    'returns promise with successful ActionResult after execute() and modal close using "Close"',
    async function () {
      const { resultPromise } = await executeAction(this);
      await click(getModalFooter().find('.btn-cancel')[0]);
      const actionResult = await resultPromise;

      expect(get(actionResult, 'status')).to.equal('done');
    }
  );
});

async function executeAction(testCase) {
  testCase.render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await wait();
  return { resultPromise };
}
