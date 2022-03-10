import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { getModalBody, getModalFooter } from '../../../../helpers/modal';
import { resolve } from 'rsvp';

describe('Integration | Component | workflow visualiser/stores list/store', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      actionsFactory: ActionsFactory.create({
        ownerSource: this.owner,
        workflowDataProvider: {
          getStoreContent: () => resolve({ array: [], isLast: true }),
        },
      }),
      store: Store.create({
        name: 'store1',
        description: 'storeDesc',
        type: 'range',
        defaultInitialContent: {
          start: 1,
          end: 10,
          step: 2,
        },
        requiresInitialContent: false,
      }),
    });
  });

  it('has class "workflow-visualiser-stores-list-store"', async function () {
    await render(hbs `{{workflow-visualiser/stores-list/store}}`);

    expect(this.$().children()).to.have.class('workflow-visualiser-stores-list-store')
      .and.to.have.length(1);
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    itShowsStoreName();
    itHasModeClass('edit');
    itAddsInputStoreClassWhenNeeded();

    it('allows to remove store', async function (done) {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('store.onRemove', onRemoveSpy);
      await renderComponent();

      expect(onRemoveSpy).to.not.be.called;

      await click('.remove-store-action-trigger');
      await click(getModalFooter().find('.question-yes')[0]);
      expect(onRemoveSpy).to.be.calledOnce;
      done();
    });

    it('allows to modify store on click', async function (done) {
      const onModifySpy = sinon.stub().resolves();
      this.set('store.onModify', onModifySpy);
      await renderComponent();

      expect(onModifySpy).to.not.be.called;

      await click('.workflow-visualiser-stores-list-store');
      const $nameField = getModalBody().find('.name-field .form-control');
      expect($nameField).to.have.value('store1');

      await fillIn($nameField[0], 'store2');
      await click(getModalFooter().find('.btn-submit')[0]);
      expect(onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('store'), sinon.match({
          name: 'store2',
        }));
      done();
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itShowsStoreName();
    itHasModeClass('view');
    itAddsInputStoreClassWhenNeeded();

    it('does not show remove button', async function (done) {
      await renderComponent();

      expect(this.$('.remove-store-action-trigger')).to.not.exist;
      done();
    });

    it('allows to view store details on click', async function (done) {
      await renderComponent();

      await click('.workflow-visualiser-stores-list-store');
      await click(getModalBody()
        .find('.bs-tab-onedata .nav-link:contains("Details")')[0]);
      expect(getModalBody().find('.name-field .field-component').text().trim())
        .to.equal('store1');
      done();
    });
  });
});

async function renderComponent() {
  await render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/stores-list/store
      mode=mode
      store=store
      actionsFactory=actionsFactory
    }}
  `);
}

function itShowsStoreName() {
  it('shows store name', async function (done) {
    await renderComponent();

    expect(this.$('.store-name').text().trim()).to.equal('store1');
    done();
  });
}

function itHasModeClass(mode) {
  const className = `mode-${mode}`;
  it(`has "${className}" class`, async function (done) {
    await renderComponent();

    expect(this.$('.workflow-visualiser-stores-list-store'))
      .to.have.class(className);
    done();
  });
}

function itAddsInputStoreClassWhenNeeded() {
  it('has class "tag-item-warning" when "requiresInitialContent" is true',
    async function (done) {
      this.set('store.requiresInitialContent', true);

      await renderComponent();

      expect(this.$('.workflow-visualiser-stores-list-store'))
        .to.have.class('tag-item-warning');
      done();
    });

  it('does not have class "tag-item-warning" when "requiresInitialContent" is false',
    async function (done) {
      this.set('store.requiresInitialContent', false);

      await renderComponent();

      expect(this.$('.workflow-visualiser-stores-list-store'))
        .to.not.have.class('tag-item-warning');
      done();
    });
}
