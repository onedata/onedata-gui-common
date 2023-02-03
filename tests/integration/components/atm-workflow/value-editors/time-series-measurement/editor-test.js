import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, findAll, click, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

describe('Integration | Component | atm-workflow/value-editors/time-series-measurement/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.TimeSeriesMeasurement,
      }),
    });
  });

  it('has class "time-series-measurement-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('time-series-measurement-editor');
  });

  it('has only "Time series measurement" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Time series measurement');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('has three inputs - timestamp, time series name and value', async function () {
    await renderComponent();
    const nowTimestamp = Math.floor(Date.now() / 1000);

    expect(findAll('input')).to.have.length(3);

    const timestampField = find('.timestamp-field');
    expect(timestampField).to.have.trimmed.text('Timestamp:');
    expect(timestampField).to.contain('input');
    expect(timestampField.querySelector('input').value)
      .to.be.oneOf([String(nowTimestamp), String(nowTimestamp - 1)]);

    const tsNameField = find('.tsName-field');
    expect(tsNameField).to.have.trimmed.text('Time series name:');
    expect(tsNameField).to.contain('input');
    expect(tsNameField.querySelector('input')).to.have.value('');

    const valueField = find('.value-field');
    expect(valueField).to.have.trimmed.text('Value:');
    expect(valueField).to.contain('input');
    expect(valueField.querySelector('input')).to.have.value('0');
  });

  it('allows to input a valid time series measurement', async function () {
    await renderComponent();

    await fillIn('.timestamp-field input', '12345');
    await fillIn('.tsName-field input', 'series1');
    await fillIn('.value-field input', '-2.5');

    expect(this.stateManager.value).to.deep.equal({
      timestamp: 12345,
      tsName: 'series1',
      value: -2.5,
    });
    expect(this.stateManager.isValid).to.be.true;
    expect(find('.timestamp-field')).to.have.class('has-success');
    expect(find('.tsName-field')).to.have.class('has-success');
    expect(find('.value-field')).to.have.class('has-success');
  });

  it('allows to input an invalid time series measurement, but with validation error ("negative timestamp" case)',
    async function () {
      await renderComponent();

      await fillIn('.timestamp-field input', '-12345');
      await fillIn('.tsName-field input', 'series1');
      await fillIn('.value-field input', '-2.5');

      expect(this.stateManager.value).to.deep.equal({
        timestamp: -12345,
        tsName: 'series1',
        value: -2.5,
      });
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.timestamp-field')).to.have.class('has-error');
      expect(find('.tsName-field')).to.have.class('has-success');
      expect(find('.value-field')).to.have.class('has-success');
    }
  );

  it('allows to input an invalid time series measurement, but with validation error ("empty time series name" case)',
    async function () {
      await renderComponent();

      await fillIn('.timestamp-field input', '12345');
      await fillIn('.tsName-field input', '');
      await fillIn('.value-field input', '-2.5');

      expect(this.stateManager.value).to.deep.equal({
        timestamp: 12345,
        tsName: '',
        value: -2.5,
      });
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.timestamp-field')).to.have.class('has-success');
      expect(find('.tsName-field')).to.have.class('has-error');
      expect(find('.value-field')).to.have.class('has-success');
    }
  );

  it('allows to input an invalid time series measurement, but with validation error ("non-numeric value" case)',
    async function () {
      await renderComponent();

      await fillIn('.timestamp-field input', '12345');
      await fillIn('.tsName-field input', 'series1');
      await fillIn('.value-field input', 'abc');

      expect(this.stateManager.value).to.deep.equal({
        timestamp: 12345,
        tsName: 'series1',
        value: NaN,
      });
      expect(this.stateManager.isValid).to.be.false;
      expect(find('.timestamp-field')).to.have.class('has-success');
      expect(find('.tsName-field')).to.have.class('has-success');
      expect(find('.value-field')).to.have.class('has-error');
    }
  );

  it('can be disabled', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(findAll('input[disabled]')).to.have.length(3);
  });
});

async function renderComponent() {
  await render(hbs`{{atm-workflow/value-editors/time-series-measurement/editor
    stateManager=stateManager
    editorId=stateManager.rootValueEditorStateId
    onRemove=onRemove
  }}`);
}
