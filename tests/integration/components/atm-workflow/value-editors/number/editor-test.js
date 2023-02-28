import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

describe('Integration | Component | atm-workflow/value-editors/number/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Number,
      }),
    });
  });

  it('has class "number-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('number-editor');
  });

  it('has only "Number" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Number');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('allows to input a valid number', async function () {
    await renderComponent();

    for (const value of [-3, 0, 123.5]) {
      await fillIn('input', String(value));

      expect(this.stateManager.value).to.equal(value);
      expect(this.stateManager.isValid).to.be.true;
      expect(find('.value-field')).to.have.class('has-success');
    }
  });

  it('allows to input an invalid number, but with validation error', async function () {
    await renderComponent();

    for (const value of ['abc', '', ' ']) {
      await fillIn('input', value);

      expect(this.stateManager.value).to.be.NaN;
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.value-field')).to.have.class('has-error');
    }
  });

  it('allows to input a float number, but with validation error when integersOnly constraint is true',
    async function () {
      this.set('stateManager', new ValueEditorStateManager({
        type: AtmDataSpecType.Number,
        valueConstraints: {
          integersOnly: true,
        },
      }));
      await renderComponent();

      await fillIn('input', '10.5');

      expect(this.stateManager.value).to.equal(10.5);
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.value-field')).to.have.class('has-error');
    }
  );

  it('allows to input a number, but with validation error when that number is not in "allowedValues" constraint',
    async function () {
      this.set('stateManager', new ValueEditorStateManager({
        type: AtmDataSpecType.Number,
        valueConstraints: {
          allowedValues: [1, 2],
        },
      }));
      await renderComponent();

      await fillIn('input', '10');

      expect(this.stateManager.value).to.equal(10);
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.value-field')).to.have.class('has-error');
    }
  );

  it('allows to input a number without validation error when that number is in "allowedValues" constraint',
    async function () {
      this.set('stateManager', new ValueEditorStateManager({
        type: AtmDataSpecType.Number,
        valueConstraints: {
          allowedValues: [1, 2],
        },
      }));
      await renderComponent();

      await fillIn('input', '2');

      expect(this.stateManager.value).to.equal(2);
      expect(this.stateManager.isValid).to.be.true;
      expect(find('.value-field')).to.not.have.class('has-error');
    }
  );

  it('can be disabled', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(find('input')).to.have.attr('disabled');
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/number/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}
