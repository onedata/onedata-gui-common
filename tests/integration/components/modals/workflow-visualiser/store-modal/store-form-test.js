import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { click, fillIn, focus, blur, find, findAll } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../../../helpers/ember-power-select';
import $ from 'jquery';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';

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
}];

const storeTypesWithGenericConfig = storeTypes
  .filter(({ type }) => type !== 'range' && type !== 'timeSeries');

describe('Integration | Component | modals/workflow visualiser/store modal/store form', function () {
  setupComponentTest('modals/workflow-visualiser/store-modal/store-form', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      changeSpy: sinon.spy(),
      isDisabled: false,
    });
  });

  it(`has class "${componentClass}"`, async function () {
    this.render(hbs `{{modals/workflow-visualiser/store-modal/store-form}}`);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('mode', 'create');
    });

    it('has class "mode-create', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-create');
    });

    it('does not render "id" and "instance id" fields', async function () {
      await render(this);

      expect(this.$('.id-field')).to.not.exist;
      expect(this.$('.instanceId-field')).to.not.exist;
    });

    it('renders empty "name" field', async function () {
      await render(this);

      const $label = this.$('.name-field .control-label');
      const $field = this.$('.name-field .form-control');
      expect($label.text().trim()).to.equal('Name:');
      expect($field).to.have.attr('type', 'text');
      expect($field).to.have.value('');
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await render(this);

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(this.$('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', 'somename');

      expect(this.$('.name-field')).to.have.class('has-success');
    });

    it('renders empty "description" field', async function () {
      await render(this);

      const $label = this.$('.description-field .control-label');
      const $field = this.$('.description-field .form-control');
      expect($label.text().trim()).to.equal('Description (optional):');
      expect($field).to.match('textarea');
      expect($field).to.have.value('');
    });

    it('marks "description" field as valid when it is empty', async function () {
      await render(this);

      await focus('.description-field .form-control');
      await blur('.description-field .form-control');

      expect(this.$('.description-field')).to.have.class('has-success');
    });

    it('renders "type" field with preselected "list" option', async function () {
      await render(this);

      const $label = this.$('.type-field .control-label');
      const $field = this.$('.type-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Type:');
      expect($field.text().trim()).to.equal('List');
    });

    it('provides all needed options to choose in "type" field', async function () {
      await render(this);

      await clickTrigger('.type-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(storeTypes.length);
      storeTypes.forEach(({ label }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(label)
      );
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');

      await render(this);

      expect(this.$('.has-error')).to.not.exist;
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
      changeSpy.reset();

      await fillIn('.name-field .form-control', 'someName');
      expect(this.$('.has-error')).to.not.exist;
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
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      disabledDataTypeSelection = false,
      dataSpecConfigKey,
      defaultDataTypeLabel,
    }) => {
      it(`shows generic configuration fields for store "${label}"`, async function () {
        await render(this);

        await selectChoose('.type-field', label);

        expectExpandedConfig('generic');

        const $dataTypeField = this.$('.dataType-field');
        expect($dataTypeField.find('.control-label').text().trim()).to.equal('Data type:');
        expect($dataTypeField.find('.dropdown-field-trigger').text().trim())
          .to.equal(defaultDataTypeLabel || availableDataTypeLabels[0]);
        if (disabledDataTypeSelection) {
          expect($dataTypeField).to.have.class('field-disabled');
        } else {
          expect($dataTypeField).to.have.class('field-enabled');

          await clickTrigger('.dataType-field');

          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(availableDataTypeLabels.length);
          availableDataTypeLabels.forEach((label, idx) =>
            expect($options.eq(idx).text().trim()).to.equal(label)
          );
        }

        const $defaultValueField = this.$('.defaultValue-field');
        expect($defaultValueField.find('.control-label').text().trim())
          .to.equal('Default value:');
        expect($defaultValueField.find('.form-control')).to.have.value('');
      });

      it(`allows to configure new "${label}" store`, async function () {
        const changeSpy = this.get('changeSpy');

        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await selectChoose('.type-field', label);
        const selectedDataTypeLabel = availableDataTypeLabels[0];
        if (!disabledDataTypeSelection) {
          await selectChoose('.dataType-field', selectedDataTypeLabel);
        }
        await fillIn('.defaultValue-field .form-control', '"someDefault"');
        await click('.needsUserInput-field .one-way-toggle');

        expect(this.$('.has-error')).to.not.exist;
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
      });
    });

    it('shows range configuration fields for store "Range"', async function () {
      await render(this);

      await selectChoose('.type-field', 'Range');

      expectExpandedConfig('range');

      const $rangeStartField = this.$('.rangeStart-field');
      const $rangeEndField = this.$('.rangeEnd-field');
      const $rangeStepField = this.$('.rangeStep-field');
      expect($rangeStartField.find('.control-label').text().trim())
        .to.equal('Range start:');
      expect($rangeStartField.find('.form-control')).to.have.value('0');
      expect($rangeEndField.find('.control-label').text().trim())
        .to.equal('Range end:');
      expect($rangeEndField.find('.form-control')).to.have.value('');
      expect($rangeStepField.find('.control-label').text().trim())
        .to.equal('Range step:');
      expect($rangeStepField.find('.form-control')).to.have.value('1');
    });

    it('allows to configure new "Range" store', async function () {
      const changeSpy = this.get('changeSpy');

      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Range');
      await fillIn('.rangeStart-field .form-control', '1');
      await fillIn('.rangeEnd-field .form-control', '10');
      await fillIn('.rangeStep-field .form-control', '2');

      expect(this.$('.has-error')).to.not.exist;
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
    });

    it('has invalid start, end and step fields in "Range" store, when are empty',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '');
        await fillIn('.rangeEnd-field .form-control', '');
        await fillIn('.rangeStep-field .form-control', '');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(this.$(`.${fieldName}-field`)).to.have.class('has-error')
        );
      });

    it('has invalid start, end and step fields in "Range" store, when are floats',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '0.5');
        await fillIn('.rangeEnd-field .form-control', '10.5');
        await fillIn('.rangeStep-field .form-control', '1.5');

        ['rangeStart', 'rangeEnd', 'rangeStep'].forEach(fieldName =>
          expect(this.$(`.${fieldName}-field`)).to.have.class('has-error')
        );
      });

    it('has invalid start and end fields in "Range" store, when are equal',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '2');

        ['rangeStart', 'rangeEnd'].forEach(fieldName =>
          expect(this.$(`.${fieldName}-field`)).to.have.class('has-error')
        );
        expect(this.$('.rangeStep-field')).to.not.have.class('has-error');
      });

    it('has invalid start and end fields in "Range" store, when start > end and step > 0',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '3');
        await fillIn('.rangeEnd-field .form-control', '2');
        await fillIn('.rangeStep-field .form-control', '1');

        expect(this.$('.rangeStart-field .field-message').text().trim()).to.equal(
          'This field must be less than the range end when the range step is positive'
        );
        expect(this.$('.rangeEnd-field .field-message').text().trim()).to.equal(
          'This field must be greater than the range start when the range step is positive'
        );
        expect(this.$('.rangeStep-field')).to.not.have.class('has-error');
      });

    it('has invalid start and end fields in "Range" store, when start > end and step > 0',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStart-field .form-control', '2');
        await fillIn('.rangeEnd-field .form-control', '3');
        await fillIn('.rangeStep-field .form-control', '-1');

        expect(this.$('.rangeStart-field .field-message').text().trim()).to.equal(
          'This field must be greater than the range end when the range step is negative'
        );
        expect(this.$('.rangeEnd-field .field-message').text().trim()).to.equal(
          'This field must be less than the range start when the range step is negative'
        );
        expect(this.$('.rangeStep-field')).to.not.have.class('has-error');
      });

    it('has invalid step field in "Range" store, when step is 0',
      async function () {
        await render(this);

        await selectChoose('.type-field', 'Range');
        await fillIn('.rangeStep-field .form-control', '     0 ');

        expect(this.$('.rangeStep-field')).to.have.class('has-error');
      });

    it('shows time series configuration fields for store "Time series"', async function (done) {
      await render(this);

      await selectChoose('.type-field', 'Time series');

      expectExpandedConfig('timeSeries');

      expect(find('.timeSeriesSchema-field')).to.not.exist;
      done();
    });

    it('allows to configure new "Time series" store', async function (done) {
      const changeSpy = this.get('changeSpy');

      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await fillIn('.description-field .form-control', 'someDescription');
      await selectChoose('.type-field', 'Time series');
      await click('.add-field-button');
      await selectChoose('.nameGeneratorType-field', 'Exact');
      await fillIn('.nameGenerator-field .form-control', 'some_name');
      await selectChoose('.unit-field', 'Bytes');
      await click('.metrics-add-field-button');
      await fillIn('.metric-field .id-field .form-control', 'someId');
      await selectChoose('.metric-field .aggregator-field', 'Sum');
      await selectChoose('.metric-field .resolution-field', '1 hour');
      await fillIn('.metric-field .retention-field .form-control', '200');

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
                someId: {
                  aggregator: 'sum',
                  resolution: 60 * 60,
                  retention: 200,
                },
              },
            }],
          },
          requiresInitialContent: false,
        },
        isValid: true,
      });
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`allows to configure store with "${label}" data type`, async function () {
        const changeSpy = this.get('changeSpy');

        await render(this);

        await selectChoose('.type-field', 'List');
        await selectChoose('.dataType-field', label);

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
      });
    });

    it('renders unchecked "needs user input" toggle', async function () {
      await render(this);

      const $label = this.$('.needsUserInput-field .control-label');
      const $toggle = this.$('.needsUserInput-field .one-way-toggle');
      expect($label.text().trim()).to.equal('Needs user input:');
      expect($toggle).to.not.have.class('checked');
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('mode', 'edit');
    });

    it('has class "mode-edit', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-edit');
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      dataSpecConfigKey,
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store on init`, async function () {
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

        await render(this);

        expectExpandedConfig('generic');
        expect(this.$('.id-field .form-control')).to.have.value('store1id');
        expect(this.$('.instanceId-field')).to.not.exist;
        expect(this.$('.name-field .form-control')).to.have.value('store1');
        expect(this.$('.description-field .form-control')).to.have.value('desc');
        expect(this.$('.type-field .dropdown-field-trigger').text().trim()).to.equal(label);
        const $dataTypeField = this.$('.dataType-field');
        expect($dataTypeField.find('.dropdown-field-trigger').text().trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect($dataTypeField).to.have.class('field-disabled');
        } else {
          expect($dataTypeField).to.have.class('field-enabled');
        }
        expect(this.$('.defaultValue-field .form-control')).to.have.value('"someDefault"');
        expect(this.$('.needsUserInput-field .one-way-toggle')).to.have.class('checked');
      });
    });

    it('fills fields with data of passed "Range" store on init', async function () {
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

      await render(this);

      expectExpandedConfig('range');
      expect(this.$('.id-field .form-control')).to.have.value('store1id');
      expect(this.$('.instanceId-field')).to.not.exist;
      expect(this.$('.name-field .form-control')).to.have.value('store1');
      expect(this.$('.description-field .form-control')).to.have.value('desc');
      expect(this.$('.type-field .dropdown-field-trigger').text().trim())
        .to.equal('Range');
      expect(this.$('.rangeStart-field .form-control')).to.have.value('2');
      expect(this.$('.rangeEnd-field .form-control')).to.have.value('6');
      expect(this.$('.rangeStep-field .form-control')).to.have.value('3');
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
              someId: {
                aggregator: 'sum',
                resolution: 60 * 60,
                retention: 200,
              },
            },
          }],
        },
      }));

      await render(this);

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
      expect(findAll('.metric-field')).to.have.length(1);
      expect(find('.metric-field .id-field .form-control').value).to.equal('someId');
      expect(find('.metric-field .aggregator-field .dropdown-field-trigger').textContent)
        .to.contain('Sum');
      expect(find('.metric-field .resolution-field .dropdown-field-trigger').textContent)
        .to.contain('1 hour');
      expect(find('.metric-field .retention-field .form-control').value).to.equal('200');
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function () {
          this.set('store', Store.create({
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
          }));

          await render(this);

          expect(this.$('.dataType-field .dropdown-field-trigger').text().trim())
            .to.equal(label);
        });
    });

    it('does not update form values on passed store change', async function () {
      const store1 = this.set('store', Store.create({
        name: 'store1',
        description: 'desc',
        type: 'singleValue',
      }));
      await render(this);

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await wait();

      expect(this.$('.name-field .form-control')).to.have.value('store1');
    });

    itHasAllFieldsEnabledByDefault();
    itAllowsToDisableAllFields();
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('has class "mode-view', async function () {
      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('mode-view');
    });

    storeTypesWithGenericConfig.forEach(({
      label,
      type,
      availableDataTypeLabels = dataTypes.mapBy('label'),
      dataSpecConfigKey,
      disabledDataTypeSelection = false,
    }) => {
      it(`fills fields with data of passed "${label}" store`, async function () {
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

        await render(this);

        expect(this.$('.field-edit-mode')).to.not.exist;
        expectExpandedConfig('generic');
        expect(this.$('.id-field .form-control')).to.have.value('store1id');
        expect(this.$('.instanceId-field .form-control'))
          .to.have.value('store1instanceId');
        expect(this.$('.name-field .field-component').text().trim())
          .to.equal('store1');
        expect(this.$('.description-field .field-component').text().trim())
          .to.equal('desc');
        expect(this.$('.type-field .field-component').text().trim())
          .to.equal(label);
        const $dataTypeField = this.$('.dataType-field');
        expect(this.$('.dataType-field .field-component').text().trim())
          .to.equal(selectedDataTypeLabel);
        if (disabledDataTypeSelection) {
          expect($dataTypeField).to.have.class('field-disabled');
        } else {
          expect($dataTypeField).to.have.class('field-enabled');
        }
        expect(this.$('.defaultValue-field .form-control'))
          .to.have.value('"someDefault"');
        expect(this.$('.needsUserInput-field .one-way-toggle'))
          .to.have.class('checked');
      });
    });

    it('fills fields with data of passed "Range" store on init', async function () {
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

      await render(this);

      expect(this.$('.field-edit-mode')).to.not.exist;
      expectExpandedConfig('range');
      expect(this.$('.id-field .form-control')).to.have.value('store1id');
      expect(this.$('.instanceId-field .form-control'))
        .to.have.value('store1instanceId');
      expect(this.$('.name-field .field-component').text().trim())
        .to.equal('store1');
      expect(this.$('.description-field .field-component').text().trim())
        .to.equal('desc');
      expect(this.$('.type-field .field-component').text().trim())
        .to.equal('Range');
      expect(this.$('.rangeStart-field .field-component').text().trim()).to.equal('2');
      expect(this.$('.rangeEnd-field .field-component').text().trim()).to.equal('6');
      expect(this.$('.rangeStep-field .field-component').text().trim()).to.equal('3');
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
              someId: {
                aggregator: 'sum',
                resolution: 60 * 60,
                retention: 200,
              },
            },
          }],
        },
      }));

      await render(this);

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
      expect(findAll('.metric-field')).to.have.length(1);
      expect(find('.metric-field .id-field .field-component').textContent).to.contain('someId');
      expect(find('.metric-field .aggregator-field .field-component').textContent)
        .to.contain('Sum');
      expect(find('.metric-field .resolution-field .field-component').textContent)
        .to.contain('1 hour');
      expect(find('.metric-field .retention-field .field-component').textContent).to.contain('200');
      done();
    });

    dataTypes.forEach(({ label, dataSpec }) => {
      it(`fills fields with data of passed store with "${label}" data type`,
        async function () {
          this.set('store', Store.create({
            type: 'list',
            config: {
              itemDataSpec: dataSpec,
            },
          }));

          await render(this);

          expect(this.$('.dataType-field .field-component').text().trim())
            .to.equal(label);
        });
    });

    it('updates form values on passed store change', async function () {
      const store1 = this.set('store', {
        name: 'store1',
      });
      await render(this);

      this.set('store', Object.assign({}, store1, { name: 'store2' }));
      await wait();

      expect(this.$('.name-field .field-component').text().trim()).to.equal('store2');
    });

    it('hides description field, when description is empty', async function () {
      this.set('store', {});

      await render(this);

      expect(this.$('.description-field')).to.not.exist;
    });

    it('hides default value field, when default value is empty', async function () {
      this.set('store', { defaultInitialContent: null });

      await render(this);

      expect(this.$('.defaultValue-field')).to.not.exist;
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{modals/workflow-visualiser/store-modal/store-form
    mode=mode
    store=store
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
  await wait();
}

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await render(this);

    expect(this.$('.store-form')).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(this.$('.field-disabled')).to.not.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await render(this);

    expect(this.$('.store-form')).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(this.$('.field-enabled')).to.not.exist;
  });
}

function expectExpandedConfig(configName) {
  ['generic', 'range', 'timeSeries']
  .filter((name) => name !== configName)
    .forEach((name) => {
      const collapse = find(`.${name}StoreConfig-collapse`);
      if (collapse) {
        expect([...collapse.classList]).to.not.include('in');
      }
    });
  expect([...find(`.${configName}StoreConfig-collapse`).classList]).to.include('in');
}
