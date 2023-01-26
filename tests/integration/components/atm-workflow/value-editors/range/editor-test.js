import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find, findAll, click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

describe('Integration | Component | atm-workflow/value-editors/range/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Range,
      }),
    });
  });

  it('has class "range-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('range-editor');
  });

  it('has only "Range" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Range');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('has three inputs - start, end and step', async function () {
    await renderComponent();

    expect(findAll('input')).to.have.length(3);

    const startField = find('.start-field');
    expect(startField).to.have.trimmed.text('Start:');
    expect(startField).to.contain('input');
    expect(startField.querySelector('input')).to.have.value('0');

    const endField = find('.end-field');
    expect(endField).to.have.trimmed.text('End:');
    expect(endField).to.contain('input');
    expect(endField.querySelector('input')).to.have.value('1');

    const stepField = find('.step-field');
    expect(stepField).to.have.trimmed.text('Step:');
    expect(stepField).to.contain('input');
    expect(stepField.querySelector('input')).to.have.value('1');
  });

  it('allows to input a valid range', async function () {
    await renderComponent();

    const examples = [
      [1, 10, 2],
      [1, -10, -1],
      [0, 0, 1],
    ];
    for (const [start, end, step] of examples) {
      await fillIn('.start-field input', String(start));
      await fillIn('.end-field input', String(end));
      await fillIn('.step-field input', String(step));

      expect(this.stateManager.value).to.deep.equal({ start, end, step });
      expect(this.stateManager.isValid).to.be.true;
      expect(find('.start-field')).to.have.class('has-success');
      expect(find('.end-field')).to.have.class('has-success');
      expect(find('.step-field')).to.have.class('has-success');
    }
  });

  it('allows to input an invalid range, but with validation error ("wrong step" case)', async function () {
    await renderComponent();

    await fillIn('.start-field input', '1');
    await fillIn('.end-field input', '10');
    await fillIn('.step-field input', '-2');

    expect(this.stateManager.value).to.deep.equal({ start: 1, end: 10, step: -2 });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.start-field')).to.have.class('has-error');
    expect(find('.end-field')).to.have.class('has-error');
    expect(find('.step-field')).to.have.class('has-success');
  });

  it('allows to input an invalid range, but with validation error ("0 step" case)', async function () {
    await renderComponent();

    await fillIn('.start-field input', '0');
    await fillIn('.end-field input', '0');
    await fillIn('.step-field input', '0');

    expect(this.stateManager.value).to.deep.equal({ start: 0, end: 0, step: 0 });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.start-field')).to.have.class('has-success');
    expect(find('.end-field')).to.have.class('has-success');
    expect(find('.step-field')).to.have.class('has-error');
  });

  it('allows to input an invalid range, but with validation error ("non-number values" case)', async function () {
    await renderComponent();

    await fillIn('.start-field input', 'a');
    await fillIn('.end-field input', 'b');
    await fillIn('.step-field input', 'c');

    expect(this.stateManager.value).to.deep.equal({ start: NaN, end: NaN, step: NaN });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.start-field')).to.have.class('has-error');
    expect(find('.end-field')).to.have.class('has-error');
    expect(find('.step-field')).to.have.class('has-error');
  });

  it('can be disabled', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(findAll('input[disabled]')).to.have.length(3);
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/range/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}
