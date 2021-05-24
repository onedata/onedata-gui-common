import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import { getModalBody, getModalFooter } from '../../../helpers/modal';

describe('Integration | Component | workflow visualiser/stores list', function () {
  setupComponentTest('workflow-visualiser/stores-list', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      actionsFactory: ActionsFactory.create({ ownerSource: this }),
      stores: [
        Store.create({
          name: 'store2',
        }),
        Store.create({
          name: 'store1',
        }),
      ],
      createStoreStub: sinon.stub().resolves(),
    });
  });

  it('has class "workflow-visualiser-stores-list"', async function () {
    await render(this);

    expect(this.$().children()).to.have.class('workflow-visualiser-stores-list')
      .and.to.have.length(1);
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    itRendersListOfStores('edit');

    it('shows "add store" button', async function () {
      render(this);

      const $addBtn = this.$('.create-store-action-trigger');
      expect($addBtn).to.exist;
      expect($addBtn.text().trim()).to.equal('Add store');
    });

    it('allows to add new store', async function () {
      render(this);

      await click('.create-store-action-trigger');
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'store1');
      await click(getModalFooter().find('.btn-submit')[0]);

      expect(this.get('createStoreStub')).to.be.calledOnce.and.to.be.calledWith({
        name: 'store1',
        description: '',
        type: 'list',
        dataSpec: {
          type: 'integer',
          valueConstraints: {},
        },
        defaultInitialValue: '',
        requiresInitialValue: false,
      });
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itRendersListOfStores('view');

    it('does not show "add store" button', async function () {
      render(this);

      expect(this.$('.create-store-action-trigger')).to.not.exist;
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/stores-list
      actionsFactory=actionsFactory
      mode=mode
      stores=stores
      onStoreCreate=createStoreStub
    }}
  `);
  await wait();
}

function itRendersListOfStores(mode) {
  it('renders passed list of stores', async function () {
    render(this);

    const $stores = this.$('.workflow-visualiser-stores-list-store');
    expect($stores).to.have.length(2);
    expect($stores).to.have.class(`mode-${mode}`);
    expect($stores.eq(0).text().trim()).to.equal('store1');
    expect($stores.eq(1).text().trim()).to.equal('store2');
  });
}
