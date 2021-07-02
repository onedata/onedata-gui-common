import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const componentClass = 'table-row';

const valueRenderersForDataSpecs = {
  integer: {
    renderer: 'json',
    exampleValue: 1,
  },
  string: {
    renderer: 'json',
    exampleValue: 'abc',
  },
  object: {
    renderer: 'json',
    exampleValue: { a: 1 },
  },
  file: {
    renderer: 'json',
    exampleValue: { file_id: '1234' },
  },
  dataset: {
    renderer: 'json',
    exampleValue: { datasetId: '1234' },
  },
};
Object.keys(valueRenderersForDataSpecs).forEach(dataSpecName =>
  valueRenderersForDataSpecs[dataSpecName].name = dataSpecName
);

const layoutForStoreType = {
  singleValue: {
    layout: 'valueOnly',
    dataSpecRenderers: [
      valueRenderersForDataSpecs.integer,
      valueRenderersForDataSpecs.string,
      valueRenderersForDataSpecs.object,
      valueRenderersForDataSpecs.file,
      valueRenderersForDataSpecs.dataset,
    ],
  },
  list: {
    layout: 'valueOnly',
    dataSpecRenderers: [
      valueRenderersForDataSpecs.integer,
      valueRenderersForDataSpecs.string,
      valueRenderersForDataSpecs.object,
      valueRenderersForDataSpecs.file,
      valueRenderersForDataSpecs.dataset,
    ],
  },
  treeForest: {
    layout: 'valueOnly',
    dataSpecRenderers: [
      valueRenderersForDataSpecs.file,
      valueRenderersForDataSpecs.dataset,
    ],
  },
  range: {
    layout: 'valueOnly',
    dataSpecRenderers: [{
      renderer: 'json',
      exampleValue: {
        start: 1,
        end: 10,
        step: 2,
      },
    }],
  },
};

describe('Integration | Component | modals/workflow visualiser/store modal/store content table/table row', function () {
  setupComponentTest('modals/workflow-visualiser/store-modal/store-content-table/table-row', {
    integration: true,
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  it('has current entry id in "data-row-id" attribute', async function () {
    this.set('entry', { id: '123' });

    await render(this);

    expect(this.$(`.${componentClass}`)).to.have.attr('data-row-id', '123');
  });

  Object.keys(layoutForStoreType).forEach(storeType => {
    const layoutSpec = layoutForStoreType[storeType];
    layoutSpec.dataSpecRenderers.forEach(({ name, renderer, exampleValue }) => {
      it(`renders value ${JSON.stringify(exampleValue)} of ${name} data type inside ${storeType} store`,
        async function () {
          this.setProperties({
            entry: { value: exampleValue },
            storeType,
            dataSpec: {
              type: name,
            },
          });

          await render(this);

          const $tds = this.$(`.${componentClass} td`);
          let $valueTd;

          if (layoutSpec.layout === 'valueOnly') {
            expect($tds).to.have.length(1);
            $valueTd = $tds.eq(0);
          } else {
            throw new Error('unknown row layout');
          }

          if (renderer === 'json') {
            const $jsonTextarea = $valueTd.find('textarea.json-value');
            expect($jsonTextarea).to.exist.and.to.have.attr('readonly');
            expect($jsonTextarea).to.have.value(JSON.stringify(exampleValue, null, 2));
          } else {
            throw new Error('unknown value renderer');
          }
        });
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `
    {{modals/workflow-visualiser/store-modal/store-content-table/table-row
      storeType=storeType
      dataSpec=dataSpec
      entry=entry
    }}
  `);
  await wait();
}
