import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { createTaskResourcesFields } from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';
import _ from 'lodash';
import $ from 'jquery';

describe('Integration | Utility | workflow visualiser/task resources fields', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  describe('createTaskResourcesFields', function () {
    beforeEach(function () {
      this.set('rootGroup', FormFieldsRootGroup.create({
        ownerSource: this,
        i18nPrefix: 'utils.workflowVisualiser',
        fields: [
          FormFieldsGroup.create({
            // name that matches translations path
            name: 'taskResourcesFields',
            fields: createTaskResourcesFields({
              pathToGroup: 'taskResourcesFields',
              cpuRequestedDefaultValueMixin: { defaultValue: '0.1' },
              cpuLimitDefaultValueMixin: { defaultValue: '1' },
              memoryRequestedDefaultValueMixin: {
                defaultValue: String(128 * 1024 * 1024),
              },
              memoryLimitDefaultValueMixin: {
                defaultValue: String(512 * 1024 * 1024),
              },
              ephemeralStorageRequestedDefaultValueMixin: { defaultValue: '0' },
              ephemeralStorageLimitDefaultValueMixin: {
                defaultValue: String(1024 * 1024 * 1024),
              },
            }),
          }),
        ],
      }));
    });

    it('has cpu, memory and storage fields groups', async function () {
      await render(this);

      const $cpuSection = this.$('.cpu-field');
      expect($cpuSection.find('.control-label').eq(0).text().trim())
        .to.equal('CPU cores:');
      expectResourceFieldsLabels(this, 'cpu');
      expectResourceFieldsType(this, 'cpu', 'text-like');
      expectResourceTextValue(this, 'cpu', 'requested', '0.1');
      expectResourceTextValue(this, 'cpu', 'limit', '1');

      const $memorySection = this.$('.memory-field');
      expect($memorySection.find('.control-label').eq(0).text().trim())
        .to.equal('Memory:');
      expectResourceFieldsLabels(this, 'memory');
      expectResourceFieldsType(this, 'memory', 'capacity');
      expectResourceCapacityValue(this, 'memory', 'requested', ['128', 'MiB']);
      await expectResourceCapacityUnits('memory', 'requested', ['MiB', 'GiB']);
      expectResourceCapacityValue(this, 'memory', 'limit', ['512', 'MiB']);
      await expectResourceCapacityUnits('memory', 'limit', ['MiB', 'GiB']);

      const $ephemeralStorageSection = this.$('.ephemeralStorage-field');
      expect($ephemeralStorageSection.find('.control-label').eq(0).text().trim())
        .to.equal('Ephemeral storage:');
      expectResourceFieldsLabels(this, 'ephemeralStorage');
      expectResourceFieldsType(this, 'ephemeralStorage', 'capacity');
      expectResourceCapacityValue(this, 'ephemeralStorage', 'requested', ['0', 'MiB']);
      await expectResourceCapacityUnits('ephemeralStorage', 'requested', ['MiB', 'GiB', 'TiB']);
      expectResourceCapacityValue(this, 'ephemeralStorage', 'limit', ['1', 'GiB']);
      await expectResourceCapacityUnits('ephemeralStorage', 'limit', ['MiB', 'GiB', 'TiB']);
    });

    it('has validation error when requested cpu value is negative', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '-3');
      await inputResourceTextValue(this, 'cpu', 'limit', '');

      expect(getResourceField(this, 'cpu', 'requested')).to.have.class('has-error');
    });

    it('has validation error when requested cpu value is zero', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '0');
      await inputResourceTextValue(this, 'cpu', 'limit', '');

      expect(getResourceField(this, 'cpu', 'requested')).to.have.class('has-error');
    });

    it('has validation error when requested cpu value is empty', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '');
      await inputResourceTextValue(this, 'cpu', 'limit', '');

      expect(getResourceField(this, 'cpu', 'requested')).to.have.class('has-error');
    });

    it('has no validation error when requested cpu value is positive', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '0.5');
      await inputResourceTextValue(this, 'cpu', 'limit', '');

      expect(getResourceField(this, 'cpu', 'requested')).to.not.have.class('has-error');
    });

    it('has validation error when requested cpu value is larger than limit cpu value', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '3');
      await inputResourceTextValue(this, 'cpu', 'limit', '1');

      expect(getResourceField(this, 'cpu', 'requested')).to.have.class('has-error');
      expect(getResourceField(this, 'cpu', 'limit')).to.have.class('has-error');
    });

    it('has no validation error when requested cpu value is equal to limit cpu value', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '1');
      await inputResourceTextValue(this, 'cpu', 'limit', '1');

      expect(getResourceField(this, 'cpu', 'requested')).to.not.have.class('has-error');
      expect(getResourceField(this, 'cpu', 'limit')).to.not.have.class('has-error');
    });

    it('has no validation error when requested cpu value is smaller to limit cpu value', async function () {
      await render(this);

      await inputResourceTextValue(this, 'cpu', 'requested', '1');
      await inputResourceTextValue(this, 'cpu', 'limit', '2');

      expect(getResourceField(this, 'cpu', 'requested')).to.not.have.class('has-error');
      expect(getResourceField(this, 'cpu', 'limit')).to.not.have.class('has-error');
    });

    [{
      resourceName: 'memory',
      resourceDescription: 'memory',
    }, {
      resourceName: 'ephemeralStorage',
      resourceDescription: 'ephemeral storage',
    }].forEach(({ resourceName, resourceDescription }) => {
      [{
        valueDescription: 'negative',
        value: ['-3', 'MiB'],
        invalidFor: ['memory', 'ephemeralStorage'],
      }, {
        valueDescription: 'zero',
        value: ['0', 'MiB'],
        invalidFor: ['memory'],
      }, {
        valueDescription: 'empty',
        value: ['', 'MiB'],
        invalidFor: ['memory', 'ephemeralStorage'],
      }, {
        valueDescription: 'positive',
        value: ['3', 'MiB'],
        invalidFor: [],
      }].forEach(({ valueDescription, value, invalidFor }) => {
        if (invalidFor.includes(resourceName)) {
          it(`has validation error when requested ${resourceDescription} value is ${valueDescription}`,
            async function () {
              await render(this);

              await inputResourceCapacityValue(this, resourceName, 'requested', value);
              await inputResourceCapacityValue(this, resourceName, 'limit', ['', 'MiB']);

              expect(getResourceField(this, resourceName, 'requested'))
                .to.have.class('has-error');
            });
        } else {
          it(`has no validation error when requested ${resourceDescription} value is ${valueDescription}`,
            async function () {
              await render(this);

              await inputResourceCapacityValue(this, resourceName, 'requested', value);
              await inputResourceCapacityValue(this, resourceName, 'limit', ['', 'MiB']);

              expect(getResourceField(this, resourceName, 'requested'))
                .to.not.have.class('has-error');
            });
        }
      });

      [{
        comparisonDescription: 'is larger than',
        hasError: true,
        values: [
          ['2', 'MiB'],
          ['1', 'MiB'],
        ],
      }, {
        comparisonDescription: 'is smaller than',
        hasError: false,
        values: [
          ['1', 'MiB'],
          ['2', 'MiB'],
        ],
      }, {
        comparisonDescription: 'is equal to',
        hasError: false,
        values: [
          ['1', 'MiB'],
          ['1', 'MiB'],
        ],
      }].forEach(({ comparisonDescription, hasError, values }) => {
        it(`has${hasError ? '' : ' no'} validation error when requested ${resourceDescription} value ${comparisonDescription} limit ${resourceDescription} value`,
          async function () {
            await render(this);

            await inputResourceCapacityValue(this, resourceName, 'requested', values[0]);
            await inputResourceCapacityValue(this, resourceName, 'limit', values[1]);

            const $requestedField = getResourceField(this, resourceName, 'requested');
            const $limitField = getResourceField(this, resourceName, 'limit');

            if (hasError) {
              expect($requestedField).to.have.class('has-error');
              expect($limitField).to.have.class('has-error');
            } else {
              expect($requestedField).to.not.have.class('has-error');
              expect($limitField).to.not.have.class('has-error');
            }
          });
      });
    });

    ['cpu', 'memory', 'ephemeralStorage'].forEach((resourceName) => {
      it(`shows "unlimited" as limit value in view mode, when ${resourceName} is null`, async function () {
        this.set(
          `rootGroup.valuesSource.taskResourcesFields.${resourceName}.${resourceName}Limit`,
          null
        );
        this.get('rootGroup').changeMode('view');

        await render(this);

        expect(this.$(`.${resourceName}Limit-field .field-component`)).to.not.exist;
        expect(this.$(`.${resourceName}LimitDesc-field .field-component`).text().trim())
          .to.equal('unlimited');
      });
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{form-component/field-renderer field=rootGroup}}`);
  await wait();
}

function getResourceFieldSelector(resourceName, resourceBoundary) {
  return `.${resourceName}${_.upperFirst(resourceBoundary)}-field`;
}

function getResourceField(testCase, resourceName, resourceBoundary) {
  return testCase.$(getResourceFieldSelector(resourceName, resourceBoundary));
}

function expectResourceFieldsLabels(testCase, resourceName) {
  const $requestedField = getResourceField(testCase, resourceName, 'requested');
  const $limitField = getResourceField(testCase, resourceName, 'limit');
  expect($requestedField.find('.control-label').text().trim())
    .to.equal('Requested:');
  expect($limitField.find('.control-label').text().trim())
    .to.equal('Limit:');
}

function expectResourceFieldsType(testCase, resourceName, type) {
  const $requestedField = getResourceField(testCase, resourceName, 'requested');
  const $limitField = getResourceField(testCase, resourceName, 'limit');
  const className = `${type}-field-renderer`;
  expect($requestedField).to.have.class(className);
  expect($limitField).to.have.class(className);
}

function expectResourceTextValue(
  testCase,
  resourceName,
  resourceBoundary,
  expectedValue
) {
  const $field = getResourceField(testCase, resourceName, resourceBoundary);
  expect($field.find('.form-control')).to.have.value(expectedValue);
}

function expectResourceCapacityValue(
  testCase,
  resourceName,
  resourceBoundary,
  [expectedNumber, expectedUnit]
) {
  const $field = getResourceField(testCase, resourceName, resourceBoundary);
  expect($field.find('input')).to.have.value(expectedNumber);
  expect($field.find('.ember-power-select-trigger').text())
    .to.contain(expectedUnit);
}

async function expectResourceCapacityUnits(
  resourceName,
  resourceBoundary,
  expectedUnits
) {
  await clickTrigger(getResourceFieldSelector(resourceName, resourceBoundary));
  const $options = $('.ember-power-select-option');
  expect($options).to.have.length(expectedUnits.length);
  expectedUnits.forEach((unit, idx) => {
    expect($options.eq(idx).text().trim()).to.equal(unit);
  });
}

async function inputResourceTextValue(testCase, resourceName, resourceBoundary, value) {
  const $field = getResourceField(testCase, resourceName, resourceBoundary);
  await fillIn($field.find('.form-control')[0], value);
}

async function inputResourceCapacityValue(
  testCase,
  resourceName,
  resourceBoundary,
  [valueNumber, valueUnit]
) {
  const $field = getResourceField(testCase, resourceName, resourceBoundary);
  await fillIn($field.find('input')[0], valueNumber);
  await selectChoose($field[0], valueUnit);
}
