import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { AtmDataSpecType, atmDataSpecTypesArray } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';

const customItemCreatorClasses = {
  [AtmDataSpecType.File]: 'file-array-item-creator',
  [AtmDataSpecType.Dataset]: 'dataset-array-item-creator',
};

describe('Integration | Component | atm-workflow/value-editors/array/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
    const editorContext = {};
    this.setProperties({
      stateManager: undefined,
      setupStateManagerForItemType: (itemAtmDataSpec) => {
        this.set('stateManager', new ValueEditorStateManager({
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: itemAtmDataSpec,
          },
        }, editorContext));
      },
      editorContext,
    });
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.String,
    });
  });

  it('has class "array-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('array-editor');
  });

  it('has "Array" text and mode toggle with items counter in the header when empty',
    async function () {
      await renderComponent();

      expect(find('.editor-box-header')).to.have.contain.text('Array');
      const toolbarElements = findAll('.editor-box-toolbar > :not(.separator)');
      expect(toolbarElements).to.have.length(2);
      expect(toolbarElements[0]).to.have.class('mode-trigger')
        .and.to.contain.trimmed.text('Raw');
      expect(toolbarElements[1]).to.have.class('items-count')
        .and.to.contain.trimmed.text('0 items');
    }
  );

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  atmDataSpecTypesArray.forEach((atmDataSpecType) => {
    const customItemCreatorClass = customItemCreatorClasses[atmDataSpecType];
    it(`uses ${customItemCreatorClass ? 'custom' : 'generic'} item creator component for item type ${atmDataSpecType}`,
      async function () {
        this.setupStateManagerForItemType({
          type: atmDataSpecType,
        });

        await renderComponent();

        if (customItemCreatorClass) {
          expect(find('.editor-box-content')).to.contain(`.${customItemCreatorClass}`);
        } else {
          const creatorLink = find('.editor-box-content .add-item-trigger');
          expect(creatorLink).to.have.trimmed.text('Add new item');
        }
      }
    );
  });

  it('allows to add new item', async function () {
    await renderComponent();

    await click('.add-item-trigger');

    expect(findAll('.string-editor')).to.have.length(1);
    expect(find('.items-count')).to.have.trimmed.text('1 item');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['']);
  });

  it('allows to show "raw" editor of an empty array', async function () {
    await renderComponent();

    await click('.mode-trigger');

    expect(find('.mode-trigger')).to.have.trimmed.text('Visual');
    const textarea = find('textarea');
    expect(textarea).to.exist;
    expect(textarea).to.have.value('[]');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal([]);
  });

  it('allows to add many new items using "raw" editor', async function () {
    await renderComponent();

    await click('.mode-trigger');
    await fillIn('textarea', '["abc", "def"]');

    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['abc', 'def']);

    await click('.mode-trigger');

    const stringInputs = findAll('.string-editor textarea');
    expect(stringInputs).to.have.length(2);
    expect(stringInputs[0]).to.have.value('abc');
    expect(stringInputs[1]).to.have.value('def');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['abc', 'def']);
  });

  it('allows to add many new items using "visual" editor', async function () {
    await renderComponent();

    await click('.add-item-trigger');
    await fillIn('textarea', 'abc');
    await click('.add-item-trigger');
    await fillIn('.array-item:nth-child(2) textarea', 'def');

    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['abc', 'def']);

    await click('.mode-trigger');

    expect(find('textarea')).to.have.value('[\n  "abc",\n  "def"\n]');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['abc', 'def']);
  });

  it('validates data in "visual" editor', async function () {
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.Integer,
    });
    await renderComponent();

    await click('.add-item-trigger');
    await fillIn('input', 'abc');

    expect(this.stateManager.isValid).to.be.false;
    expect(this.stateManager.value).to.deep.equal([NaN]);

    await fillIn('input', '12');

    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal([12]);
  });

  it('validates data in "raw" editor', async function () {
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.Integer,
    });
    await renderComponent();
    await click('.mode-trigger');

    await fillIn('textarea', '["abc"]');

    expect(find('.mode-trigger')).to.have.class('disabled');
    expect(this.stateManager.isValid).to.be.false;
    expect(this.stateManager.value).to.deep.equal(['abc']);

    await fillIn('textarea', '[12]');

    expect(find('.mode-trigger')).to.not.have.class('disabled');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal([12]);
  });

  it('allows to modify existing item in "visual" editor', async function () {
    this.stateManager.value = ['abc'];
    await renderComponent();

    expect(find('textarea')).to.have.value('abc');
    await fillIn('textarea', 'def');

    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['def']);
  });

  it('allows to modify existing item in "raw" editor', async function () {
    this.stateManager.value = ['abc'];
    await renderComponent();

    await click('.mode-trigger');
    expect(find('textarea')).to.have.value('[\n  "abc"\n]');
    await fillIn('textarea', '["def"]');

    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['def']);
  });

  it('shows clear action in "visual" editor when there are some items', async function () {
    this.stateManager.value = ['abc'];

    await renderComponent();

    const clearTrigger = find('.editor-box-toolbar .clear-trigger');
    expect(clearTrigger).to.exist;
    expect(clearTrigger).to.have.trimmed.text('Clear');
  });

  it('clear action shows cancellable acknowledge popover', async function () {
    this.stateManager.value = ['abc'];
    await renderComponent();

    await click('.clear-trigger');

    const popoverContent = find('.webui-popover-content');
    expect(popoverContent.querySelector('p')).to.have.trimmed.text(
      'Are you sure you want to remove the whole array content?'
    );
    const cancelBtn = find('.btn-cancel');
    expect(cancelBtn).to.have.class('btn-default');
    expect(cancelBtn).to.have.trimmed.text('No');
    const acceptBtn = find('.btn-confirm');
    expect(acceptBtn).to.have.class('btn-danger');
    expect(acceptBtn).to.have.trimmed.text('Yes');

    await click('.btn-cancel');

    expect(this.stateManager.value).to.deep.equal(['abc']);
  });

  it('allows to clear "visual" editor', async function () {
    this.stateManager.value = ['abc', 'def'];
    await renderComponent();

    await click('.clear-trigger');
    await click('.btn-confirm');

    expect(find('.string-editor')).to.not.exist;
    expect(find('.items-count')).to.have.trimmed.text('0 items');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal([]);
  });

  it('allows to clear "raw" editor', async function () {
    this.stateManager.value = ['abc', 'def'];
    await renderComponent();

    await click('.mode-trigger');
    await click('.clear-trigger');
    await click('.btn-confirm');

    expect(find('textarea')).to.have.value('[]');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal([]);
  });

  it('allows to remove items', async function () {
    this.stateManager.value = ['abc', 'def', 'ghi'];
    await renderComponent();

    await click('.array-item:nth-child(2) .remove-icon');

    expect(findAll('.string-editor')).to.have.length(2);
    expect(find('.items-count')).to.have.trimmed.text('2 items');
    expect(this.stateManager.isValid).to.be.true;
    expect(this.stateManager.value).to.deep.equal(['abc', 'ghi']);
  });

  it('collapses large number of items with appropriate expanders depending on items count',
    async function () {
      await renderComponent();

      for (let i = 1; i <= 14; i++) {
        await click('.add-item-trigger');
        await fillIn(findAll('textarea').slice(-1)[0], String(i));
      }
      expect(findAll('.string-editor')).to.have.length(14);
      expect(find('.array-collapsed-item')).to.not.exist;
      expectVisibleStringItems(numStringsArray(14));

      await click('.add-item-trigger');
      await fillIn(findAll('textarea').slice(-1)[0], '15');
      const collapsedItem = find('.array-collapsed-item');
      expect(collapsedItem).to.exist;
      expect(collapsedItem).to.contain.text('10 more items...');
      expect(collapsedItem).to.not.contain('.show-next-items');
      expect(collapsedItem.querySelector('.show-all-items')).to.exist
        .and.to.have.trimmed.text('Show all');
      expectVisibleStringItems([...numStringsArray(4), null, '15']);

      for (let i = 16; i <= 24; i++) {
        await click('.add-item-trigger');
        await fillIn(findAll('textarea').slice(-1)[0], String(i));
      }
      expect(collapsedItem).to.contain.text('19 more items...');
      expect(collapsedItem).to.not.contain('.show-next-items');
      expect(collapsedItem).to.contain('.show-all-items');
      expectVisibleStringItems([...numStringsArray(4), null, '24']);

      await click('.add-item-trigger');
      await fillIn(findAll('textarea').slice(-1)[0], '25');
      expect(collapsedItem).to.contain.text('20 more items...');
      expect(collapsedItem.querySelector('.show-next-items')).to.exist
        .and.to.have.trimmed.text('Show next 10');
      expect(collapsedItem).to.contain('.show-all-items');
      expectVisibleStringItems([...numStringsArray(4), null, '25']);
    }
  );

  it('expands all collapsed items on "show all" click', async function () {
    this.stateManager.value = numStringsArray(30);
    await renderComponent();

    await click('.show-all-items');

    expectVisibleStringItems(numStringsArray(30));
  });

  it('expands next 10 collapsed items on "show next" click', async function () {
    this.stateManager.value = numStringsArray(40);
    await renderComponent();

    await click('.show-next-items');
    expectVisibleStringItems([...numStringsArray(14), null, '40']);
    expect(find('.show-next-items')).to.exist;

    await click('.show-next-items');
    expectVisibleStringItems([...numStringsArray(24), null, '40']);
    expect(find('.show-next-items')).to.not.exist;
  });

  it('collapses new items after all previous ones were expanded', async function () {
    this.stateManager.value = numStringsArray(30);
    await renderComponent();

    await click('.show-all-items');
    for (let i = 31; i <= 40; i++) {
      await click('.add-item-trigger');
      await fillIn(findAll('textarea').slice(-1)[0], String(i));
    }

    const collapsedItem = find('.array-collapsed-item');
    expect(collapsedItem).to.contain.text('10 more items...');
    expect(collapsedItem).to.not.contain('.show-next-items');
    expect(collapsedItem).to.contain('.show-all-items');
    expectVisibleStringItems([...numStringsArray(29), null, '40']);
  });

  it('decreases remembered number of expanded items after removing some', async function () {
    this.stateManager.value = numStringsArray(30);
    await renderComponent();

    await click('.show-all-items');
    for (let i = 0; i < 5; i++) {
      await click('.array-item:last-child .remove-icon');
    }
    for (let i = 26; i <= 34; i++) {
      await click('.add-item-trigger');
      await fillIn(findAll('textarea').slice(-1)[0], String(i));
    }
    expectVisibleStringItems(numStringsArray(34));

    await click('.add-item-trigger');
    await fillIn(findAll('textarea').slice(-1)[0], '35');
    expectVisibleStringItems([...numStringsArray(24), null, '35']);
  });

  it('can be disabled when empty', async function () {
    this.stateManager.isDisabled = true;

    await renderComponent();

    expect(find('.add-item-trigger')).to.have.class('disabled');
  });

  it('can be disabled when having items', async function () {
    this.stateManager.value = numStringsArray(2);
    this.stateManager.isDisabled = true;

    await renderComponent();

    expect(find('.remove-icon')).to.not.exist;
    expect(find('input:not([disabled])')).to.not.exist;
    expect(find('.clear-trigger')).to.not.exist;
    expect(find('.add-item-trigger')).to.have.class('disabled');
  });

  it('can be disabled when having items in "raw" view', async function () {
    this.stateManager.value = numStringsArray(2);
    this.stateManager.isDisabled = true;

    await renderComponent();
    await click('.mode-trigger');

    expect(find('.remove-icon')).to.not.exist;
    expect(find('textarea:not([disabled])')).to.not.exist;
    expect(find('.clear-trigger')).to.not.exist;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/array/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}

function expectVisibleStringItems(values) {
  const valuesToCompare = findAll('.array-item').map((itemElement) => {
    if (itemElement.matches('.array-collapsed-item')) {
      return null;
    } else {
      return itemElement.querySelector('textarea').value;
    }
  });
  expect(values).to.deep.equal(valuesToCompare);
}

function numStringsArray(n) {
  return Array.from(Array(n), (_, i) => String(i + 1));
}
