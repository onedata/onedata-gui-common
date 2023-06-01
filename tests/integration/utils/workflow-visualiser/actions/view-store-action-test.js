import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import { get } from '@ember/object';
import {
  getModal,
  getModalHeader,
  getModalBody,
} from '../../../../helpers/modal';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { resolve } from 'rsvp';
import { findInElementsByText } from '../../../../helpers/find';

describe('Integration | Utility | workflow-visualiser/actions/view-store-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const store = Store.create({
      name: 'store1',
      description: 'storeDesc',
      type: 'range',
      dataSpec: {
        type: 'number',
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
    expect(getModalHeader().querySelector('h1').textContent.trim())
      .to.equal('Store details');
    const navLinks = getModalBody().querySelectorAll('.bs-tab-onedata .nav-link');
    const detailsLink = findInElementsByText(navLinks, 'Details');
    await click(detailsLink);

    expect(
      getModalBody().querySelector('.name-field .field-component').textContent.trim()
    ).to.equal('store1');
  });

  it(
    'returns promise with successful ActionResult after execute() and modal close using "Close"',
    async function () {
      const { resultPromise } = await executeAction(this);
      await click(getModalHeader().querySelector('.close'));
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
