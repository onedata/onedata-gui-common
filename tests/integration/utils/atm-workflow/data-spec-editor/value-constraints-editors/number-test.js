import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { find, render, settled, click } from '@ember/test-helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import numberEditor from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors/number';
import { lookupService } from '../../../../../helpers/stub-service';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

describe('Integration | Utility | atm-workflow/data-spec-editor/value-constraints-editors/number', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        numberEditor.FormElement.create({
          name: 'valueConstraintsEditor',
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

  it('allows to provide value constraints', async function () {
    await renderForm();

    await click('.integersOnly-field .one-way-toggle');

    const valueConstraints = numberEditor.formValuesToValueConstraints(
      this.get('rootGroup.valuesSource.valueConstraintsEditor')
    );
    expect(valueConstraints).to.deep.equal({
      integersOnly: true,
    });
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('allows to show existing value constraints', async function () {
    const formValues = numberEditor.valueConstraintsToFormValues({
      integersOnly: true,
    });

    await renderForm();
    this.set('rootGroup.valuesSource.valueConstraintsEditor', formValues);
    await settled();

    expect(find('.integersOnly-field .one-way-toggle')).to.have.class('checked');
    expect(this.get('rootGroup.isValid')).to.be.true;
  });

  it('shows a valid summary when "integers only" toggle is unchecked', function () {
    const formValues = numberEditor.valueConstraintsToFormValues({
      integersOnly: false,
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

    expect(summary).to.equal('Allowed numbers: Any');
  });

  it('shows a valid summary when "integers only" toggle is checked', function () {
    const formValues = numberEditor.valueConstraintsToFormValues({
      integersOnly: true,
    });
    const i18n = lookupService(this, 'i18n');

    const summary = String(numberEditor.summarizeFormValues(i18n, formValues));

    expect(summary).to.equal('Allowed numbers: Integers');
  });

  it('autoselects and disables "integers only" toggle when there is only one possible choice due to data spec filters',
    async function () {
      setFilters(this, [{
        filterType: 'typeOrSubtype',
        types: [{
          type: AtmDataSpecType.Number,
          valueConstraints: {
            integersOnly: true,
          },
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
  return testCase.get('rootGroup.valuesSource.valueConstraintsEditor.integersOnly');
}

function setFilters(testCase, filters) {
  testCase.set('rootGroup.fields.0.dataSpecFilters', filters);
}
