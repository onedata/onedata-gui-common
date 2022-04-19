import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { find, findAll, click } from 'ember-native-dom-helpers';
import { get } from '@ember/object';
import { clickTrigger, selectChoose } from '../../../../helpers/ember-power-select';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import timeSeriesEditor from 'onedata-gui-common/utils/atm-workflow/store-content-update-options-editor/time-series';

const measurementNameMatcherOptions = [{
  label: 'Exact "exactName"',
}, {
  label: 'Has prefix "hasPrefixName"',
}];

const timeSeriesNameGeneratorOptions = [{
  label: 'Exact "exactName"',
}, {
  label: 'Add prefix "addPrefixName"',
}];

const prefixCombinerOptions = [{
  value: 'concatenate',
  label: 'Concatenate',
}, {
  value: 'converge',
  label: 'Converge',
}, {
  value: 'overwrite',
  label: 'Overwrite',
}];

describe('Integration | Utility | atm workflow/store content update options editor/time series', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  beforeEach(function () {
    const storeConfig = {
      schemas: [{
        nameGeneratorType: 'exact',
        nameGenerator: 'exactName',
      }, {
        nameGeneratorType: 'addPrefix',
        nameGenerator: 'addPrefixName',
      }],
    };
    this.setProperties({
      storeConfig,
      rootGroup: FormFieldsRootGroup.create({
        ownerSource: this,
        fields: [
          timeSeriesEditor.FormElement.create({
            name: 'updateOptionsEditor',
            contentUpdateDataSpec: {
              valueConstraints: {
                specs: [{
                  nameMatcherType: 'exact',
                  nameMatcher: 'exactName',
                }, {
                  nameMatcherType: 'hasPrefix',
                  nameMatcher: 'hasPrefixName',
                }],
              },
            },
            storeConfig,
          }),
        ],
      }),
    });
  });

  it('shows no dispatch rules at the beginning', async function () {
    await renderForm(this);

    expect(find('.dispatchRule-field')).to.not.exist;
  });

  it('allows to add new dispatch rule', async function () {
    await renderForm(this);

    await click('.add-field-button');

    expect(find('.dispatchRule-field')).to.exist;
    expect(findAll('.dispatchRule-children > *')).to.have.length(2);

    expect(find('.measurementNameMatcher-field .control-label').textContent)
      .to.contain('Measurement time series:');
    expect(find('.timeSeriesNameGenerator-field .control-label').textContent)
      .to.contain('Target time series:');

    expect(find('.measurementNameMatcher-field .dropdown-field-trigger').textContent)
      .to.contain(measurementNameMatcherOptions[0].label);
    expect(find('.timeSeriesNameGenerator-field .dropdown-field-trigger').textContent)
      .to.contain(timeSeriesNameGeneratorOptions[0].label);
  });

  it('does not show prefix combiner in dispatch exact->exact', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await selectChoose('.measurementNameMatcher-field', 'Exact "exactName"');
    await selectChoose('.timeSeriesNameGenerator-field', 'Exact "exactName"');

    expect(find('.prefixCombiner-field')).to.not.exist;
  });

  it('does not show prefix combiner in dispatch hasPrefix->exact', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await selectChoose('.measurementNameMatcher-field', 'Has prefix "hasPrefixName"');
    await selectChoose('.timeSeriesNameGenerator-field', 'Exact "exactName"');

    expect(find('.prefixCombiner-field')).to.not.exist;
  });

  it('does not show prefix combiner in dispatch exact->addPrefix', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await selectChoose('.measurementNameMatcher-field', 'Exact "exactName"');
    await selectChoose('.timeSeriesNameGenerator-field', 'Add prefix "addPrefixName"');

    expect(find('.prefixCombiner-field')).to.not.exist;
  });

  it('shows prefix combiner in dispatch hasPrefix->addPrefix', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await selectChoose('.measurementNameMatcher-field', 'Has prefix "hasPrefixName"');
    await selectChoose('.timeSeriesNameGenerator-field', 'Add prefix "addPrefixName"');

    expect(find('.prefixCombiner-field')).to.exist;
    expect(find('.prefixCombiner-field .control-label').textContent)
      .to.contain('Prefix combiner:');
    expect(find('.prefixCombiner-field .dropdown-field-trigger').textContent)
      .to.contain('Overwrite');
  });

  it('has correct list of available measurement time series', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await clickTrigger('.measurementNameMatcher-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(measurementNameMatcherOptions.length);
    measurementNameMatcherOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  it('has correct list of available target time series', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await clickTrigger('.timeSeriesNameGenerator-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(timeSeriesNameGeneratorOptions.length);
    timeSeriesNameGeneratorOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  it('has correct list of prefix combiners', async function () {
    await renderForm(this);

    await click('.add-field-button');
    await selectChoose('.measurementNameMatcher-field', 'Has prefix "hasPrefixName"');
    await selectChoose('.timeSeriesNameGenerator-field', 'Add prefix "addPrefixName"');
    await clickTrigger('.prefixCombiner-field');

    const optionElements = document.querySelectorAll('.ember-power-select-option');
    expect(optionElements).to.have.length(prefixCombinerOptions.length);
    prefixCombinerOptions.forEach(({ label }, idx) =>
      expect(optionElements[idx].textContent.trim()).to.equal(label)
    );
  });

  for (const { label, value } of prefixCombinerOptions) {
    it(`allows to choose "${label}" prefix`, async function () {
      await renderForm(this);

      await click('.add-field-button');
      await selectChoose('.measurementNameMatcher-field', 'Has prefix "hasPrefixName"');
      await selectChoose('.timeSeriesNameGenerator-field', 'Add prefix "addPrefixName"');
      await selectChoose('.prefixCombiner-field', label);

      expect(get(getDispatchRuleFormValues(this)[0], 'prefixCombiner')).to.equal(value);
    });
  }

  it('allows to provide complete time series dispatch rules and convert them to store content update options',
    async function () {
      await renderForm(this);

      await click('.add-field-button');
      const firstRule = find('.dispatchRule-field');
      await selectChoose(
        firstRule.querySelector('.measurementNameMatcher-field'),
        'Exact "exactName"'
      );
      await selectChoose(
        firstRule.querySelector('.timeSeriesNameGenerator-field'),
        'Add prefix "addPrefixName"'
      );

      await click('.add-field-button');
      const secondRule = find('.collection-item:nth-child(2) .dispatchRule-field');
      await selectChoose(
        secondRule.querySelector('.measurementNameMatcher-field'),
        'Has prefix "hasPrefixName"'
      );
      await selectChoose(
        secondRule.querySelector('.timeSeriesNameGenerator-field'),
        'Exact "exactName"'
      );

      await click('.add-field-button');
      const thirdRule = find('.collection-item:nth-child(3) .dispatchRule-field');
      await selectChoose(
        thirdRule.querySelector('.measurementNameMatcher-field'),
        'Has prefix "hasPrefixName"'
      );
      await selectChoose(
        thirdRule.querySelector('.timeSeriesNameGenerator-field'),
        'Add prefix "addPrefixName"'
      );
      await selectChoose(
        thirdRule.querySelector('.prefixCombiner-field'),
        'Converge'
      );

      const storeContentUpdateOptions = timeSeriesEditor.formValuesToStoreContentUpdateOptions(
        this.get('rootGroup.valuesSource.updateOptionsEditor'),
        this.getProperties('storeConfig')
      );
      expect(storeContentUpdateOptions).to.deep.equal({
        dispatchRules: [{
          measurementTimeSeriesNameMatcherType: 'exact',
          measurementTimeSeriesNameMatcher: 'exactName',
          targetTimeSeriesNameGenerator: 'addPrefixName',
        }, {
          measurementTimeSeriesNameMatcherType: 'hasPrefix',
          measurementTimeSeriesNameMatcher: 'hasPrefixName',
          targetTimeSeriesNameGenerator: 'exactName',
        }, {
          measurementTimeSeriesNameMatcherType: 'hasPrefix',
          measurementTimeSeriesNameMatcher: 'hasPrefixName',
          targetTimeSeriesNameGenerator: 'addPrefixName',
          prefixCombiner: 'converge',
        }],
      });
      expect(this.get('rootGroup.isValid')).to.be.true;
    });

  it('allows to show existing measurement specs from value constraints', async function () {
    const formValues = timeSeriesEditor.storeContentUpdateOptionsToFormValues({
      dispatchRules: [{
        measurementTimeSeriesNameMatcherType: 'exact',
        measurementTimeSeriesNameMatcher: 'exactName',
        targetTimeSeriesNameGenerator: 'addPrefixName',
      }, {
        measurementTimeSeriesNameMatcherType: 'hasPrefix',
        measurementTimeSeriesNameMatcher: 'hasPrefixName',
        targetTimeSeriesNameGenerator: 'exactName',
      }, {
        measurementTimeSeriesNameMatcherType: 'hasPrefix',
        measurementTimeSeriesNameMatcher: 'hasPrefixName',
        targetTimeSeriesNameGenerator: 'addPrefixName',
        prefixCombiner: 'converge',
      }],
    });

    await renderForm(this);
    this.set('rootGroup.valuesSource.updateOptionsEditor', formValues);
    await wait();

    const dispatchRules = findAll('.dispatchRule-field');
    expect(dispatchRules).to.have.length(3);

    expect(dispatchRules[0].querySelector('.measurementNameMatcher-field').textContent)
      .to.contain('Exact "exactName"');
    expect(dispatchRules[0].querySelector('.timeSeriesNameGenerator-field').textContent)
      .to.contain('Add prefix "addPrefixName"');
    expect(dispatchRules[0].querySelector('.prefixCmbiner-field')).to.not.exist;

    expect(dispatchRules[1].querySelector('.measurementNameMatcher-field').textContent)
      .to.contain('Has prefix "hasPrefixName"');
    expect(dispatchRules[1].querySelector('.timeSeriesNameGenerator-field').textContent)
      .to.contain('Exact "exactName"');
    expect(dispatchRules[1].querySelector('.prefixCmbiner-field')).to.not.exist;

    expect(dispatchRules[2].querySelector('.measurementNameMatcher-field').textContent)
      .to.contain('Has prefix "hasPrefixName"');
    expect(dispatchRules[2].querySelector('.timeSeriesNameGenerator-field').textContent)
      .to.contain('Add prefix "addPrefixName"');
    expect(dispatchRules[2].querySelector('.prefixCombiner-field').textContent)
      .to.contain('Converge');

    expect(this.get('rootGroup.isValid')).to.be.true;
  });
});

async function renderForm(testCase) {
  testCase.render(hbs `{{form-component/field-renderer field=rootGroup}}`);
  await wait();
}

function getDispatchRuleFormValues(testCase) {
  const editorValues = testCase.get('rootGroup.valuesSource.updateOptionsEditor');
  return get(editorValues, '__fieldsValueNames')
    .map((fieldName) => get(editorValues, fieldName));
}
