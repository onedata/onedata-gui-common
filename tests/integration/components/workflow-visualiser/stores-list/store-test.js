import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { getModalFooter } from '../../../../helpers/modal';

describe('Integration | Component | workflow visualiser/stores list/store', function () {
  setupComponentTest('workflow-visualiser/stores-list/store', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      actionsFactory: ActionsFactory.create({ ownerSource: this }),
      store: Store.create({
        name: 'store1',
        description: 'storeDesc',
        type: 'range',
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

    it('allows to remove store', async function () {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('store.onRemove', onRemoveSpy);
      await render(this);

      expect(onRemoveSpy).to.not.be.called;

      await click('.remove-store-action-trigger');
      await click(getModalFooter().find('.question-yes')[0]);
      expect(onRemoveSpy).to.be.calledOnce;
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itShowsStoreName();
    itHasModeClass('view');

    it('does not show remove button', async function () {
      await render(this);

      expect(this.$('.remove-store-action-trigger')).to.not.exist;
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
