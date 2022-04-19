import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import sinon from 'sinon';
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

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('workflow-visualiser-stores-list');
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    itRendersListOfStores('edit');

    it('shows "add store" button', async function (done) {
      await renderComponent();

      const addBtn = find('.create-store-action-trigger');
      expect(addBtn).to.exist;
      expect(addBtn.textContent.trim()).to.equal('Add store');
      done();
    });

    it('allows to add new store', async function (done) {
      await renderComponent();

      await click('.create-store-action-trigger');
      await fillIn(getModalBody().querySelector('.name-field .form-control'), 'store1');
      await click(getModalFooter().querySelector('.btn-submit'));

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
      done();
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itRendersListOfStores('view');

    it('does not show "add store" button', async function (done) {
      await renderComponent();

      expect(find('.create-store-action-trigger')).to.not.exist;
      done();
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
  it('renders passed list of stores', async function (done) {
    await renderComponent();

    expect(find('.workflow-visualiser-stores-list')).to.have.class(`mode-${mode}`);
    const stores = findAll('.workflow-visualiser-stores-list-store');
    expect(stores).to.have.length(2);
    expect(stores[0]).to.have.class(`mode-${mode}`);
    expect(stores[1]).to.have.class(`mode-${mode}`);
    expect(stores[0].textContent.trim()).to.equal('store1');
    expect(stores[1].textContent.trim()).to.equal('store2');
    done();
  });
}
