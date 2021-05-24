import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';

describe('Integration | Component | workflow visualiser/stores list', function () {
  setupComponentTest('workflow-visualiser/stores-list', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      stores: [
        Store.create({
          name: 'store2',
        }),
        Store.create({
          name: 'store1',
        }),
      ],
    });
  });

  it('has class "workflow-visualiser-stores-list"', async function () {
    this.render(hbs `{{workflow-visualiser/stores-list}}`);

    expect(this.$().children()).to.have.class('workflow-visualiser-stores-list')
      .and.to.have.length(1);
  });

  it('renders passed list of stores', async function () {
    render(this);

    const $stores = this.$('.workflow-visualiser-stores-list-store');
    expect($stores).to.have.length(2);
    expect($stores.eq(0).text().trim()).to.equal('store1');
    expect($stores.eq(1).text().trim()).to.equal('store2');
  });
});

async function render(testCase) {
  testCase.render(hbs `{{workflow-visualiser/stores-list
    mode=mode
    stores=stores
  }}`);
  await wait();
}
