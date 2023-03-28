import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { getModalBody, getModalFooter } from '../../../../helpers/modal';
import { resolve } from 'rsvp';
import { findInElementsByText } from '../../../../helpers/find';

describe('Integration | Component | workflow-visualiser/stores-list/store', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      actionsFactory: ActionsFactory.create({
        ownerSource: this.owner,
        workflowDataProvider: {
          getStoreContent: () => resolve({ array: [], isLast: true }),
          getStoreContentPresenterContext: () => undefined,
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

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0])
      .to.have.class('workflow-visualiser-stores-list-store');
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    itShowsStoreName();
    itHasModeClass('edit');
    itAddsInputStoreClassWhenNeeded();

    it('allows to remove store', async function () {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('store.onRemove', onRemoveSpy);
      await renderComponent();

      expect(onRemoveSpy).to.not.be.called;

      await click('.remove-store-action-trigger');
      await click(getModalFooter().querySelector('.question-yes'));
      expect(onRemoveSpy).to.be.calledOnce;
    });

    it('allows to modify store on click', async function () {
      const onModifySpy = sinon.stub().resolves();
      this.set('store.onModify', onModifySpy);
      await renderComponent();

      expect(onModifySpy).to.not.be.called;

      await click('.workflow-visualiser-stores-list-store');
      const nameField = getModalBody().querySelector('.name-field .form-control');
      expect(nameField).to.have.value('store1');

      await fillIn(nameField, 'store2');
      await click(getModalFooter().querySelector('.btn-submit'));
      expect(onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('store'), sinon.match({
          name: 'store2',
        }));
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itShowsStoreName();
    itHasModeClass('view');
    itAddsInputStoreClassWhenNeeded();

    it('does not show remove button', async function () {
      await renderComponent();

      expect(find('.remove-store-action-trigger')).to.not.exist;
    });

    it('allows to view store details on click', async function () {
      await renderComponent();

      await click('.workflow-visualiser-stores-list-store');
      const navLinks = getModalBody().querySelectorAll('.bs-tab-onedata .nav-link');
      const detailsLink = findInElementsByText(navLinks, 'Details');
      await click(detailsLink);

      expect(
        getModalBody().querySelector('.name-field .field-component').textContent.trim()
      ).to.equal('store1');
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
  it('shows store name', async function () {
    await renderComponent();

    expect(find('.store-name').textContent.trim()).to.equal('store1');
  });
}

function itHasModeClass(mode) {
  const className = `mode-${mode}`;
  it(`has "${className}" class`, async function () {
    await renderComponent();

    expect(find('.workflow-visualiser-stores-list-store'))
      .to.have.class(className);
  });
}

function itAddsInputStoreClassWhenNeeded() {
  it('has class "tag-item-warning" when "requiresInitialContent" is true',
    async function () {
      this.set('store.requiresInitialContent', true);

      await renderComponent();

      expect(find('.workflow-visualiser-stores-list-store'))
        .to.have.class('tag-item-warning');
    });

  it('does not have class "tag-item-warning" when "requiresInitialContent" is false',
    async function () {
      this.set('store.requiresInitialContent', false);

      await renderComponent();

      expect(find('.workflow-visualiser-stores-list-store'))
        .to.not.have.class('tag-item-warning');
    });
}
