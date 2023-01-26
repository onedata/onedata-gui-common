import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll, fillIn, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { dasherize } from '@ember/string';
import { AtmDataSpecType, atmDataSpecTypesArray } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { replaceEmberAceWithTextarea } from '../../../../helpers/ember-ace';

describe('Integration | Component | atm-workflow/value-editors/full-value-editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
    this.setProperties({
      stateManager: undefined,
      setupStateManagerForItemType: (atmDataSpec) => {
        this.set('stateManager', new ValueEditorStateManager(atmDataSpec));
      },
    });
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.String,
    });
  });

  it('has class "full-value-editor"', async function () {
    await renderComponent();

    expect(find('.full-value-editor')).to.exist;
  });

  atmDataSpecTypesArray
    .filter((atmDataSpecType) => atmDataSpecType !== AtmDataSpecType.Array)
    .forEach((atmDataSpecType) => {
      it(`shows ${atmDataSpecType} editor for ${atmDataSpecType} data spec`, async function () {
        this.setupStateManagerForItemType({
          type: atmDataSpecType,
        });

        await renderComponent();

        expect(find(`.${dasherize(atmDataSpecType)}-editor`)).to.exist;
      });
    });

  it('shows array editor for array data spec', async function () {
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: {
          type: AtmDataSpecType.String,
        },
      },
    });

    await renderComponent();

    expect(find('.array-editor')).to.exist;
  });

  it('has validation state and value reflecting nested editors state', async function () {
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Number,
            },
          },
        },
      },
    });

    await renderComponent();

    expect(this.stateManager.value).to.deep.equal([]);
    expect(this.stateManager.isValid).to.be.true;

    await click('.add-item-trigger');
    await click('.add-item-trigger');
    await click('.add-item-trigger');
    await fillIn('input', '2');

    expect(this.stateManager.value).to.deep.equal([
      [2, NaN],
    ]);
    expect(this.stateManager.isValid).to.be.false;

    await fillIn('.array-item:nth-child(2) input', '3');

    expect(this.stateManager.value).to.deep.equal([
      [2, 3],
    ]);
    expect(this.stateManager.isValid).to.be.true;
  });

  it('allows to override existing value (and rendered editors) from JS level', async function () {
    this.setupStateManagerForItemType({
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Number,
            },
          },
        },
      },
    });
    await renderComponent();
    await click('.add-item-trigger');
    await click('.add-item-trigger');
    await click('.add-item-trigger');
    await fillIn('input', '2');

    this.stateManager.value = [
      [10],
    ];
    await settled();

    expect(this.stateManager.value).to.deep.equal([
      [10],
    ]);
    expect(this.stateManager.isValid).to.be.true;
    expect(findAll('.array-editor .array-editor .number-editor')).to.have.length(1);
    expect(find('input')).to.have.value('10');
  });

  it('can be disabled', async function () {
    this.stateManager.value = 'abc';
    this.stateManager.isDisabled = true;

    await renderComponent();

    expect(find('textarea:not([disabled])')).to.not.exist;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/full-value-editor
    stateManager=stateManager
  }}`);
}
