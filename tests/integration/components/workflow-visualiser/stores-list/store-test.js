import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { getModalBody, getModalFooter } from '../../../../helpers/modal';
import { resolve } from 'rsvp';

describe('Integration | Component | workflow visualiser/stores list/store', function () {
  setupComponentTest('workflow-visualiser/stores-list/store', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      actionsFactory: ActionsFactory.create({
        ownerSource: this,
        workflowDataProvider: {
          getStoreContent: () => resolve({ array: [], isLast: true }),
        },
      }),
      store: Store.create({
        name: 'store1',
        description: 'storeDesc',
        type: 'range',
        dataSpec: {
          type: 'integer',
          valueConstraints: {},
        },
        defaultInitialValue: {
          start: 1,
          end: 10,
          step: 2,
        },
        requiresInitialValue: false,
      }),
    });
  });

  it('has class "workflow-visualiser-stores-list-store"', async function () {
    this.render(hbs `{{workflow-visualiser/stores-list/store}}`);

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

    it('allows to remove store', async function () {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('store.onRemove', onRemoveSpy);
      await render(this);

      expect(onRemoveSpy).to.not.be.called;

      await click('.remove-store-action-trigger');
      await click(getModalFooter().find('.question-yes')[0]);
      expect(onRemoveSpy).to.be.calledOnce;
    });

    it('allows to modify store on click', async function () {
      const onModifySpy = sinon.stub().resolves();
      this.set('store.onModify', onModifySpy);
      await render(this);

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
      await render(this);

      expect(this.$('.remove-store-action-trigger')).to.not.exist;
    });

    it('allows to view store details on click', async function () {
      await render(this);

      await click('.workflow-visualiser-stores-list-store');
      await click(getModalBody()
        .find('.bs-tab-onedata .nav-link:contains("Details")')[0]);
      expect(getModalBody().find('.name-field .field-component').text().trim())
        .to.equal('store1');
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/stores-list/store
      mode=mode
      store=store
      actionsFactory=actionsFactory
    }}
  `);
  await wait();
}

function itShowsStoreName() {
  it('shows store name', async function () {
    await render(this);

    expect(this.$('.store-name').text().trim()).to.equal('store1');
  });
}

function itHasModeClass(mode) {
  const className = `mode-${mode}`;
  it(`has "${className}" class`, async function () {
    await render(this);

    expect(this.$('.workflow-visualiser-stores-list-store'))
      .to.have.class(className);
  });
}

function itAddsInputStoreClassWhenNeeded() {
  it('has class "tag-item-warning" when "requiresInitialValue" is true',
    async function () {
      this.set('store.requiresInitialValue', true);

      await render(this);

      expect(this.$('.workflow-visualiser-stores-list-store'))
        .to.have.class('tag-item-warning');
    });

  it('does not have class "tag-item-warning" when "requiresInitialValue" is false',
    async function () {
      this.set('store.requiresInitialValue', false);

      await render(this);

      expect(this.$('.workflow-visualiser-stores-list-store'))
        .to.not.have.class('tag-item-warning');
    });
}
