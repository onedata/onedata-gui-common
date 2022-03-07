import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import { getModalBody, getModalFooter } from '../../../helpers/modal';

describe('Integration | Component | workflow visualiser/stores list', function () {
  setupRenderingTest();

  beforeEach(function () {
    const createStoreStub = sinon.stub().resolves();
    const actionsFactory = ActionsFactory.create({ ownerSource: this.owner });
    actionsFactory.setCreateStoreCallback(createStoreStub);
    this.setProperties({
      actionsFactory,
      definedStores: [
        Store.create({
          name: 'store2',
        }),
        Store.create({
          name: 'store1',
        }),
      ],
      createStoreStub,
    });
  });

  it('has class "workflow-visualiser-stores-list"', async function () {
    await renderComponent();

    expect(this.$().children()).to.have.class('workflow-visualiser-stores-list')
      .and.to.have.length(1);
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    itRendersListOfStores('edit');

    it('shows "add store" button', async function () {
      await renderComponent();

      const $addBtn = this.$('.create-store-action-trigger');
      expect($addBtn).to.exist;
      expect($addBtn.text().trim()).to.equal('Add store');
    });

    it('allows to add new store', async function () {
      await renderComponent();

      await click('.create-store-action-trigger');
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'store1');
      await click(getModalFooter().find('.btn-submit')[0]);

      expect(this.get('createStoreStub')).to.be.calledOnce.and.to.be.calledWith({
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
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itRendersListOfStores('view');

    it('does not show "add store" button', async function () {
      await renderComponent();

      expect(this.$('.create-store-action-trigger')).to.not.exist;
    });
  });
});

async function renderComponent() {
  await render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/stores-list
      actionsFactory=actionsFactory
      mode=mode
      definedStores=definedStores
    }}
  `);
}

function itRendersListOfStores(mode) {
  it('renders passed list of stores', async function () {
    await renderComponent();

    expect(this.$('.workflow-visualiser-stores-list')).to.have.class(`mode-${mode}`);
    const $stores = this.$('.workflow-visualiser-stores-list-store');
    expect($stores).to.have.length(2);
    expect($stores).to.have.class(`mode-${mode}`);
    expect($stores.eq(0).text().trim()).to.equal('store1');
    expect($stores.eq(1).text().trim()).to.equal('store2');
  });
}
