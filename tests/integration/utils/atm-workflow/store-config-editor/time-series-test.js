import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn, find, findAll, click } from 'ember-native-dom-helpers';
import { get } from '@ember/object';
import { clickTrigger, selectChoose } from '../../../../helpers/ember-power-select';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import timeSeriesEditor from 'onedata-gui-common/utils/atm-workflow/store-config-editor/time-series';

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

const metricAggregatorOptions = [{
  value: 'sum',
  label: 'Sum',
}, {
  value: 'max',
  label: 'Maximum',
}, {
  value: 'min',
  label: 'Minimum',
}, {
  value: 'first',
  label: 'First',
}, {
  value: 'last',
  label: 'Last',
}];

const metricResolutionOptions = [{
  value: 5,
  label: '5 seconds',
}, {
  value: 60,
  label: '1 minute',
}, {
  value: 60 * 60,
  label: '1 hour',
}, {
  value: 24 * 60 * 60,
  label: '1 day',
}, {
  value: 7 * 24 * 60 * 60,
  label: '1 week',
}, {
  value: 30 * 24 * 60 * 60,
  label: '1 month',
}, {
  value: 365 * 24 * 60 * 60,
  label: '1 year',
}, {
  value: 0,
  label: 'Infinity',
}];

describe('Integration | Utility | atm workflow/store config editor/time series', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    this.set('rootGroup', FormFieldsRootGroup.create({
      ownerSource: this,
      fields: [
        timeSeriesEditor.formElement.create({
          name: 'storeEditor',
        }),
      ],
    }));
  });

  it('shows no series at the beginning', async function () {
    await renderForm(this);

    expect(find('.timeSeriesSchema-field')).to.not.exist;
  });

  it('allows to add new series', async function () {
    await renderForm(this);

    await click('.add-field-button');

    expect(find('.timeSeriesSchema-field')).to.exist;
    expect(findAll('.timeSeriesSchema-children > *')).to.have.length(4);

    expect(find('.nameGeneratorType-field .control-label').textContent).to.contain('Name generator type:');
    expect(find('.nameGenerator-field .control-label').textContent).to.contain('Name generator:');
    expect(find('.unit-field .control-label').textContent).to.contain('Unit:');

    expect(find('.nameGeneratorType-field .dropdown-field-trigger').textContent).to.contain('Exact');
    expect(find('.nameGenerator-field .form-control').value).to.equal('');
    expect(find('.unit-field .dropdown-field-trigger').textContent).to.contain('None');

    expect(find('.timeSeriesSchema-field .add-field-button')).to.exist;
  });

  it('has correct list of available name generator types', async function () {
    await renderForm(this);

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
      await renderForm(this);

      await click('.add-field-button');
      await selectChoose('.nameGeneratorType-field', label);

      expect(get(getSeriesFormValues(this)[0], 'nameGeneratorType')).to.equal(value);
    });
  }

  it('has correct list of available units', async function () {
    await renderForm(this);

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
      await renderForm(this);

      await click('.add-field-button');
      await selectChoose('.unit-field', label);

      expect(get(getSeriesFormValues(this)[0], 'unit')).to.equal(value);
    });
  }

  it('shows custom unit input only when custom unit has been selected', async function () {
    await renderForm(this);

    await click('.add-field-button');
    expect(find('.customUnit-field')).to.not.exist;

    await selectChoose('.unit-field', 'Custom');

    expect(find('.customUnit-field')).to.exist;
    expect(find('.customUnit-field .form-control').value).to.equal('');
  });

  it('marks name generator and custom unit fields as invalid, when empty', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await selectChoose('.unit-field', 'Custom');
    await fillIn('.nameGenerator-field .form-control', '');
    await fillIn('.customUnit-field .form-control', '');

    expect(find('.nameGenerator-field.has-error')).to.exist;
    expect(find('.customUnit-field.has-error')).to.exist;
  });

  it('allows to add new metric', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await click('.timeSeriesSchema-field .add-field-button');

    expect(find('.metric-field')).to.exist;
    expect(findAll('.metric-children > *')).to.have.length(4);

    expect(find('.metric-field .id-field .control-label').textContent).to.contain('Id:');
    expect(find('.metric-field .aggregator-field .control-label').textContent).to.contain('Aggregator:');
    expect(find('.metric-field .resolution-field .control-label').textContent).to.contain('Resolution:');
    expect(find('.metric-field .retention-field .control-label').textContent).to.contain('Retention:');

    expect(find('.metric-field .id-field .form-control').value).to.equal('');
    expect(find('.metric-field .aggregator-field .dropdown-field-trigger').textContent).to.contain('Sum');
    expect(find('.metric-field .resolution-field .dropdown-field-trigger').textContent)
      .to.contain('5 seconds');
    expect(find('.metric-field .retention-field .form-control').value).to.equal('1000');
  });

  it('has correct list of available metric aggregators', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await click('.timeSeriesSchema-field .add-field-button');
    await clickTrigger('.metric-field .aggregator-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(metricAggregatorOptions.length);
    metricAggregatorOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  for (const { label, value } of metricAggregatorOptions) {
    it(`allows to choose "${label}" metric aggregator`, async function () {
      await renderForm(this);

      await click('.add-field-button');
      await click('.timeSeriesSchema-field .add-field-button');
      await selectChoose('.metric-field .aggregator-field', label);

      expect(get(getMetricsFormValues(this, 0)[0], 'aggregator')).to.equal(value);
    });
  }

  it('has correct list of available metric resolutions', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await click('.timeSeriesSchema-field .add-field-button');
    await clickTrigger('.metric-field .resolution-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(metricResolutionOptions.length);
    metricResolutionOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  for (const { label, value } of metricResolutionOptions) {
    it(`allows to choose "${label}" metric resolution`, async function () {
      await renderForm(this);

      await click('.add-field-button');
      await click('.timeSeriesSchema-field .add-field-button');
      await selectChoose('.metric-field .resolution-field', label);

      expect(get(getMetricsFormValues(this, 0)[0], 'resolution')).to.equal(value);
    });
  }

  it('marks metric ID and metric retention as invalid, when empty', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await click('.timeSeriesSchema-field .add-field-button');
    await fillIn('.metric-field .id-field .form-control', '');
    await fillIn('.metric-field .retention-field .form-control', '');

    expect(find('.metric-field .id-field.has-error')).to.exist;
    expect(find('.metric-field .retention-field.has-error')).to.exist;
  });

  it('marks metric retention as invalid, when float or negative or 0', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await click('.timeSeriesSchema-field .add-field-button');

    await fillIn('.metric-field .retention-field .form-control', '.5');
    expect(find('.metric-field .retention-field.has-error')).to.exist;

    await fillIn('.metric-field .retention-field .form-control', '-1');
    expect(find('.metric-field .retention-field.has-error')).to.exist;

    await fillIn('.metric-field .retention-field .form-control', '0');
    expect(find('.metric-field .retention-field.has-error')).to.exist;
  });

  it('allows to provide complete time series config and convert it to store config',
    async function () {
      await renderForm(this);

      await click('.storeEditor-add-field-button');
      const firstSeries = find('.timeSeriesSchema-field');
      await selectChoose(firstSeries.querySelector('.nameGeneratorType-field'), 'Add prefix');
      await fillIn(firstSeries.querySelector('.nameGenerator-field .form-control'), 'name_');
      await selectChoose(firstSeries.querySelector('.unit-field'), 'Bytes');

      await click('.storeEditor-add-field-button');
      const secondSeries = find('.collection-item:nth-child(2) .timeSeriesSchema-field');
      await selectChoose(secondSeries.querySelector('.nameGeneratorType-field'), 'Exact');
      await fillIn(secondSeries.querySelector('.nameGenerator-field .form-control'), 'my_name');
      await selectChoose(secondSeries.querySelector('.unit-field'), 'Custom');
      await fillIn(secondSeries.querySelector('.customUnit-field .form-control'), 'Liters');

      await click(firstSeries.querySelector('.metrics-add-field-button'));
      const firstMetric = firstSeries.querySelector('.metric-field');
      await fillIn(firstMetric.querySelector('.id-field .form-control'), 'id1');
      await selectChoose(firstMetric.querySelector('.aggregator-field'), 'First');
      await selectChoose(firstMetric.querySelector('.resolution-field'), '1 minute');
      await fillIn(firstMetric.querySelector('.retention-field .form-control'), '300');

      await click(firstSeries.querySelector('.metrics-add-field-button'));
      const secondMetric = firstSeries.querySelector('.collection-item:nth-child(2) .metric-field');
      await fillIn(secondMetric.querySelector('.id-field .form-control'), 'id2');
      await selectChoose(secondMetric.querySelector('.aggregator-field'), 'Last');
      await selectChoose(secondMetric.querySelector('.resolution-field'), 'Infinity');
      await fillIn(secondMetric.querySelector('.retention-field .form-control'), '1');

      await click(secondSeries.querySelector('.metrics-add-field-button'));
      const thirdMetric = secondSeries.querySelector('.metric-field');
      await fillIn(thirdMetric.querySelector('.id-field .form-control'), 'id3');
      await selectChoose(thirdMetric.querySelector('.aggregator-field'), 'Sum');
      await selectChoose(thirdMetric.querySelector('.resolution-field'), '1 week');
      await fillIn(thirdMetric.querySelector('.retention-field .form-control'), '123');

      const storeConfig = timeSeriesEditor.formValuesToStoreConfig(
        this.get('rootGroup.valuesSource.storeEditor')
      );
      expect(storeConfig).to.deep.equal({
        schemas: [{
          nameGeneratorType: 'addPrefix',
          nameGenerator: 'name_',
          unit: 'bytes',
          metrics: {
            id1: {
              aggregator: 'first',
              resolution: 60,
              retention: 300,
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
            id3: {
              aggregator: 'sum',
              resolution: 7 * 24 * 60 * 60,
              retention: 123,
            },
          },
        }],
      });
      expect(this.get('rootGroup.isValid')).to.be.true;
    });

  it('allows to show existing measurement specs from value constraints', async function () {
    const formValues = timeSeriesEditor.storeConfigToFormValues({
      schemas: [{
        nameGeneratorType: 'addPrefix',
        nameGenerator: 'name_',
        unit: 'bytes',
        metrics: {
          id1: {
            aggregator: 'first',
            resolution: 60,
            retention: 300,
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
          id3: {
            aggregator: 'sum',
            resolution: 7 * 24 * 60 * 60,
            retention: 123,
          },
        },
      }],
    });

    await renderForm(this);
    this.set('rootGroup.valuesSource.storeEditor', formValues);
    await wait();

    const series = findAll('.timeSeriesSchema-field');
    expect(series).to.have.length(2);

    expect(series[0].querySelector('.nameGeneratorType-field').textContent).to.contain('Add prefix');
    expect(series[0].querySelector('.nameGenerator-field .form-control').value).to.equal('name_');
    expect(series[0].querySelector('.unit-field').textContent).to.contain('Bytes');

    expect(series[1].querySelector('.nameGeneratorType-field').textContent).to.contain('Exact');
    expect(series[1].querySelector('.nameGenerator-field .form-control').value).to.equal('my_name');
    expect(series[1].querySelector('.unit-field').textContent).to.contain('Custom');
    expect(series[1].querySelector('.customUnit-field .form-control').value).to.contain('Liters');

    const firstSeriesMetrics = series[0].querySelectorAll('.metric-field');
    const secondSeriesMetrics = series[1].querySelectorAll('.metric-field');
    expect(firstSeriesMetrics).to.have.length(2);
    expect(secondSeriesMetrics).to.have.length(1);

    const firstMetric = firstSeriesMetrics[0];
    const secondMetric = firstSeriesMetrics[1];
    const thirdMetric = secondSeriesMetrics[0];

    expect(firstMetric.querySelector('.id-field .form-control').value).to.equal('id1');
    expect(firstMetric.querySelector('.aggregator-field .dropdown-field-trigger').textContent)
      .to.contain('First');
    expect(firstMetric.querySelector('.resolution-field .dropdown-field-trigger').textContent)
      .to.contain('1 minute');
    expect(firstMetric.querySelector('.retention-field .form-control').value).to.equal('300');

    expect(secondMetric.querySelector('.id-field .form-control').value).to.equal('id2');
    expect(secondMetric.querySelector('.aggregator-field .dropdown-field-trigger').textContent)
      .to.contain('Last');
    expect(secondMetric.querySelector('.resolution-field .dropdown-field-trigger').textContent)
      .to.contain('Infinity');
    expect(secondMetric.querySelector('.retention-field .form-control').value).to.equal('1');

    expect(thirdMetric.querySelector('.id-field .form-control').value).to.equal('id3');
    expect(thirdMetric.querySelector('.aggregator-field .dropdown-field-trigger').textContent)
      .to.contain('Sum');
    expect(thirdMetric.querySelector('.resolution-field .dropdown-field-trigger').textContent)
      .to.contain('1 week');
    expect(thirdMetric.querySelector('.retention-field .form-control').value).to.equal('123');

    expect(this.get('rootGroup.isValid')).to.be.true;
  });
});

async function renderForm(testCase) {
  testCase.render(hbs `{{form-component/field-renderer field=rootGroup}}`);
  await wait();
}

function getSeriesFormValues(testCase) {
  const editorValues = testCase.get('rootGroup.valuesSource.storeEditor');
  return get(editorValues, '__fieldsValueNames')
    .map((fieldName) => get(editorValues, fieldName));
}

function getMetricsFormValues(testCase, seriesIdx) {
  const seriesFormValue = getSeriesFormValues(testCase)[seriesIdx];
  return get(seriesFormValue, 'metrics.__fieldsValueNames')
    .map((fieldName) => get(seriesFormValue, `metrics.${fieldName}`));
}
