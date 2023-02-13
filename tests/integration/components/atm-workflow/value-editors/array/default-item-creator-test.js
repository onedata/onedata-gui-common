import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import StringValueEditorState from 'onedata-gui-common/utils/atm-workflow/value-editors/value-editor-states/string';

describe('Integration | Component | atm-workflow/value-editors/array/default-item-creator', function () {
  setupRenderingTest();

  beforeEach(function () {
    const itemAtmDataSpec = {
      type: AtmDataSpecType.String,
    };
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Array,
        valueConstraints: {
          itemDataSpec: itemAtmDataSpec,
        },
      }),
      itemAtmDataSpec,
    });
  });

  it('is a link with proper label and "add-item-trigger" class', async function () {
    await renderComponent();

    const link = find('a');
    expect(link).to.exist;
    expect(link).to.have.trimmed.text('Add new item');
    expect(link).to.have.class('add-item-trigger');
  });

  it('calls "onItemCreated" with newly created item on click', async function () {
    const onItemsCreated = this.set('onItemsCreated', sinon.spy());
    await renderComponent();
    expect(onItemsCreated).to.be.not.called;

    await click('.add-item-trigger');

    expect(onItemsCreated).to.be.calledOnce.and.to.be.calledWith(
      [sinon.match.instanceOf(StringValueEditorState)]
    );
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/array/default-item-creator
    stateManager=stateManager
    itemAtmDataSpec=itemAtmDataSpec
    onItemsCreated=onItemsCreated
  }}`);
}
