import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const componentClass = 'table-header';

const valueColumn = { label: 'Value' };
const columnsPerStoreType = {
  singleValue: [valueColumn],
  list: [valueColumn],
  treeForest: [valueColumn],
  range: [valueColumn],
};

describe('Integration | Component | modals/workflow visualiser/store modal/store content table/tabel header',
  function () {
    setupComponentTest('modals/workflow-visualiser/store-modal/store-content-table/tabel-header', {
      integration: true,
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    Object.keys(columnsPerStoreType).forEach(storeType => {
      context(`when "storeType" is "${storeType}"`, function () {
        const columns = columnsPerStoreType[storeType];
        const headerClassForStoreType = `${storeType}-table-header`;

        beforeEach(function () {
          this.set('storeType', storeType);
        });

        it(`has class "${headerClassForStoreType}"`, async function () {
          await render(this);

          expect(this.$(`.${componentClass}`)).to.have.class(headerClassForStoreType);
        });

        it('shows column headers', async function () {
          await render(this);

          const $ths = this.$('th');
          expect($ths).to.have.length(columns.length);
          columns.forEach(({ label }, idx) =>
            expect($ths.eq(idx).text().trim()).to.equal(label)
          );
        });
      });
    });
  });

async function render(testCase) {
  testCase.render(hbs `
    {{modals/workflow-visualiser/store-modal/store-content-table/tabel-header
      storeType=storeType
    }}
  `);
  await wait();
}
