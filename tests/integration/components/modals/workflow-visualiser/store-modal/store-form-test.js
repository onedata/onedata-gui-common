import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { render, settled, click, fillIn, focus, blur, find, findAll } from '@ember/test-helpers';

const componentClass = 'store-form';

const storeTypes = [{
  label: 'List',
  type: 'list',
  dataSpecConfigKey: 'itemDataSpec',
}, {
  label: 'Tree forest',
  type: 'treeForest',
  dataSpecConfigKey: 'itemDataSpec',
  availableDataTypeLabels: [
    'Any file',
    'Regular file',
    'Directory',
    'Symbolic link',
    'Dataset',
  ],
}, {
  label: 'Single value',
  type: 'singleValue',
  dataSpecConfigKey: 'itemDataSpec',
}, {
  label: 'Range',
  type: 'range',
}, {
  label: 'Audit log',
  type: 'auditLog',
  dataSpecConfigKey: 'logContentDataSpec',
}, {
  label: 'Time series',
  type: 'timeSeries',
}];

const dataTypes = [{
  label: 'Integer',
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
}, {
  label: 'String',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
}, {
  label: 'Object',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
}, {
  label: 'Any file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'ANY',
    },
  },
}, {
  label: 'Regular file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'REG',
    },
  },
}, {
  label: 'Directory',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'DIR',
    },
  },
}, {
  label: 'Symbolic link',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'SYMLNK',
    },
  },
}, {
  label: 'Dataset',
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
}, {
  label: 'Range',
  dataSpec: {
    type: 'range',
    valueConstraints: {},
  },
}, {
  label: 'Time series measurement',
  dataSpec: {
    type: 'timeSeriesMeasurement',
    valueConstraints: {
      specs: [],
    },
  },
}];

const storeTypesWithGenericConfig = storeTypes
  .filter(({ type }) => type !== 'range' && type !== 'timeSeries');

describe('Integration | Component | modals/workflow visualiser/store modal/store form', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      changeSpy: sinon.spy(),
      isDisabled: false,
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await render(hbs `{{modals/workflow-visualiser/store-modal/store-form}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class(componentClass);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('mode', 'create');
    });

    it('has class "mode-create', async function (done) {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-create');
      done();
    });

    it('does not render "id" and "instance id" fields', async function (done) {
      await renderComponent();

      expect(find('.id-field')).to.not.exist;
      expect(find('.instanceId-field')).to.not.exist;
      done();
    });

    it('renders empty "name" field', async function (done) {
      await renderComponent();

      const label = find('.name-field .control-label');
      const field = find('.name-field .form-control');
      expect(label.textContent.trim()).to.equal('Name:');
      expect(field.type).to.equal('text');
      expect(field.value).to.equal('');
      done();
    });

    it('marks "name" field as invalid when it is empty', async function (done) {
      await renderComponent();

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(find('.name-field')).to.have.class('has-error');
      done();
    });

    it('marks "name" field as valid when it is not empty', async function (done) {
      await renderComponent();

      await fillIn('.name-field .form-control', 'somename');

      expect(find('.name-field')).to.have.class('has-success');
      done();
    });

    it('renders empty "description" field', async function (done) {
      await renderComponent();

      const label = find('.description-field .control-label');
      const field = find('.description-field .form-control');
      expect(label.textContent.trim()).to.equal('Description (optional):');
      expect(field.matches('textarea')).to.be.true;
      expect(field.value).to.equal('');
      done();
    });

    it('marks "description" field as valid when it is empty', async function (done) {
      await renderComponent();

      await focus('.description-field .form-control');
      await blur('.description-field .form-control');

      expect(find('.description-field')).to.have.class('has-success');
      done();
    });

    it('renders "type" field with preselected "list" option', async function (done) {
      await renderComponent();

      const label = find('.type-field .control-label');
      const field = find('.type-field .dropdown-field-trigger');
      expect(label.textContent.trim()).to.equal('Type:');
      expect(field.textContent.trim()).to.equal('List');
      done();
    });

    it('provides all needed options to choose in "type" field', async function (done) {
      await renderComponent();

      await clickTrigger('.type-field');

      const options = document.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(storeTypes.length);
      storeTypes.forEach(({ label }, idx) =>
        expect(options[idx].textContent.trim()).to.equal(label)
      );
      done();
    });

    it('notifies about changes of values and validation state', async function (done) {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: '',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: dataTypes[0].dataSpec,
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: false,
      });
      changeSpy.resetHistory();

      await fillIn('.name-field .form-control', 'someName');
      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: dataTypes[0].dataSpec,
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        },
        isValid: true,
      });
      done();
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      disabledDataTypeSelection = false,
      dataSpecConfigKey,
      defaultDataTypeLabel,
    }) => {
      it(`shows generic configuration fields for store "${label}"`, async function (done) {
        await renderComponent();

        await selectChoose('.type-field', label);

        expectExpandedConfig('generic');

        const dataTypeField = find('.dataSpec-field .type-field');
        expect(dataTypeField.querySelector('.control-label').textContent.trim())
          .to.equal('Data type:');
        expect(dataTypeField.querySelector('.dropdown-field-trigger').textContent.trim())
          .to.equal(defaultDataTypeLabel || availableDataTypeLabels[0]);
        if (disabledDataTypeSelection) {
          expect(dataTypeField).to.have.class('field-disabled');
        } else {
          expect(dataTypeField).to.have.class('field-enabled');

          await clickTrigger('.dataSpec-field .type-field');

          const options = document.querySelectorAll('.ember-power-select-option');
          expect(options).to.have.length(availableDataTypeLabels.length);
          availableDataTypeLabels.forEach((label, idx) =>
            expect(options[idx].textContent.trim()).to.equal(label)
          );
        }

        const defaultValueField = find('.defaultValue-field');
        expect(defaultValueField.querySelector('.control-label').textContent.trim())
          .to.equal('Default value:');
        expect(defaultValueField.querySelector('.form-control').value).to.equal('');
        done();
      });

      it(`allows to configure new "${label}" store`, async function (done) {
        const changeSpy = this.get('changeSpy');

        await renderComponent();

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await selectChoose('.type-field', label);
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        if (!disabledDataTypeSelection) {
          await selectChoose('.dataSpec-field .type-field', selectedDataTypeLabel);
        }
        await fillIn('.defaultValue-field .form-control', '"someDefault"');
        await click('.needsUserInput-field .one-way-toggle');

        expect(find('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            description: 'someDescription',
            type,
            config: {
              [dataSpecConfigKey]: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
            },
            defaultInitialContent: 'someDefault',
            requiresInitialContent: true,
          },
          isValid: true,
        });
        done();
      });
    });

    it('shows range configuration fields for store "Range"', async function (done) {
      await renderComponent();

      await selectChoose('.type-field', 'Range');

      expectExpandedConfig('range');

      const rangeStartField = find('.rangeStart-field');
      const rangeEndField = find('.rangeEnd-field');
      const rangeStepField = find('.rangeStep-field');
      expect(rangeStartField.querySelector('.control-label').textContent.trim())
        .to.equal('Range start:');
      expect(rangeStartField.querySelector('.form-control').value).to.equal('0');
      expect(rangeEndField.querySelector('.control-label').textContent.trim())
        .to.equal('Range end:');
      expect(rangeEndField.querySelector('.form-control').value).to.equal('');
      expect(rangeStepField.querySelector('.control-label').textContent.trim())
        .to.equal('Range step:');
      expect(rangeStepField.querySelector('.form-control').value).to.equal('1');
      done();
    });

    it('allows to configure new "Range" store', async function (done) {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Range');
      await fillIn('.rangeStart-field .form-control', '1');
      await fillIn('.rangeEnd-field .form-control', '10');
      await fillIn('.rangeStep-field .form-control', '2');

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: 'someDescription',
          type: 'range',
          defaultInitialContent: {
            start: 1,
            end: 10,
            step: 2,
          },
          requiresInitialContent: false,
        },
        isValid: true,
      });
      done();
    });

    it('has invalid start, end and step fields in "Range" store, when are empty',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '');
        await fillIn('.rangeEnd-field .form-control', '');
        await fillIn('.rangeStep-field .form-control', '');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(find(`.${fieldName}-field`)).to.have.class('has-error')
        );
        done();
      });

    it('has invalid start, end and step fields in "Range" store, when are floats',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '0.5');
        await fillIn('.rangeEnd-field .form-control', '10.5');
        await fillIn('.rangeStep-field .form-control', '1.5');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(find(`.${fieldName}-field`)).to.have.class('has-error')
        );
        done();
      });

    it('has invalid start and end fields in "Range" store, when are equal',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '2');

        ['rangeStart', 'rangeEnd'].forEach(fieldName =>
          expect(find(`.${fieldName}-field`)).to.have.class('has-error')
        );
        expect(find('.rangeStep-field')).to.not.have.class('has-error');
        done();
      });

    it('has invalid start and end fields in "Range" store, when start > end and step > 0',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '3');
        await fillIn('.rangeEnd-field .form-control', '2');
        await fillIn('.rangeStep-field .form-control', '1');

        expect(find('.rangeStart-field .field-message').textContent.trim()).to.equal(
          'This field must be less than the range end when the range step is positive'
        );
        expect(find('.rangeEnd-field .field-message').textContent.trim()).to.equal(
          'This field must be greater than the range start when the range step is positive'
        );
        expect(find('.rangeStep-field')).to.not.have.class('has-error');
        done();
      });

    it('has invalid start and end fields in "Range" store, when start < end and step < 0',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '3');
        await fillIn('.rangeStep-field .form-control', '-1');

        expect(find('.rangeStart-field .field-message').textContent.trim()).to.equal(
          'This field must be greater than the range end when the range step is negative'
        );
        expect(find('.rangeEnd-field .field-message').textContent.trim()).to.equal(
          'This field must be less than the range start when the range step is negative'
        );
        expect(find('.rangeStep-field')).to.not.have.class('has-error');
        done();
      });

    it('has invalid step field in "Range" store, when step is 0',
      async function (done) {
        await renderComponent();

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStep-field .form-control', '     0 ');

        expect(find('.rangeStep-field')).to.have.class('has-error');
        done();
      });

    it('shows time series configuration fields for store "Time series"', async function (done) {
      await renderComponent();

      await selectChoose('.type-field', 'Time series');

      expectExpandedConfig('timeSeries');

      expect(find('.timeSeriesSchema-field')).to.not.exist;
      done();
    });

    it('allows to configure new "Time series" store', async function (done) {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Time series');
      await click('.timeSeriesSchemas-add-field-button');
      await selectChoose('.nameGeneratorType-field', 'Exact');
      await fillIn('.nameGenerator-field .form-control', 'some_name');
      await selectChoose('.unit-field', 'Bytes');
      await click('.metrics-field .tag-creator-trigger');
      await click('.tags-selector .selector-item');

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          description: 'someDescription',
          type: 'timeSeries',
          config: {
            schemas: [{
              nameGeneratorType: 'exact',
              nameGenerator: 'some_name',
              unit: 'bytes',
              metrics: {
                sum5s: {
                  aggregator: 'sum',
                  resolution: 5,
                  retention: 1440,
                },
              },
            }],
            chartSpecs: [],
          },
          requiresInitialContent: false,
        },
        isValid: true,
      });
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`allows to configure store with "${label}" data type`, async function (done) {
        const changeSpy = this.get('changeSpy');

        await renderComponent();

        await selectChoose('.type-field', 'List');
        await selectChoose('.dataSpec-field .type-field', label);

        expect(changeSpy).to.be.calledWith({
          data: {
            name: '',
            description: '',
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
            defaultInitialContent: null,
            requiresInitialContent: false,
          },
          isValid: false,
        });
        done();
      });
    });

    it('renders unchecked "needs user input" toggle', async function (done) {
      await renderComponent();

      const label = find('.needsUserInput-field .control-label');
      const toggle = find('.needsUserInput-field .one-way-toggle');
      expect(label.textContent.trim()).to.equal('Needs user input:');
      expect(toggle).to.not.have.class('checked');
      done();
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    it('has class "mode-edit', async function (done) {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-edit');
      done();
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      dataSpecConfigKey,
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store on init`, async function (done) {
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        this.set('store', Store.create({
          schemaId: 'store1id',
          instanceId: 'incorrect value that should not exist',
          name: 'store1',
          description: 'desc',
          type: type,
          config: {
            [dataSpecConfigKey]: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
          },
          defaultInitialContent: 'someDefault',
          requiresInitialContent: true,
        }));

        await renderComponent();

        expectExpandedConfig('generic');
        expect(find('.id-field .form-control').value).to.equal('store1id');
        expect(find('.instanceId-field')).to.not.exist;
        expect(find('.name-field .form-control').value).to.equal('store1');
        expect(find('.description-field .form-control').value).to.equal('desc');
        expect(find('.type-field .dropdown-field-trigger').textContent.trim())
          .to.equal(label);
        const dataTypeField = find('.dataSpec-field .type-field');
        expect(dataTypeField.querySelector('.dropdown-field-trigger').textContent.trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect(dataTypeField).to.have.class('field-disabled');
        } else {
          expect(dataTypeField).to.have.class('field-enabled');
        }
        expect(find('.defaultValue-field .form-control').value).to.equal('"someDefault"');
        expect(find('.needsUserInput-field .one-way-toggle')).to.have.class('checked');
        done();
      });
    });

    it('fills fields with data of passed "Range" store on init', async function (done) {
      this.set('store', Store.create({
        schemaId: 'store1id',
        instanceId: 'incorrect value that should not exist',
        name: 'store1',
        description: 'desc',
        type: 'range',
        defaultInitialContent: {
          start: 2,
          end: 6,
          step: 3,
        },
      }));

      await renderComponent();

      expectExpandedConfig('range');
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field')).to.not.exist;
      expect(find('.name-field .form-control').value).to.equal('store1');
      expect(find('.description-field .form-control').value).to.equal('desc');
      expect(find('.type-field .dropdown-field-trigger').textContent.trim())
        .to.equal('Range');
      expect(find('.rangeStart-field .form-control').value).to.equal('2');
      expect(find('.rangeEnd-field .form-control').value).to.equal('6');
      expect(find('.rangeStep-field .form-control').value).to.equal('3');
      done();
    });

    it('fills fields with data of passed "Time series" store on init', async function (done) {
      this.set('store', Store.create({
        schemaId: 'store1id',
        instanceId: 'incorrect value that should not exist',
        name: 'store1',
        description: 'desc',
        type: 'timeSeries',
        config: {
          schemas: [{
            nameGeneratorType: 'exact',
            nameGenerator: 'some_name',
            unit: 'bytes',
            metrics: {
              sum5s: {
                aggregator: 'sum',
                resolution: 5,
                retention: 1440,
              },
            },
          }],
          chartSpecs: undefined,
        },
      }));

      await renderComponent();

      expectExpandedConfig('timeSeries');
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field')).to.not.exist;
      expect(find('.name-field .form-control').value).to.equal('store1');
      expect(find('.description-field .form-control').value).to.equal('desc');
      expect(find('.type-field .dropdown-field-trigger').textContent)
        .to.contain('Time series');
      expect(findAll('.timeSeriesSchema-field')).to.have.length(1);
      expect(find('.nameGeneratorType-field .dropdown-field-trigger').textContent)
        .to.contain('Exact');
      expect(find('.nameGenerator-field .form-control').value).to.equal('some_name');
      expect(find('.unit-field .dropdown-field-trigger').textContent)
        .to.contain('Bytes');
      expect(findAll('.metrics-field .tag-item')).to.have.length(1);
      expect(find('.metrics-field .tag-item').textContent).to.contain('"sum5s" (sum; 5s; 1440 samp.)');
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function (done) {
          this.set('store', Store.create({
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
          }));

          await renderComponent();

          expect(find(
            '.dataSpec-field .type-field .dropdown-field-trigger'
          ).textContent.trim()).to.equal(label);
          done();
        });
    });

    it('does not update form values on passed store change', async function (done) {
      const store1 = this.set('store', Store.create({
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      }));
      await renderComponent();

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await settled();

      expect(find('.name-field .form-control').value).to.equal('store1');
      done();
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('has class "mode-view', async function (done) {
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('mode-view');
      done();
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      dataSpecConfigKey,
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store`, async function (done) {
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        this.set('store', Store.create({
          schemaId: 'store1id',
          instanceId: 'store1instanceId',
          name: 'store1',
          description: 'desc',
          type: type,
          config: {
            [dataSpecConfigKey]: dataTypes.findBy('label', selectedDataTypeLabel).dataSpec,
          },
          defaultInitialContent: 'someDefault',
          requiresInitialContent: true,
        }));

        await renderComponent();

        expect(find('.field-edit-mode')).to.not.exist;
        expectExpandedConfig('generic');
        expect(find('.id-field .form-control').value).to.equal('store1id');
        expect(find('.instanceId-field .form-control').value)
          .to.equal('store1instanceId');
        expect(find('.name-field .field-component').textContent.trim())
          .to.equal('store1');
        expect(find('.description-field .field-component').textContent.trim())
          .to.equal('desc');
        expect(find('.type-field .field-component').textContent.trim())
          .to.equal(label);
        const dataTypeField = find('.dataSpec-field .type-field');
        expect(dataTypeField.querySelector('.field-component').textContent.trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect(dataTypeField).to.have.class('field-disabled');
        } else {
          expect(dataTypeField).to.have.class('field-enabled');
        }
        expect(find('.defaultValue-field .form-control').value)
          .to.equal('"someDefault"');
        expect(find('.needsUserInput-field .one-way-toggle'))
          .to.have.class('checked');
        done();
      });
    });

    it('fills fields with data of passed "Range" store on init', async function (done) {
      this.set('store', Store.create({
        schemaId: 'store1id',
        instanceId: 'store1instanceId',
        name: 'store1',
        description: 'desc',
        type: 'range',
        defaultInitialContent: {
          start: 2,
          end: 6,
          step: 3,
        },
      }));

      await renderComponent();

      expect(find('.field-edit-mode')).to.not.exist;
      expectExpandedConfig('range');
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field .form-control').value)
        .to.equal('store1instanceId');
      expect(find('.name-field .field-component').textContent.trim())
        .to.equal('store1');
      expect(find('.description-field .field-component').textContent.trim())
        .to.equal('desc');
      expect(find('.type-field .field-component').textContent.trim())
        .to.equal('Range');
      expect(find('.rangeStart-field .field-component').textContent.trim()).to.equal('2');
      expect(find('.rangeEnd-field .field-component').textContent.trim()).to.equal('6');
      expect(find('.rangeStep-field .field-component').textContent.trim()).to.equal('3');
      done();
    });

    it('fills fields with data of passed "Time series" store on init', async function (done) {
      this.set('store', Store.create({
        schemaId: 'store1id',
        instanceId: 'store1instanceId',
        name: 'store1',
        description: 'desc',
        type: 'timeSeries',
        config: {
          schemas: [{
            nameGeneratorType: 'exact',
            nameGenerator: 'some_name',
            unit: 'bytes',
            metrics: {
              sum5s: {
                aggregator: 'sum',
                resolution: 5,
                retention: 1440,
              },
            },
          }],
          chartSpecs: [],
        },
      }));

      await renderComponent();

      expect(find('.field-edit-mode')).to.not.exist;
      expectExpandedConfig('timeSeries');
      expect(find('.id-field .form-control').value).to.equal('store1id');
      expect(find('.instanceId-field .form-control').value).to.equal('store1instanceId');
      expect(find('.name-field .field-component').textContent).to.contain('store1');
      expect(find('.description-field .field-component').textContent).to.contain('desc');
      expect(find('.type-field .field-component').textContent)
        .to.contain('Time series');
      expect(findAll('.timeSeriesSchema-field')).to.have.length(1);
      expect(find('.nameGeneratorType-field .field-component').textContent)
        .to.contain('Exact');
      expect(find('.nameGenerator-field .field-component').textContent).to.contain('some_name');
      expect(find('.unit-field .field-component').textContent)
        .to.contain('Bytes');
      expect(findAll('.metrics-field .tag-item')).to.have.length(1);
      expect(find('.metrics-field .tag-item').textContent).to.contain('"sum5s" (sum; 5s; 1440 samp.)');
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function (done) {
          this.set('store', Store.create({
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
          }));

          await renderComponent();

          expect(find('.dataSpec-field .type-field .field-component').textContent.trim())
            .to.equal(label);
          done();
        });
    });

    it('updates form values on passed store change', async function (done) {
      const store1 = this.set('store', {
        name: 'store1',
      });
      await renderComponent();

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await settled();

      expect(find('.name-field .field-component').textContent.trim()).to.equal('store2');
      done();
    });

    it('hides description field, when description is empty', async function (done) {
      this.set('store', {});

      await renderComponent();

      expect(find('.description-field')).to.not.exist;
      done();
    });

    it('hides default value field, when default value is empty', async function (done) {
      this.set('store', { defaultInitialContent: null });

      await renderComponent();

      expect(find('.defaultValue-field')).to.not.exist;
      done();
    });
  });
});

async function renderComponent() {
  await render(hbs `{{modals/workflow-visualiser/store-modal/store-form
    mode=mode
    store=store
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function (done) {
    await renderComponent();

    expect(find('.store-form')).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(find('.field-disabled')).to.not.exist;
    done();
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function (done) {
    this.set('isDisabled', true);

    await renderComponent();

    expect(find('.store-form')).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(find('.field-enabled')).to.not.exist;
    done();
  });
}

function expectExpandedConfig(configName) {
  ['generic', 'range', 'timeSeries'].filter((name) => name !== configName)
    .forEach((name) => {
      const collapse = find(`.${name}StoreConfig-collapse`);
      if (collapse) {
        expect(collapse).to.not.have.class('in');
      }
    });
  expect(find(`.${configName}StoreConfig-collapse`)).to.have.class('in');
}
