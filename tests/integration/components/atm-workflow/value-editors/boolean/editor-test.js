import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, click } from '@ember/test-helpers';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import OneDropdownHelper from '../../../../../helpers/one-dropdown';

const valueDropdown = new OneDropdownHelper('.value-field');

describe('Integration | Component | atm-workflow/value-editors/boolean/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Boolean,
      }),
    });
  });

  it('has class "boolean-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('boolean-editor');
  });

  it('has only "Boolean" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Boolean');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('allows to input a boolean', async function () {
    await renderComponent();

    for (const value of [true, false]) {
      await valueDropdown.selectOptionByText(String(value));

      expect(this.stateManager.value).to.equal(value);
      expect(this.stateManager.isValid).to.be.true;
      expect(find('.value-field')).to.have.class('has-success');
    }
  });

  it('can be disabled', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(valueDropdown.isDisabled()).to.be.true;
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/boolean/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}
