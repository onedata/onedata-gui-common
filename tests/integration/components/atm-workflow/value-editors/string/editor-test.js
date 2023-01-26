import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Component | atm-workflow/value-editors/string/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.String,
      }),
    });
  });

  it('has class "string-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('string-editor');
  });

  it('has only "String" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('String');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('allows to input a string', async function () {
    await renderComponent();

    for (const value of ['', ' ', 'abc']) {
      await fillIn('textarea', String(value));

      expect(this.stateManager.value).to.equal(value);
      expect(this.stateManager.isValid).to.be.true;
      expect(find('.value-field')).to.have.class('has-success');
    }
  });

  it('gets larger when provided string has many lines', async function () {
    await renderComponent();
    const heightBefore = dom.height(find('textarea'));

    await fillIn('textarea', String('1\n2'));

    const heightAfter = dom.height(find('textarea'));
    expect(heightAfter).to.be.above(heightBefore);
  });

  it('can be disabled', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(find('textarea')).to.have.attr('disabled');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/string/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}
