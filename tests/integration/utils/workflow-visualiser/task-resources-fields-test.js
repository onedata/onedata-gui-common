import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { createTaskResourcesFields } from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';
import _ from 'lodash';
import { render, fillIn, find } from '@ember/test-helpers';

describe('Integration | Utility | workflow visualiser/task resources fields', function () {
  setupRenderingTest();

  describe('createTaskResourcesFields', function () {
    beforeEach(function () {
      this.set('rootGroup', FormFieldsRootGroup.create({
        ownerSource: this.owner,
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
      await renderComponent();

      expect(find('.cpu-field .control-label').textContent.trim())
        .to.equal('CPU cores:');
      expectResourceFieldsLabels('cpu');
      expectResourceFieldsType('cpu', 'text-like');
      expectResourceTextValue('cpu', 'requested', '0.1');
      expectResourceTextValue('cpu', 'limit', '1');

      expect(find('.memory-field .control-label').textContent.trim())
        .to.equal('Memory:');
      expectResourceFieldsLabels('memory');
      expectResourceFieldsType('memory', 'capacity');
      expectResourceCapacityValue('memory', 'requested', ['128', 'MiB']);
      await expectResourceCapacityUnits('memory', 'requested', ['MiB', 'GiB']);
      expectResourceCapacityValue('memory', 'limit', ['512', 'MiB']);
      await expectResourceCapacityUnits('memory', 'limit', ['MiB', 'GiB']);

      expect(find('.ephemeralStorage-field .control-label').textContent.trim())
        .to.equal('Ephemeral storage:');
      expectResourceFieldsLabels('ephemeralStorage');
      expectResourceFieldsType('ephemeralStorage', 'capacity');
      expectResourceCapacityValue('ephemeralStorage', 'requested', ['0', 'MiB']);
      await expectResourceCapacityUnits('ephemeralStorage', 'requested', ['MiB', 'GiB', 'TiB']);
      expectResourceCapacityValue('ephemeralStorage', 'limit', ['1', 'GiB']);
      await expectResourceCapacityUnits('ephemeralStorage', 'limit', ['MiB', 'GiB', 'TiB']);
    });

    it('has validation error when requested cpu value is negative', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '-3');
      await inputResourceTextValue('cpu', 'limit', '');

      expect(getResourceField('cpu', 'requested')).to.have.class('has-error');
    });

    it('has validation error when requested cpu value is zero', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '0');
      await inputResourceTextValue('cpu', 'limit', '');

      expect(getResourceField('cpu', 'requested')).to.have.class('has-error');
    });

    it('has validation error when requested cpu value is empty', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '');
      await inputResourceTextValue('cpu', 'limit', '');

      expect(getResourceField('cpu', 'requested')).to.have.class('has-error');
    });

    it('has no validation error when requested cpu value is positive', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '0.5');
      await inputResourceTextValue('cpu', 'limit', '');

      expect(getResourceField('cpu', 'requested')).to.not.have.class('has-error');
    });

    it('has validation error when requested cpu value is larger than limit cpu value', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '3');
      await inputResourceTextValue('cpu', 'limit', '1');

      expect(getResourceField('cpu', 'requested')).to.have.class('has-error');
      expect(getResourceField('cpu', 'limit')).to.have.class('has-error');
    });

    it('has no validation error when requested cpu value is equal to limit cpu value', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '1');
      await inputResourceTextValue('cpu', 'limit', '1');

      expect(getResourceField('cpu', 'requested')).to.not.have.class('has-error');
      expect(getResourceField('cpu', 'limit')).to.not.have.class('has-error');
    });

    it('has no validation error when requested cpu value is smaller to limit cpu value', async function () {
      await renderComponent();

      await inputResourceTextValue('cpu', 'requested', '1');
      await inputResourceTextValue('cpu', 'limit', '2');

      expect(getResourceField('cpu', 'requested')).to.not.have.class('has-error');
      expect(getResourceField('cpu', 'limit')).to.not.have.class('has-error');
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
              await renderComponent();

              await inputResourceCapacityValue(resourceName, 'requested', value);
              await inputResourceCapacityValue(resourceName, 'limit', ['', 'MiB']);

              expect(getResourceField(resourceName, 'requested'))
                .to.have.class('has-error');
            });
        } else {
          it(`has no validation error when requested ${resourceDescription} value is ${valueDescription}`,
            async function () {
              await renderComponent();

              await inputResourceCapacityValue(resourceName, 'requested', value);
              await inputResourceCapacityValue(resourceName, 'limit', ['', 'MiB']);

              expect(getResourceField(resourceName, 'requested'))
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
            await renderComponent();

            await inputResourceCapacityValue(resourceName, 'requested', values[0]);
            await inputResourceCapacityValue(resourceName, 'limit', values[1]);

            const requestedField = getResourceField(resourceName, 'requested');
            const limitField = getResourceField(resourceName, 'limit');

            if (hasError) {
              expect(requestedField).to.have.class('has-error');
              expect(limitField).to.have.class('has-error');
            } else {
              expect(requestedField).to.not.have.class('has-error');
              expect(limitField).to.not.have.class('has-error');
            }
          });
      });
    });

    ['cpu', 'memory', 'ephemeralStorage'].forEach((resourceName) => {
      it(`shows "Unlimited" as limit value in view mode, when ${resourceName} is null`, async function () {
        this.set(
          `rootGroup.valuesSource.taskResourcesFields.${resourceName}.${resourceName}Limit`,
          null
        );
        this.get('rootGroup').changeMode('view');

        await renderComponent();

        expect(find(`.${resourceName}Limit-field .field-component`)).to.not.exist;
        expect(
          find(`.${resourceName}LimitUnlimitedDesc-field .field-component`)
          .textContent.trim()
        ).to.equal('Unlimited');
      });
    });
  });
});

async function renderComponent() {
  await render(hbs `{{form-component/field-renderer field=rootGroup}}`);
}

function getResourceFieldSelector(resourceName, resourceBoundary) {
  return `.${resourceName}${_.upperFirst(resourceBoundary)}-field`;
}

function getResourceField(resourceName, resourceBoundary) {
  return find(getResourceFieldSelector(resourceName, resourceBoundary));
}

function expectResourceFieldsLabels(resourceName) {
  const requestedField = getResourceField(resourceName, 'requested');
  const limitField = getResourceField(resourceName, 'limit');
  expect(requestedField.querySelector('.control-label').textContent.trim())
    .to.equal('Requested:');
  expect(limitField.querySelector('.control-label').textContent.trim())
    .to.equal('Limit:');
}

function expectResourceFieldsType(resourceName, type) {
  const requestedField = getResourceField(resourceName, 'requested');
  const limitField = getResourceField(resourceName, 'limit');
  const className = `${type}-field-renderer`;
  expect(requestedField).to.have.class(className);
  expect(limitField).to.have.class(className);
}

function expectResourceTextValue(
  resourceName,
  resourceBoundary,
  expectedValue
) {
  const field = getResourceField(resourceName, resourceBoundary);
  expect(field.querySelector('.form-control')).to.have.value(expectedValue);
}

function expectResourceCapacityValue(
  resourceName,
  resourceBoundary,
  [expectedNumber, expectedUnit]
) {
  const field = getResourceField(resourceName, resourceBoundary);
  expect(field.querySelector('input')).to.have.value(expectedNumber);
  expect(field.querySelector('.ember-power-select-trigger').textContent)
    .to.contain(expectedUnit);
}

async function expectResourceCapacityUnits(
  resourceName,
  resourceBoundary,
  expectedUnits
) {
  await clickTrigger(getResourceFieldSelector(resourceName, resourceBoundary));
  const options = document.querySelectorAll('.ember-power-select-option');
  expect(options).to.have.length(expectedUnits.length);
  expectedUnits.forEach((unit, idx) => {
    expect(options[idx].textContent.trim()).to.equal(unit);
  });
}

async function inputResourceTextValue(resourceName, resourceBoundary, value) {
  const field = getResourceField(resourceName, resourceBoundary);
  await fillIn(field.querySelector('.form-control'), value);
}

async function inputResourceCapacityValue(
  resourceName,
  resourceBoundary,
  [valueNumber, valueUnit]
) {
  const field = getResourceField(resourceName, resourceBoundary);
  await fillIn(field.querySelector('input'), valueNumber);
  await selectChoose(field, valueUnit);
}
