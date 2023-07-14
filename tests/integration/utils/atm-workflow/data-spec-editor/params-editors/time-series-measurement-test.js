import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import {
  render,
  fillIn,
  find,
  findAll,
  click,
  settled,
} from '@ember/test-helpers';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import timeSeriesMeasurementEditor from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/params-editors/time-series-measurement';
import { get } from '@ember/object';
import { lookupService } from '../../../../../helpers/stub-service';
import globals from 'onedata-gui-common/utils/globals';

const nameMatcherTypeOptions = [{
  value: 'exact',
  label: 'Exact',
}, {
  value: 'hasPrefix',
  label: 'Has prefix',
}];

const unitOptions = [{
  value: 'none',
  label: 'None',
}, {
  value: 'milliseconds',
  label: 'Milliseconds',
}, {
  value: 'seconds',
  label: 'Seconds',
}, {
  value: 'bits',
  label: 'Bits',
}, {
  value: 'bytes',
  label: 'Bytes',
}, {
  value: 'hertz',
  label: 'Hertz',
}, {
  value: 'countsPerSec',
  label: 'Counts per sec.',
}, {
  value: 'bitsPerSec',
  label: 'Bits per sec.',
}, {
  value: 'bytesPerSec',
  label: 'Bytes per sec.',
}, {
  value: 'operationsPerSec',
  label: 'Operations per sec.',
}, {
  value: 'requestsPerSec',
  label: 'Requests per sec.',
}, {
  value: 'readsPerSec',
  label: 'Reads per sec.',
}, {
  value: 'writesPerSec',
  label: 'Writes per sec.',
}, {
  value: 'ioOperationsPerSec',
  label: 'IO operations per sec.',
}, {
  value: 'percent',
  label: 'Percent',
}, {
  value: 'percentNormalized',
  label: 'Normalized percent',
}, {
  value: 'boolean',
  label: 'Boolean',
}, {
  value: 'custom',
  label: 'Custom',
}];

describe('Integration | Utility | atm-workflow/data-spec-editor/params-editors/time-series-measurement',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('rootGroup', FormFieldsRootGroup.create({
        ownerSource: this.owner,
        fields: [
          timeSeriesMeasurementEditor.FormElement.create({
            name: 'paramsEditor',
          }),
        ],
      }));
    });

    it('shows no specs at the beginning', async function () {
      await renderForm();

      expect(find('.measurementSpec-field')).to.not.exist;
    });

    it('allows to add new measurement spec', async function () {
      await renderForm();

      await click('.add-field-button');

      expect(find('.measurementSpec-field')).to.exist;
      expect(findAll('.measurementSpec-children > *')).to.have.length(3);

      expect(find('.nameMatcherType-field .control-label').textContent).to.contain('Name matcher type:');
      expect(find('.nameMatcher-field .control-label').textContent).to.contain('Name matcher:');
      expect(find('.unit-field .control-label').textContent).to.contain('Unit:');

      expect(find('.nameMatcherType-field .dropdown-field-trigger').textContent).to.contain('Exact');
      expect(find('.nameMatcher-field .form-control').value).to.equal('');
      expect(find('.unit-field .dropdown-field-trigger').textContent).to.contain('None');
    });

    it('has correct list of available name matcher types', async function () {
      await renderForm();

      await click('.add-field-button');
      await clickTrigger('.nameMatcherType-field');

      const optionElements =
        globals.document.querySelectorAll('.ember-power-select-option');
      expect(optionElements).to.have.length(nameMatcherTypeOptions.length);
      nameMatcherTypeOptions.forEach(({ label }, idx) =>
        expect(optionElements[idx].textContent.trim()).to.equal(label)
      );
    });

    for (const { label, value } of nameMatcherTypeOptions) {
      it(`allows to choose "${label}" name matcher type`, async function () {
        await renderForm();

        await click('.add-field-button');
        await selectChoose('.nameMatcherType-field', label);

        expect(get(getSpecFormValues(this)[0], 'nameMatcherType')).to.equal(value);
      });
    }

    it('has correct list of available units', async function () {
      await renderForm();

      await click('.add-field-button');
      await clickTrigger('.unit-field');

      const optionElements =
        globals.document.querySelectorAll('.ember-power-select-option');
      expect(optionElements).to.have.length(unitOptions.length);
      unitOptions.forEach(({ label }, idx) =>
        expect(optionElements[idx].textContent.trim()).to.equal(label)
      );
    });

    for (const { label, value } of unitOptions) {
      it(`allows to choose "${label}" unit`, async function () {
        await renderForm();

        await click('.add-field-button');
        await selectChoose('.unit-field', label);

        expect(get(getSpecFormValues(this)[0], 'unit')).to.equal(value);
      });
    }

    it('shows custom unit input only when custom unit has been selected', async function () {
      await renderForm();

      await click('.add-field-button');
      expect(find('.customUnit-field')).to.not.exist;

      await selectChoose('.unit-field', 'Custom');

      expect(find('.customUnit-field')).to.exist;
      expect(find('.customUnit-field .form-control').value).to.equal('');
    });

    it('marks name matcher and custom unit fields as invalid, when empty', async function () {
      await renderForm();

      await click('.add-field-button');
      await selectChoose('.unit-field', 'Custom');
      await fillIn('.nameMatcher-field .form-control', '');
      await fillIn('.customUnit-field .form-control', '');

      expect(find('.nameMatcher-field.has-error')).to.exist;
      expect(find('.customUnit-field.has-error')).to.exist;
    });

    it('allows to provide complete measurement specs and convert it to data spec params',
      async function () {
        await renderForm();

        await click('.add-field-button');
        await selectChoose('.nameMatcherType-field', 'Has prefix');
        await fillIn('.nameMatcher-field .form-control', 'name_');
        await selectChoose('.unit-field', 'Bytes');
        await click('.add-field-button');
        await selectChoose('.collection-item:nth-child(2) .nameMatcherType-field', 'Exact');
        await fillIn('.collection-item:nth-child(2) .nameMatcher-field .form-control', 'my_name');
        await selectChoose('.collection-item:nth-child(2) .unit-field', 'Custom');
        await fillIn('.collection-item:nth-child(2) .customUnit-field .form-control', 'Liters');

        const params =
          timeSeriesMeasurementEditor.formValuesToAtmDataSpecParams(
            this.get('rootGroup.valuesSource.paramsEditor')
          );
        expect(params).to.deep.equal({
          specs: [{
            nameMatcherType: 'hasPrefix',
            nameMatcher: 'name_',
            unit: 'bytes',
          }, {
            nameMatcherType: 'exact',
            nameMatcher: 'my_name',
            unit: 'custom:Liters',
          }],
        });
        expect(this.get('rootGroup.isValid')).to.be.true;
      });

    it('allows to show existing measurement specs from data spec', async function () {
      const formValues = timeSeriesMeasurementEditor.atmDataSpecParamsToFormValues({
        specs: [{
          nameMatcherType: 'hasPrefix',
          nameMatcher: 'name_',
          unit: 'bytes',
        }, {
          nameMatcherType: 'exact',
          nameMatcher: 'my_name',
          unit: 'custom:Liters',
        }],
      });

      await renderForm();
      this.set('rootGroup.valuesSource.paramsEditor', formValues);
      await settled();

      expect(findAll('.collection-item')).to.have.length(2);
      expect(find('.nameMatcherType-field').textContent).to.contain('Has prefix');
      expect(find('.nameMatcher-field .form-control').value).to.equal('name_');
      expect(find('.unit-field').textContent).to.contain('Bytes');
      expect(find('.collection-item:nth-child(2) .nameMatcherType-field').textContent)
        .to.contain('Exact');
      expect(find('.collection-item:nth-child(2) .nameMatcher-field .form-control').value)
        .to.contain('my_name');
      expect(find('.collection-item:nth-child(2) .unit-field').textContent)
        .to.contain('Custom');
      expect(find('.collection-item:nth-child(2) .customUnit-field .form-control').value)
        .to.equal('Liters');
      expect(this.get('rootGroup.isValid')).to.be.true;
    });

    it('shows summary when no measurements are specified', function () {
      const formValues = timeSeriesMeasurementEditor.atmDataSpecParamsToFormValues({
        specs: [],
      });
      const i18n = lookupService(this, 'i18n');

      const summary =
        String(timeSeriesMeasurementEditor.summarizeFormValues(i18n, formValues));

      expect(summary).to.equal('Defined measurements: 0');
    });

    it('shows summary when two measurements are specified', function () {
      const formValues = timeSeriesMeasurementEditor.atmDataSpecParamsToFormValues({
        specs: [{
          nameMatcherType: 'hasPrefix',
          nameMatcher: 'name_',
          unit: 'bytes',
        }, {
          nameMatcherType: 'exact',
          nameMatcher: 'my_name',
          unit: 'custom:Liters',
        }],
      });
      const i18n = lookupService(this, 'i18n');

      const summary =
        String(timeSeriesMeasurementEditor.summarizeFormValues(i18n, formValues));

      expect(summary).to.equal('Defined measurements: 2');
    });
  });

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getSpecFormValues(testCase) {
  const editorValues = testCase.get('rootGroup.valuesSource.paramsEditor');
  return get(editorValues, '__fieldsValueNames')
    .map((fieldName) => get(editorValues, fieldName));
}
