import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { find, render, settled, click, fillIn } from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import numberEditor from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/params-editors/number';
import { lookupService } from '../../../../../helpers/stub-service';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

describe('Integration | Utility | atm-workflow/data-spec-editor/params-editors/number', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        numberEditor.FormElement.create({
          name: 'paramsEditor',
        }),
      ],
    }));
  });

  it('shows unchecked toggle for "integers only" option', async function () {
    await renderForm();

    expect(find('.integersOnly-field .control-label').textContent.trim())
      .to.equal('Integers only:');
    expect(find('.integersOnly-field .one-way-toggle')).to.exist
      .and.to.not.have.class('checked')
      .and.to.not.have.class('disabled');
    expect(getIntegersOnlyValue(this)).to.equal(false);
  });

  it('allows to check "integers only" toggle', async function () {
    await renderForm();

    await click('.integersOnly-field .one-way-toggle');

    expect(getIntegersOnlyValue(this)).to.equal(true);
  });

  it('allows to uncheck "integers only" toggle', async function () {
    await renderForm();

    await click('.integersOnly-field .one-way-toggle');
    await click('.integersOnly-field .one-way-toggle');

    expect(getIntegersOnlyValue(this)).to.equal(false);
  });

  it('shows empty "allowed values" param', async function () {
    await renderForm();

    expect(find('.allowedValues-field .control-label').textContent.trim())
      .to.equal('Allowed values:');
    expect(find('.allowedValues-field .create-value-btn')).to.exist
      .and.to.have.trimmed.text('Set allowed values');
    expect(getAllowedValuesValue(this))
      .to.deep.equal({ hasValue: false, value: null });
  });

  it('allows to input number into "allowed values" param', async function () {
    await renderForm();

    await click('.allowedValues-field .create-value-btn');
    await click('.allowedValues-field .add-item-trigger');
    await fillIn('.allowedValues-field input', '123');

    expect(getAllowedValuesValue(this))
      .to.deep.equal({ hasValue: true, value: [123] });
  });

  it('allows clear "allowed values" param', async function () {
    await renderForm();
    await click('.allowedValues-field .create-value-btn');
    await click('.allowedValues-field .add-item-trigger');
    await fillIn('.allowedValues-field input', '123');

    await click('.remove-icon');
    await click('.webui-popover-content .btn-confirm');

    expect(getAllowedValuesValue(this))
      .to.deep.equal({ hasValue: false, value: null });
  });

  it('allows to provide data spec params', async function () {
    await renderForm();

    await click('.integersOnly-field .one-way-toggle');
    await click('.allowedValues-field .create-value-btn');
    await click('.allowedValues-field .add-item-trigger');
    await fillIn('.allowedValues-field input', '123');

    const params = numberEditor.formValuesToAtmDataSpecParams(
      this.get('rootGroup.valuesSource.paramsEditor')
    );
    expect(params).to.deep.equal({
      integersOnly: true,
      allowedValues: [123],
    });
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('allows to show existing data spec params', async function () {
    const formValues = numberEditor.atmDataSpecParamsToFormValues({
      integersOnly: true,
      allowedValues: [123],
    });

    await renderForm();
    this.set('rootGroup.valuesSource.paramsEditor', formValues);
    await settled();

    expect(find('.integersOnly-field .one-way-toggle')).to.have.class('checked');
    expect(find('.allowedValues-field input')).to.have.value('123');
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('shows a valid summary when "integers only" toggle is unchecked and there are no "allowed values"',
    function () {
      const formValues = numberEditor.atmDataSpecParamsToFormValues({
        integersOnly: false,
        allowedValues: null,
      });
      const i18n = lookupService(this, 'i18n');

      const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

      expect(summary).to.equal('Allowed numbers: Any');
    }
  );

  it('shows a valid summary when "integers only" toggle is checked and there are no "allowed values"', function () {
    const formValues = numberEditor.atmDataSpecParamsToFormValues({
      integersOnly: true,
      allowedValues: null,
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

    expect(summary).to.equal('Allowed numbers: Integers');
  });

  it('shows a valid summary when "integers only" toggle is unchecked and there are "allowed values"', function () {
    const formValues = numberEditor.atmDataSpecParamsToFormValues({
      integersOnly: false,
      allowedValues: [1, 1.5, 2],
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

    expect(summary).to.equal('Allowed numbers: 1, 1.5, 2');
  });

  it('shows a valid summary when "integers only" toggle is checked and there are "allowed values"', function () {
    const formValues = numberEditor.atmDataSpecParamsToFormValues({
      integersOnly: true,
      allowedValues: [1, 1.5, 2],
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

    expect(summary).to.equal('Allowed numbers: 1, 2');
  });

  it('shows a valid summary when "integers only" toggle is checked and there are only "allowed values" which are not integers',
    function () {
      const formValues = numberEditor.atmDataSpecParamsToFormValues({
        integersOnly: true,
        allowedValues: [1.5],
      });
      const i18n = lookupService(this, 'i18n');

      const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

      expect(summary).to.equal('Allowed numbers: None');
    }
  );

  it('autoselects and disables "integers only" toggle when there is only one possible choice due to data spec filters',
    async function () {
      setFilters(this, [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.Number,
          integersOnly: true,
        }],
      }]);
      await renderForm();

      expect(find('.integersOnly-field .one-way-toggle')).to.have.class('checked')
        .and.to.have.class('disabled');
      expect(getIntegersOnlyValue(this)).to.equal(true);
    }
  );
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getIntegersOnlyValue(testCase) {
  return testCase.get('rootGroup.valuesSource.paramsEditor.integersOnly');
}

function getAllowedValuesValue(testCase) {
  return testCase.get('rootGroup.valuesSource.paramsEditor.allowedValues');
}

function setFilters(testCase, filters) {
  testCase.set('rootGroup.fields.0.dataSpecFilters', filters);
}
