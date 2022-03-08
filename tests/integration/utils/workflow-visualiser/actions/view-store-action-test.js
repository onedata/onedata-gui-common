import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import { get } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../../helpers/modal';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { resolve } from 'rsvp';

describe('Integration | Utility | workflow visualiser/actions/view store action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const store = Store.create({
      name: 'store1',
      description: 'storeDesc',
      type: 'range',
      dataSpec: {
        type: 'integer',
        valueConstraints: {},
      },
      defaultInitialContent: {
        start: 1,
        end: 10,
        step: 2,
      },
      requiresInitialContent: false,
    });
    const action = ViewStoreAction.create({
      ownerSource: this.owner,
      context: {
        store,
        getStoreContentCallback: () => resolve({ array: [], isLast: true }),
      },
    });
    this.setProperties({ store, action });
  });

  it('shows modal with store data on execute', async function () {
    await executeAction(this);

    expect(getModal()).to.have.class('store-modal');
    expect(getModalHeader().find('h1').text().trim()).to.equal('Store details');

    await click(
      getModalBody().find('.bs-tab-onedata .nav-link:contains("Details")')[0]
    );

    expect(getModalBody().find('.name-field .field-component').text().trim())
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
  await render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await settled();
  return { resultPromise };
}
