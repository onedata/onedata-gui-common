import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  render,
  find,
  findAll,
  click,
  settled,
} from '@ember/test-helpers';
import _ from 'lodash';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';
import TestComponent from 'onedata-gui-common/components/test-component';

describe('Integration | Component | atm-workflow/value-presenters/array/visual-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
  });

  it('has classes "visual-presenter" and "array-visual-presenter"', async function () {
    await render(hbs`{{atm-workflow/value-presenters/array/visual-presenter}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('visual-presenter')
      .and.to.have.class('array-visual-presenter');
  });

  it('shows empty array', async function () {
    this.setProperties({
      value: [],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    expect(find('.root-presenter-header')).to.have.trimmed.text('Array (0)');
    expect(find('.array-item')).to.not.exist;
    expect(find('.show-more-array-items')).to.not.exist;
  });

  it('shows array items', async function () {
    this.setProperties({
      value: ['a', 'b'],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    expect(find('.root-presenter-header')).to.have.trimmed.text('Array (2)');
    const items = findAll('.array-item');
    expect(items).to.have.length(2);
    expect(items[0]).to.contain.text('"a"');
    expect(items[1]).to.contain.text('"b"');
    expect(find('.show-more-array-items')).to.not.exist;
  });

  it('shows only first 50 items of long array', async function () {
    this.setProperties({
      value: _.times(150, (idx) => String(idx)),
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    expect(find('.root-presenter-header')).to.have.trimmed.text('Array (150)');
    const items = findAll('.array-item');
    expect(items).to.have.length(50);
    expect(items[0]).to.contain.text('"0"');
    expect(items[49]).to.contain.text('"49"');
    expect(find('.show-more-array-items')).to.exist
      .and.to.have.trimmed.text('Show 50 more');
  });

  it('shows additional 50 items of long array on "show more" click', async function () {
    this.setProperties({
      value: _.times(150, (idx) => String(idx)),
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    await click('.show-more-array-items');
    const items = findAll('.array-item');
    expect(items).to.have.length(100);
    expect(items[0]).to.contain.text('"0"');
    expect(items[99]).to.contain.text('"99"');
    expect(find('.show-more-array-items')).to.exist;
  });

  it('hides "show more" button when all item have been shown', async function () {
    this.setProperties({
      value: _.times(150, (idx) => String(idx)),
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    await click('.show-more-array-items');
    await click('.show-more-array-items');
    expect(find('.show-more-array-items')).to.not.exist;
  });

  it('does not expand any item by default', async function () {
    this.setProperties({
      value: ['a', 'b'],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    expect(find('.array-item.expanded')).to.not.exist;
    expect(find('.array-item-content')).to.not.exist;
    expect(findAll('.oneicon-arrow-down')).to.have.length(2);
  });

  it('allows to expand a single item', async function () {
    this.setProperties({
      value: ['a', 'b'],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    await click('.array-item-header');
    expect(findAll('.array-item.expanded')).to.have.length(1);
    expect(findAll('.array-item-content')).to.have.length(1);
    expect(findAll('.oneicon-arrow-up')).to.have.length(1);
    expect(find('.array-item-content textarea')).to.have.value('"a"');
  });

  it('allows to expand multiple items', async function () {
    this.setProperties({
      value: ['a', 'b', 'c'],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    const itemHeaders = findAll('.array-item-header');
    await click(itemHeaders[0]);
    await click(itemHeaders[2]);
    expect(findAll('.array-item.expanded')).to.have.length(2);
    expect(findAll('.array-item-content')).to.have.length(2);
    expect(findAll('.oneicon-arrow-up')).to.have.length(2);
    const valueTextareas = findAll('.array-item-content textarea');
    expect(valueTextareas[0]).to.have.value('"a"');
    expect(valueTextareas[1]).to.have.value('"c"');
  });

  it('allows to collapse an item', async function () {
    this.setProperties({
      value: ['a', 'b', 'c'],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    const itemHeaders = findAll('.array-item-header');
    await click(itemHeaders[0]);
    await click(itemHeaders[2]);
    await click(itemHeaders[0]);
    expect(findAll('.array-item.expanded')).to.have.length(1);
    expect(findAll('.array-item-content')).to.have.length(1);
    expect(findAll('.oneicon-arrow-up')).to.have.length(1);
    expect(find('.array-item-content textarea')).to.have.value('"c"');
  });

  it('uses presenters specific for item type', async function () {
    this.setProperties({
      value: ['a'],
      dataSpec: createArrayDataSpec('string'),
    });
    await renderComponent();

    expect(find('.array-item-header .string-single-line-presenter')).to.exist;
    await click('.array-item-header');
    expect(find('.array-item-content .string-raw-presenter')).to.exist;

    this.setProperties({
      value: [{ datasetId: 'abc' }],
      dataSpec: createArrayDataSpec('dataset'),
    });
    await settled();
    expect(find('.array-item-header .dataset-single-line-presenter')).to.exist;
    expect(find('.array-item-content .dataset-visual-presenter')).to.exist;
  });

  it('passes context to children presenters', async function () {
    const { context } = this.setProperties({
      value: ['a'],
      dataSpec: createArrayDataSpec('string'),
      context: { some: 'context' },
    });

    [
      'string/single-line-presenter',
      'string/raw-presenter',
    ].forEach((presenter) => {
      this.owner.register(
        `component:atm-workflow/value-presenters/${presenter}`,
        TestComponent
      );
    });

    await renderComponent();
    await click('.array-item-header');

    [
      '.array-item-header .test-component',
      '.array-item-content .test-component',
    ].forEach((presenterSelector) =>
      expect(find(presenterSelector).componentInstance.context).to.equal(context)
    );
  });

  it('shows nested arrays', async function () {
    this.setProperties({
      value: [
        ['a', 'b'],
        ['c'],
      ],
      dataSpec: createArrayDataSpec('string', 2),
    });

    await renderComponent();

    const firstLevelItems = findAll('.array-item');
    expect(firstLevelItems).to.have.length(2);
    expect(firstLevelItems[0]).to.contain.trimmed.text('[Array (2): "a", "b"]');
    expect(firstLevelItems[1]).to.contain.trimmed.text('[Array (1): "c"]');

    await click(firstLevelItems[0].querySelector('.array-item-header'));
    expect(firstLevelItems[0].querySelector('.root-presenter-header')).to.not.exist;
    const secondLevelItems = firstLevelItems[0].querySelectorAll('.array-item');
    expect(secondLevelItems).to.have.length(2);
    expect(secondLevelItems[0]).to.contain.trimmed.text('"a"');
    expect(secondLevelItems[1]).to.contain.trimmed.text('"b"');

    await click(secondLevelItems[0].querySelector('.array-item-header'));
    expect(secondLevelItems[0].querySelector('textarea')).to.have.value('"a"');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-presenters/array/visual-presenter
    value=value
    dataSpec=dataSpec
    context=context
  }}`);
}

function createArrayDataSpec(itemType, arrayNesting = 1) {
  const itemDataSpec = {
    type: itemType,
  };
  let dataSpec = itemDataSpec;
  for (let i = 0; i < arrayNesting; i++) {
    dataSpec = {
      type: 'array',
      valueConstraints: {
        itemDataSpec: dataSpec,
      },
    };
  }
  return dataSpec;
}
