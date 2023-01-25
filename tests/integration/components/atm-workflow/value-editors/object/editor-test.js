import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';
import { replaceEmberAceWithTextarea } from '../../../../../helpers/ember-ace';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

describe('Integration | Component | atm-workflow/value-editors/object/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Object,
      }),
    });
  });

  it('has class "object-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('object-editor');
  });

  it('has only "Object" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Object');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('allows to input a valid object', async function () {
    await renderComponent();

    for (const value of [null, {}, { a: 1 }]) {
      await fillIn('textarea', JSON.stringify(value));

      expect(this.stateManager.value).to.deep.equal(value);
      expect(this.stateManager.isValid).to.be.true;
      expect(find('.editor-box')).to.not.have.class('invalid');
    }
  });

  it('allows to input an invalid object, but with validation error', async function () {
    await renderComponent();

    for (const value of [false, ' ', 123, []]) {
      await fillIn('textarea', JSON.stringify(value));

      expect(this.stateManager.value).to.deep.equal(value);
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.editor-box')).to.have.class('invalid');
    }
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/object/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}
