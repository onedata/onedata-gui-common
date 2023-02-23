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
  focus,
  blur,
  settled,
} from '@ember/test-helpers';
import { get } from '@ember/object';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import timeSeriesEditor from 'onedata-gui-common/utils/atm-workflow/store-config-editors/time-series';

const nameGeneratorTypeOptions = [{
  value: 'exact',
  label: 'Exact',
}, {
  value: 'addPrefix',
  label: 'Add prefix',
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

describe('Integration | Utility | atm-workflow/store-config-editors/time-series', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this.owner,
      fields: [
        timeSeriesEditor.FormElement.create({
          name: 'storeEditor',
        }),
      ],
    }));
  });

  it('shows no series at the beginning', async function () {
    await renderForm();

    expect(find('.timeSeriesSchema-field')).to.not.exist;
  });

  it('allows to add new series', async function () {
    await renderForm();

    await click('.add-field-button');

    expect(find('.timeSeriesSchema-field')).to.exist;
    expect(findAll('.timeSeriesSchema-children > *')).to.have.length(4);

    expect(find('.nameGeneratorType-field .control-label').textContent).to.contain('Name generator type:');
    expect(find('.nameGenerator-field .control-label').textContent).to.contain('Name generator:');
    expect(find('.unit-field .control-label').textContent).to.contain('Unit:');
    expect(find('.metrics-field .control-label').textContent).to.contain('Metrics:');

    expect(find('.nameGeneratorType-field .dropdown-field-trigger').textContent).to.contain('Exact');
    expect(find('.nameGenerator-field .form-control').value).to.equal('');
    expect(find('.unit-field .dropdown-field-trigger').textContent).to.contain('None');
    expect(find('.metrics-field .tag-item')).to.not.exist;
  });

  it('has correct list of available name generator types', async function () {
    await renderForm();

    await click('.add-field-button');
    await clickTrigger('.nameGeneratorType-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(nameGeneratorTypeOptions.length);
    nameGeneratorTypeOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  for (const { label, value } of nameGeneratorTypeOptions) {
    it(`allows to choose "${label}" name generator type`, async function () {
      await renderForm();

      await click('.add-field-button');
      await selectChoose('.nameGeneratorType-field', label);

      expect(get(getSeriesFormValues(this)[0], 'nameGeneratorType')).to.equal(value);
    });
  }

  it('has correct list of available units', async function () {
    await renderForm();

    await click('.add-field-button');
    await clickTrigger('.unit-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
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

      expect(get(getSeriesFormValues(this)[0], 'unit')).to.equal(value);
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

  it('marks name generator and custom unit fields as invalid, when empty', async function () {
    await renderForm();

    await click('.add-field-button');
    await selectChoose('.unit-field', 'Custom');
    await fillIn('.nameGenerator-field .form-control', '');
    await fillIn('.customUnit-field .form-control', '');

    expect(find('.nameGenerator-field.has-error')).to.exist;
    expect(find('.customUnit-field.has-error')).to.exist;
  });

  it('marks two name generators as conflicted in case of common prefix', async function () {
    await renderForm();

    await click('.add-field-button');
    await fillIn('.nameGenerator-field .form-control', 'abc');
    await click('.add-field-button');
    await fillIn('.collection-item:nth-child(2) .nameGenerator-field .form-control', 'ab');

    expect(findAll('.nameGenerator-field.has-error')).to.have.length(2);
    expect(find('.nameGenerator-field .field-message').textContent.trim())
      .to.equal('This field must be uniquely prefixed across all generators');
  });

  it('marks two name generators as conflicted in case of the same trimmed value', async function () {
    await renderForm();

    await click('.add-field-button');
    await fillIn('.nameGenerator-field .form-control', 'abc  ');
    await click('.add-field-button');
    await fillIn('.collection-item:nth-child(2) .nameGenerator-field .form-control', '  abc');

    expect(findAll('.nameGenerator-field.has-error')).to.have.length(2);
  });

  it('marks empty metrics field as invalid', async function () {
    await renderForm();

    await click('.add-field-button');
    await focus('.metrics-field .tags-input');
    await blur('.metrics-field .tags-input');

    expect(find('.metrics-field.has-error')).to.exist;
  });

  it('allows to provide complete time series config and convert it to store config',
    async function () {
      await renderForm();

      await click('.add-field-button');
      const firstSeries = find('.timeSeriesSchema-field');
      await selectChoose(firstSeries.querySelector('.nameGeneratorType-field'), 'Add prefix');
      await fillIn(firstSeries.querySelector('.nameGenerator-field .form-control'), 'name_');
      await selectChoose(firstSeries.querySelector('.unit-field'), 'Bytes');
      await click(firstSeries.querySelector('.metrics-field .tag-creator-trigger'));
      await selectChoose('.tags-selector .aggregator-dropdown', 'First');
      await click('.tags-selector .selector-item:nth-child(2)');
      await selectChoose('.tags-selector .aggregator-dropdown', 'Last');
      await click('.tags-selector .btn-custom');
      await fillIn('.tags-selector .name-field input', 'id2');
      await selectChoose('.tags-selector .resolution-field', 'Infinity');
      await fillIn('.tags-selector .retention-field input', '1');
      await click('.tags-selector .submit-custom-metric');

      await click('.add-field-button');
      const secondSeries = find('.collection-item:nth-child(2) .timeSeriesSchema-field');
      await selectChoose(secondSeries.querySelector('.nameGeneratorType-field'), 'Exact');
      await fillIn(secondSeries.querySelector('.nameGenerator-field .form-control'), 'my_name');
      await selectChoose(secondSeries.querySelector('.unit-field'), 'Custom');
      await fillIn(secondSeries.querySelector('.customUnit-field .form-control'), 'Liters');
      await click(secondSeries.querySelector('.metrics-field .tag-creator-trigger'));
      await selectChoose('.tags-selector .aggregator-dropdown', 'Sum');
      await click('.tags-selector .selector-item:nth-child(5)');

      const storeConfig = timeSeriesEditor.formValuesToStoreConfig(
        this.get('rootGroup.valuesSource.storeEditor')
      );
      expect(storeConfig).to.deep.equal({
        timeSeriesCollectionSchema: {
          timeSeriesSchemas: [{
            nameGeneratorType: 'addPrefix',
            nameGenerator: 'name_',
            unit: 'bytes',
            metrics: {
              first1m: {
                aggregator: 'first',
                resolution: 60,
                retention: 1440,
              },
              id2: {
                aggregator: 'last',
                resolution: 0,
                retention: 1,
              },
            },
          }, {
            nameGeneratorType: 'exact',
            nameGenerator: 'my_name',
            unit: 'custom:Liters',
            metrics: {
              sum1w: {
                aggregator: 'sum',
                resolution: 7 * 24 * 60 * 60,
                retention: 520,
              },
            },
          }],
        },
        dashboardSpec: null,
      });
      expect(this.get('rootGroup.isValid')).to.be.true;
    });

  it('allows to show existing measurement specs from value constraints', async function () {
    const formValues = timeSeriesEditor.storeConfigToFormValues({
      timeSeriesCollectionSchema: {
        timeSeriesSchemas: [{
          nameGeneratorType: 'addPrefix',
          nameGenerator: 'name_',
          unit: 'bytes',
          metrics: {
            first1m: {
              aggregator: 'first',
              resolution: 60,
              retention: 1440,
            },
            id2: {
              aggregator: 'last',
              resolution: 0,
              retention: 1,
            },
          },
        }, {
          nameGeneratorType: 'exact',
          nameGenerator: 'my_name',
          unit: 'custom:Liters',
          metrics: {
            sum1w: {
              aggregator: 'sum',
              resolution: 7 * 24 * 60 * 60,
              retention: 520,
            },
          },
        }],
      },
      dashboardSpec: null,
    });

    await renderForm();
    this.set('rootGroup.valuesSource.storeEditor', formValues);
    await settled();

    const series = findAll('.timeSeriesSchema-field');
    expect(series).to.have.length(2);
    expect(series[0].querySelector('.nameGeneratorType-field').textContent).to.contain('Add prefix');
    expect(series[0].querySelector('.nameGenerator-field .form-control').value).to.equal('name_');
    expect(series[0].querySelector('.unit-field').textContent).to.contain('Bytes');
    expect(series[0].querySelector('.metrics-field').textContent)
      .to.contain('"first1m" (first; 1m; 1440 samp.)')
      .and.to.contain('"id2" (last; inf; 1 samp.)');

    expect(series[1].querySelector('.nameGeneratorType-field').textContent).to.contain('Exact');
    expect(series[1].querySelector('.nameGenerator-field .form-control').value).to.equal('my_name');
    expect(series[1].querySelector('.unit-field').textContent).to.contain('Custom');
    expect(series[1].querySelector('.customUnit-field .form-control').value).to.contain('Liters');
    expect(series[1].querySelector('.metrics-field').textContent).to.contain('"sum1w" (sum; 1w; 520 samp.)');

    expect(this.get('rootGroup.isValid')).to.be.true;
  });
});

async function renderForm() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getSeriesFormValues(testCase) {
  const editorValues = testCase.get('rootGroup.valuesSource.storeEditor.timeSeriesSchemas');
  return get(editorValues, '__fieldsValueNames')
    .map((fieldName) => get(editorValues, fieldName));
}
