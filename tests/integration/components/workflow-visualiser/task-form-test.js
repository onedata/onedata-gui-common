import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import OneDrodopdownHelper from '../../../helpers/one-dropdown';
import sinon from 'sinon';
import _ from 'lodash';
import { classify } from '@ember/string';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { setProperties } from '@ember/object';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import {
  render,
  settled,
  fillIn,
  click,
  find,
  findAll,
} from '@ember/test-helpers';
import { replaceEmberAceWithTextarea } from '../../../helpers/ember-ace';

const componentClass = 'task-form';

const dataSpecs = [{
  label: 'Number',
  name: 'number',
  dataSpec: {
    type: 'number',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: 10,
  inputExampleConstValue: async (fieldSelector) => {
    await fillIn(`${fieldSelector} input`, '10');
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} input`)).to.have.value('10');
  },
}, {
  label: 'Boolean',
  name: 'boolean',
  dataSpec: {
    type: 'boolean',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: true,
  inputExampleConstValue: async (fieldSelector) => {
    await (new OneDrodopdownHelper(fieldSelector))
    .selectOptionByText('true');
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(new OneDrodopdownHelper(fieldSelector).getSelectedOptionText())
      .to.equal('true');
  },
}, {
  label: 'String',
  name: 'string',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: 'abc',
  inputExampleConstValue: async (fieldSelector) => {
    await fillIn(`${fieldSelector} textarea`, 'abc');
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} textarea`)).to.have.value('abc');
  },
}, {
  label: 'Object',
  name: 'object',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
  valueBuilderTypes: [
    'iteratedItem',
    'singleValueStoreContent',
    'const',
  ],
  canContain: [
    'file',
    'dataset',
    'range',
    'timeSeriesMeasurement',
  ],
  exampleConstValue: { a: 1 },
  inputExampleConstValue: async (fieldSelector) => {
    await fillIn(`${fieldSelector} textarea`, '{ "a": 1 }');
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} textarea`))
      .to.have.value(JSON.stringify({ a: 1 }, null, 2));
  },
}, {
  label: 'File',
  name: 'file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'ANY',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: { file_id: 'someid' },
  inputExampleConstValue: async (fieldSelector) => {
    await click(`${fieldSelector} .file-value-editor-selector`);
    await click('.provide-file-id-action-trigger');
    await fillIn(`${fieldSelector} .fileId-field input`, 'someid');
    await click(`${fieldSelector} .accept-btn`);
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} .file-editor`))
      .to.have.class('mode-selected');
  },
}, {
  label: 'Dataset',
  name: 'dataset',
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: { datasetId: 'someid' },
  inputExampleConstValue: async (fieldSelector) => {
    await click(`${fieldSelector} .dataset-value-editor-selector`);
    await click('.provide-dataset-id-action-trigger');
    await fillIn(`${fieldSelector} .datasetId-field input`, 'someid');
    await click(`${fieldSelector} .accept-btn`);
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} .dataset-editor`)).to.have.class('mode-selected');
  },
}, {
  label: 'Range',
  name: 'range',
  dataSpec: {
    type: 'range',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: {
    start: 2,
    end: 10,
    step: 3,
  },
  inputExampleConstValue: async (fieldSelector) => {
    await fillIn(`${fieldSelector} .start-field input`, '2');
    await fillIn(`${fieldSelector} .end-field input`, '10');
    await fillIn(`${fieldSelector} .step-field input`, '3');
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} .start-field input`)).to.have.value('2');
    expect(find(`${fieldSelector} .end-field input`)).to.have.value('10');
    expect(find(`${fieldSelector} .step-field input`)).to.have.value('3');
  },
}, {
  label: 'Time series measurement',
  name: 'timeSeriesMeasurement',
  dataSpec: {
    type: 'timeSeriesMeasurement',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  exampleConstValue: {
    timestamp: 123,
    tsName: 'abc',
    value: 1,
  },
  inputExampleConstValue: async (fieldSelector) => {
    await fillIn(`${fieldSelector} .timestamp-field input`, '123');
    await fillIn(`${fieldSelector} .tsName-field input`, 'abc');
    await fillIn(`${fieldSelector} .value-field input`, '1');
  },
  checkExampleConstValue: (fieldSelector) => {
    expect(find(`${fieldSelector} .timestamp-field input`)).to.have.value('123');
    expect(find(`${fieldSelector} .tsName-field input`)).to.have.value('abc');
    expect(find(`${fieldSelector} .value-field input`)).to.have.value('1');
  },
}];

const valueBuilderTypeLabels = {
  iteratedItem: 'Iterated item',
  singleValueStoreContent: 'Store content',
  const: 'Constant value',
};

const allSimpleDataSpecNames = [
  'number',
  'boolean',
  'string',
  'object',
  'file',
  'dataset',
  'range',
  'timeSeriesMeasurement',
];
const allPossibleStoreSpecs = [{
  type: 'singleValue',
  allowedDataSpecNames: allSimpleDataSpecNames,
  dataSpecConfigKey: 'itemDataSpec',
  acceptsBatch: false,
}, {
  type: 'list',
  allowedDataSpecNames: allSimpleDataSpecNames,
  dataSpecConfigKey: 'itemDataSpec',
  acceptsBatch: true,
  dispatchFunctions: ['append', 'extend'],
}, {
  type: 'treeForest',
  allowedDataSpecNames: [
    'file',
    'dataset',
  ],
  dataSpecConfigKey: 'itemDataSpec',
  acceptsBatch: true,
  dispatchFunctions: ['append', 'extend'],
}, {
  type: 'range',
  allowedDataSpecNames: ['range'],
  acceptsBatch: false,
  dispatchFunctions: [],
}, {
  type: 'auditLog',
  allowedDataSpecNames: allSimpleDataSpecNames,
  dataSpecConfigKey: 'logContentDataSpec',
  acceptsBatch: true,
  dispatchFunctions: ['append', 'extend'],
}, {
  type: 'timeSeries',
  allowedDataSpecNames: ['timeSeriesMeasurement'],
  acceptsBatch: true,
  dispatchFunctions: [],
}];
const allPossibleStores = [];
allPossibleStoreSpecs
  .rejectBy('type', 'range')
  .rejectBy('type', 'timeSeries')
  .forEach(({
      type,
      allowedDataSpecNames,
      dataSpecConfigKey,
    }) =>
    allPossibleStores.push(...allowedDataSpecNames.map(dataSpecName => {
      const storeLabel = `${type}${classify(dataSpecName)}`;
      return {
        id: `${storeLabel}Id`,
        name: `${storeLabel}Store`,
        type,
        config: {
          [dataSpecConfigKey]: dataSpecs.findBy('name', dataSpecName).dataSpec,
        },
        requiresInitialContent: false,
      };
    }))
  );
allPossibleStores.push({
  id: 'rangeRangeId',
  name: 'rangeRangeStore',
  type: 'range',
  defaultInitialContent: {
    start: 1,
    end: 10,
    step: 2,
  },
  requiresInitialContent: false,
});
allPossibleStores.push({
  id: 'timeSeriesTimeSeriesMeasurementId',
  name: 'timeSeriesTimeSeriesMeasurementStore',
  type: 'timeSeries',
  config: {
    timeSeriesCollectionSchema: {
      timeSeriesSchemas: [],
    },
  },
  requiresInitialContent: false,
});
const taskAuditLogStore = {
  id: 'CURRENT_TASK_SYSTEM_AUDIT_LOG',
  name: 'Current task system audit log',
  type: 'auditLog',
  config: {
    logContentDataSpec: {
      type: 'object',
      valueConstraints: {},
    },
  },
  requiresInitialContent: false,
};
const workflowAuditLogStore = {
  id: 'WORKFLOW_SYSTEM_AUDIT_LOG',
  name: 'Workflow system audit log',
  type: 'auditLog',
  config: {
    logContentDataSpec: {
      type: 'object',
      valueConstraints: {},
    },
  },
  requiresInitialContent: false,
};
const taskTimeSeriesStore = {
  id: 'CURRENT_TASK_TIME_SERIES',
  name: 'Current task time series store',
  type: 'time series',
  config: {
    timeSeriesCollectionSchema: {
      timeSeriesSchemas: [],
    },
    dashboardSpec: null,
  },
  requiresInitialContent: false,
};

const dispatchFunctionLabels = {
  append: 'Append',
  extend: 'Extend',
  set: 'Set',
};

const exampleAtmLambdaRevision = {
  name: 'function1',
  summary: 'function1 summary',
  preferredBatchSize: 1,
  argumentSpecs: [{
    name: 'argint',
    dataSpec: {
      type: 'number',
      valueConstraints: {},
    },
    isOptional: true,
  }, {
    name: 'argstring',
    dataSpec: {
      type: 'string',
      valueConstraints: {},
    },
    isOptional: true,
  }],
  resultSpecs: [{
    name: 'resstring',
    dataSpec: {
      type: 'string',
      valueConstraints: {},
    },
  }, {
    name: 'resfile',
    dataSpec: {
      type: 'file',
      valueConstraints: {
        fileType: 'ANY',
      },
    },
  }],
  resourceSpec: {
    cpuRequested: 0.1,
    cpuLimit: null,
    memoryRequested: 128 * 1024 * 1024,
    memoryLimit: null,
    ephemeralStorageRequested: 0,
    ephemeralStorageLimit: null,
  },
};

const exampleAtmLambda = {
  entityId: 'id1',
  revisionRegistry: {
    1: exampleAtmLambdaRevision,
  },
};
const exampleTask = {
  id: 't1',
  name: 'task1',
  argumentMappings: [{
    argumentName: 'argint',
    valueBuilder: {
      valueBuilderType: 'iteratedItem',
    },
  }],
  resultMappings: [{
    resultName: 'resstring',
    storeSchemaId: 'singleValueStringId',
    storeContentUpdateOptions: {
      type: 'singleValueStoreContentUpdateOptions',
    },
  }, {
    resultName: 'resfile',
    storeSchemaId: 'treeForestFileId',
    storeContentUpdateOptions: {
      type: 'treeForestStoreContentUpdateOptions',
      function: 'append',
    },
  }],
  timeSeriesStoreConfig: null,
};

const atmLambdaRevisionNumberDropdown = new OneDrodopdownHelper(
  '.atmLambdaRevisionNumber-field'
);
const valueBuilderTypeDropdown = new OneDrodopdownHelper('.valueBuilderType-field');
const valueBuilderStoreDropdown = new OneDrodopdownHelper('.valueBuilderStore-field');
const targetStoreDropdown = new OneDrodopdownHelper('.targetStore-field');
const dispatchFunctionDropdown = new OneDrodopdownHelper('.dispatchFunction-field');

describe('Integration | Component | workflow visualiser/task form', function () {
  setupRenderingTest();

  beforeEach(function () {
    replaceEmberAceWithTextarea(this);
    const createCreateStoreActionStub = sinon.stub().returns({
      execute: () => {
        if (this.get('createStoreSucceeds')) {
          const newStoreFromCreation = this.get('newStoreFromCreation');
          this.get('definedStores').pushObject(newStoreFromCreation);
          return resolve({ status: 'done', result: newStoreFromCreation });
        } else {
          return resolve({ status: 'failed' });
        }
      },
    });
    const actionsFactory = {
      createCreateStoreAction: createCreateStoreActionStub,
    };
    this.setProperties({
      atmLambda: _.cloneDeep(exampleAtmLambda),
      atmLambdaRevisionNumber: 1,
      definedStores: A(
        _.cloneDeep(allPossibleStores).map((rawStore) => Store.create(rawStore))
      ),
      createStoreSucceeds: true,
      newStoreFromCreation: undefined,
      actionsFactory,
      createCreateStoreActionStub,
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await renderComponent();

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class(componentClass);
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'create',
        changeSpy: sinon.spy(),
      });
    });

    itHasModeClass('create');
    itHasEnabledFieldsByDefault();
    itAllowsToDisableAllFields();
    itShowsLambdaInfo();

    it('renders "name" field', async function (done) {
      await renderComponent();

      const label = find('.name-field .control-label');
      const field = find('.name-field .form-control');
      expect(label.textContent.trim()).to.equal('Name:');
      expect(field.type).to.equal('text');
      done();
    });

    it('uses lambda name as default value for name field', async function (done) {
      await renderComponent();

      expect(find('.name-field .form-control'))
        .to.have.value(exampleAtmLambdaRevision.name);
      done();
    });

    it('marks "name" field as invalid when it is empty', async function (done) {
      await renderComponent();

      await fillIn('.name-field .form-control', '');

      expect(find('.name-field')).to.have.class('has-error');
      done();
    });

    it('marks "name" field as valid when it is not empty', async function (done) {
      await renderComponent();

      await fillIn('.name-field .form-control', 'somename');

      expect(find('.name-field')).to.have.class('has-success');
      done();
    });

    it('notifies about changes of values and validation state', async function (done) {
      const changeSpy = this.get('changeSpy');

      await renderComponent();

      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
          name: exampleAtmLambdaRevision.name,
          argumentMappings: [],
          resultMappings: [],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });
      changeSpy.resetHistory();

      await fillIn('.name-field .form-control', 'someName');
      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
          name: 'someName',
          argumentMappings: [],
          resultMappings: [],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });
      done();
    });

    it('does not render arguments section, if lambda does not specify any',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.argumentSpecs', []);

        await renderComponent();

        expect(find('.argumentMappings-field')).to.not.exist;
        done();
      });

    it('renders arguments section', async function (done) {
      await renderComponent();

      const argumentMappings = find('.argumentMappings-field');
      expect(argumentMappings).to.exist;
      expect(argumentMappings.querySelector('.control-label').textContent.trim())
        .to.equal('Arguments');
      const args = argumentMappings.querySelectorAll('.argumentMapping-field');
      expect(args).to.have.length(exampleAtmLambdaRevision.argumentSpecs.length);
      exampleAtmLambdaRevision.argumentSpecs.forEach(({ name }, idx) => {
        expect(args[idx].querySelector('.control-label').textContent.trim())
          .to.equal(`${name}:`);
      });
      done();
    });

    dataSpecs.forEach(({
      name,
      label,
      dataSpec,
      valueBuilderTypes,
      canContain,
      inputExampleConstValue,
      exampleConstValue,
    }) => {
      it(`provides available value builder types for argument of type "${label}"`,
        async function (done) {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: false,
          }]);

          await renderComponent();

          expect(valueBuilderTypeDropdown.getSelectedOptionText())
            .to.equal(valueBuilderTypeLabels[valueBuilderTypes[0]]);
          expect(await valueBuilderTypeDropdown.getOptionsText())
            .to.deep.equal(valueBuilderTypes.map((type) => valueBuilderTypeLabels[type]));
          done();
        });

      it(`provides available value builder types for optional argument of type "${label}"`,
        async function (done) {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: true,
          }]);

          await renderComponent();
          expect(valueBuilderTypeDropdown.getSelectedOptionText())
            .to.equal('Leave unassigned');
          expect(await valueBuilderTypeDropdown.getOptionsText()).to.deep.equal([
            'Leave unassigned',
            ...valueBuilderTypes.map((type) => valueBuilderTypeLabels[type]),
          ]);
          done();
        });

      it(`allows to setup optional argument of type "${label}" using "Leave unassigned" value builder`,
        async function (done) {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: true,
          }]);

          await renderComponent();
          await valueBuilderTypeDropdown.selectOptionByText('Leave unassigned');

          expect(this.get('changeSpy')).to.be.calledWith({
            data: {
              lambdaId: 'id1',
              lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
              name: 'function1',
              argumentMappings: [],
              resultMappings: [],
              timeSeriesStoreConfig: null,
            },
            isValid: true,
          });
          done();
        });

      if (valueBuilderTypes.includes('iteratedItem')) {
        it(`allows to setup argument of type "${label}" using "Iterated item" value builder`,
          async function (done) {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            await renderComponent();
            await valueBuilderTypeDropdown.selectOptionByText('Iterated item');

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                lambdaId: 'id1',
                lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'iteratedItem',
                  },
                }],
                resultMappings: [],
                timeSeriesStoreConfig: null,
              },
              isValid: true,
            });
            done();
          });
      }

      if (valueBuilderTypes.includes('singleValueStoreContent')) {
        it(`allows to setup argument of type "${label}" using "Store content" value builder`,
          async function (done) {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            const possibleDataSpecNames = dataSpecs.mapBy('name').filter(specName =>
              name === specName || (canContain || []).includes(specName)
            );
            const possibleStores = possibleDataSpecNames.map(dataSpecName =>
              allPossibleStores.findBy(
                'name',
                `singleValue${classify(dataSpecName)}Store`
              )
            ).compact();
            const sortedPossibleStores = possibleStores.sortBy('name');

            await renderComponent();
            await valueBuilderTypeDropdown.selectOptionByText('Store content');
            expect(await valueBuilderStoreDropdown.getOptionsText())
              .to.deep.equal([
                'Create store...',
                ...sortedPossibleStores.map(({ name }) => name),
              ]);

            const storeToSelect = sortedPossibleStores[sortedPossibleStores.length - 1];
            await valueBuilderStoreDropdown.selectOptionByText(storeToSelect.name);

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                lambdaId: 'id1',
                lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'singleValueStoreContent',
                    valueBuilderRecipe: storeToSelect.id,
                  },
                }],
                resultMappings: [],
                timeSeriesStoreConfig: null,
              },
              isValid: true,
            });
            done();
          });

        it(`allows to create new store for argument of type "${label}" using "Store content" value builder`,
          async function (done) {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            this.set('newStoreFromCreation', Store.create({
              id: 'newstore',
              name: 'new store',
              config: {
                itemDataSpec: dataSpec,
              },
              type: 'singleValue',
            }));
            const allowedStoreTypes = ['singleValue'];

            await renderComponent();
            await valueBuilderTypeDropdown.selectOptionByText('Store content');
            await valueBuilderStoreDropdown.selectOptionByText('Create store...');

            expect(valueBuilderStoreDropdown.getSelectedOptionText())
              .to.equal('new store');
            const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
            expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
            const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

            expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
              .to.deep.equal(allowedStoreTypes.sort());
            expect(lastCreateStoreCallArg.allowedStoreReadDataSpec)
              .to.deep.equal(dataSpec);
            done();
          });
      }

      if (valueBuilderTypes.includes('const')) {
        it(`allows to setup argument of type "${label}" using "Constant value" value builder`,
          async function (done) {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            await renderComponent();
            await valueBuilderTypeDropdown.selectOptionByText('Constant value');
            await inputExampleConstValue('.valueBuilderConstValue-field');

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                lambdaId: 'id1',
                lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'const',
                    valueBuilderRecipe: exampleConstValue,
                  },
                }],
                resultMappings: [],
                timeSeriesStoreConfig: null,
              },
              isValid: true,
            });
            done();
          });
      }
    });

    it('does not render results section, if lambda does not specify any',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', []);

        await renderComponent();

        expect(find('.resultMappings-field')).to.not.exist;
        done();
      });

    it('renders results section', async function (done) {
      await renderComponent();

      const resultMappings = find('.resultMappings-field');
      expect(resultMappings).to.exist;
      expect(resultMappings.querySelector('.control-label').textContent.trim())
        .to.equal('Results');
      const results = resultMappings.querySelectorAll('.singleResultMappings-field');
      expect(results).to.have.length(exampleAtmLambdaRevision.resultSpecs.length);
      exampleAtmLambdaRevision.resultSpecs.forEach(({ name }, idx) => {
        expect(results[idx].querySelector('.control-label').textContent.trim())
          .to.equal(`${name}:`);
      });
      done();
    });

    allSimpleDataSpecNames.forEach(dataSpecName => {
      const dataSpec = dataSpecs.findBy('name', dataSpecName).dataSpec;
      const compatibleDataSpecNames = dataSpecs.filter(({ name, canContain }) => {
        return name === dataSpecName || (canContain || []).includes(dataSpecName);
      }).mapBy('name');
      const possibleStores = allPossibleStores.filter(({ name }) =>
        compatibleDataSpecNames.some(compatibleDataSpecName =>
          name.endsWith(`${classify(compatibleDataSpecName)}Store`)
        )
      );
      const sortedPossibleStores = possibleStores.sortBy('name');
      const allowSystemAuditLogStores = compatibleDataSpecNames.includes('object');
      const allowTaskTimeSeriesStore =
        compatibleDataSpecNames.includes('timeSeriesMeasurement');

      it(`provides available stores for result of type "${dataSpecName}"`,
        async function (done) {
          setProperties(this.get('atmLambda.revisionRegistry.1'), {
            preferredBatchSize: 100,
            resultSpecs: [{
              name: 'res1',
              dataSpec,
            }],
          });

          await renderComponent();
          await click('.singleResultMappings-add-field-button');

          expect(targetStoreDropdown.getSelectedOptionText()).to.null;
          const targetStoreExpectedOptions = [
            'Create store...',
            ...(allowSystemAuditLogStores ? [
              taskAuditLogStore.name,
              workflowAuditLogStore.name,
            ] : []),
            ...(allowTaskTimeSeriesStore ? [taskTimeSeriesStore.name] : []),
            ...sortedPossibleStores.map(({ name }) => name),
          ];
          expect(await targetStoreDropdown.getOptionsText())
            .to.deep.equal(targetStoreExpectedOptions);
          done();
        });

      it(`allows to create new store for result of type "${dataSpecName}"`,
        async function (done) {
          this.set('newStoreFromCreation', Store.create({
            id: 'newstore',
            name: 'new store',
            config: sortedPossibleStores[0].config,
            type: sortedPossibleStores[0].type,
          }));
          setProperties(this.get('atmLambda.revisionRegistry.1'), {
            preferredBatchSize: 100,
            resultSpecs: [{
              name: 'res1',
              dataSpec,
            }],
          });

          await renderComponent();
          await click('.singleResultMappings-add-field-button');
          await targetStoreDropdown.selectOptionByText('Create store...');

          expect(find('.targetStore-field .dropdown-field-trigger').textContent.trim())
            .to.equal('new store');
          const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
          expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
          const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

          expect(lastCreateStoreCallArg.allowedStoreTypes)
            .to.be.undefined;
          expect(lastCreateStoreCallArg.allowedStoreWriteDataSpec)
            .to.deep.equal(dataSpec);
          done();
        });
    });

    it('allows to setup result to be unassigned',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Number').dataSpec,
        }]);

        await renderComponent();

        expect(this.get('changeSpy')).to.be.calledWith({
          data: {
            lambdaId: 'id1',
            lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
            name: 'function1',
            argumentMappings: [],
            resultMappings: [],
            timeSeriesStoreConfig: null,
          },
          isValid: true,
        });
        done();
      });

    it('allows to setup result to use task audit log', async function (done) {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Object').dataSpec,
      }]);

      await renderComponent();
      await click('.singleResultMappings-add-field-button');
      await targetStoreDropdown.selectOptionByText(taskAuditLogStore.name);

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
          name: 'function1',
          argumentMappings: [],
          resultMappings: [{
            resultName: 'res1',
            storeSchemaId: taskAuditLogStore.id,
            storeContentUpdateOptions: {
              type: 'auditLogStoreContentUpdateOptions',
              function: 'append',
            },
          }],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });
      done();
    });

    it('allows to setup result to use workflow audit log', async function (done) {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Object').dataSpec,
      }]);

      await renderComponent();
      await click('.singleResultMappings-add-field-button');
      await targetStoreDropdown.selectOptionByText(workflowAuditLogStore.name);

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
          name: 'function1',
          argumentMappings: [],
          resultMappings: [{
            resultName: 'res1',
            storeSchemaId: workflowAuditLogStore.id,
            storeContentUpdateOptions: {
              type: 'auditLogStoreContentUpdateOptions',
              function: 'append',
            },
          }],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });
      done();
    });

    allPossibleStoreSpecs
      .filterBy('allowedDataSpecNames.length')
      .forEach(({ type, allowedDataSpecNames, dispatchFunctions = [] }) => {
        const targetStore = allPossibleStores
          .findBy('name', `${type}${classify(allowedDataSpecNames[0])}Store`);

        if (dispatchFunctions.length) {
          itProvidesPossibleDispatchFunctionsForResultWithStoreAttached(
            type,
            targetStore,
            dispatchFunctions
          );

          dispatchFunctions.forEach(dispatchFunction => {
            itAllowsToSetupResultToUseStoreWithDispatchFunction(
              type,
              targetStore,
              dispatchFunction
            );
          });
        } else {
          itAllowsToSetupResultToUseStoreWithoutDispatchFunction(
            type,
            targetStore
          );
        }
      });

    [
      ['task audit log', taskAuditLogStore],
      ['workflow audit log', workflowAuditLogStore],
    ].forEach(([storeDesc, targetStore]) => {
      itProvidesPossibleDispatchFunctionsForResultWithStoreAttached(
        storeDesc,
        targetStore,
        ['append', 'extend']
      );
      itAllowsToSetupResultToUseStoreWithDispatchFunction(
        storeDesc,
        targetStore,
        'append'
      );
      itAllowsToSetupResultToUseStoreWithDispatchFunction(
        storeDesc,
        targetStore,
        'extend'
      );
    });

    it('changes available dispatch functions when result store type changes',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('name', 'number').dataSpec,
        }]);

        await renderComponent();
        await click('.singleResultMappings-add-field-button');
        await targetStoreDropdown.selectOptionByText('listNumberStore');
        await targetStoreDropdown.selectOptionByText('singleValueNumberStore');

        expect(find('.dispatchFunction-field')).to.not.exist;
        done();
      });

    it('renders "override resources" toggle, which is unchecked by default',
      async function (done) {
        await renderComponent();

        const overrideField = find('.overrideResources-field');
        expect(overrideField).to.have.class('toggle-field-renderer');
        expect(overrideField.querySelector('.control-label').textContent.trim())
          .to.equal('Override default resources:');
        expect(overrideField.querySelector('.one-way-toggle'))
          .to.not.have.class('checked');
        done();
      }
    );

    it('renders "resources" section with cpu, memory and storage fields groups',
      async function (done) {
        await renderComponent();

        const resourcesSection = find('.resources-field');
        expect(resourcesSection.querySelector('.control-label').textContent.trim())
          .to.equal('Resources');
        // Check if translations for resources fields are loaded
        expect(resourcesSection.textContent).to.contain('Limit');

        expect(find('.cpuRequested-field .form-control').value).to.equal('0.1');
        expect(find('.cpuLimit-field .form-control').value).to.equal('');
        [{
          resourceName: 'memory',
          requested: ['128', 'MiB'],
          limit: ['', 'MiB'],
        }, {
          resourceName: 'ephemeralStorage',
          requested: ['0', 'MiB'],
          limit: ['', 'MiB'],
        }].forEach(({ resourceName, requested, limit }) => {
          const requestedElem = find(`.${resourceName}Requested-field`);
          expect(requestedElem.querySelector('input').value).to.equal(requested[0]);
          expect(requestedElem.querySelector('.ember-power-select-trigger').textContent)
            .to.contain(requested[1]);
          const limitElem = find(`.${resourceName}Limit-field`);
          expect(limitElem.querySelector('input').value).to.equal(limit[0]);
          expect(limitElem.querySelector('.ember-power-select-trigger').textContent)
            .to.contain(limit[1]);
        });
        done();
      });

    it('renders "resources" section with full configuration',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.resourceSpec', {
          cpuRequested: 1,
          cpuLimit: 2,
          memoryRequested: 128 * 1024 * 1024,
          memoryLimit: 256 * 1024 * 1024,
          ephemeralStorageRequested: 10 * 1024 * 1024,
          ephemeralStorageLimit: 20 * 1024 * 1024,
        });

        await renderComponent();

        expect(find('.cpuRequested-field .form-control').value).to.equal('1');
        expect(find('.cpuLimit-field .form-control').value).to.equal('2');
        expect(find('.memoryRequested-field .form-control').value).to.equal('128');
        expect(find('.memoryLimit-field .form-control').value).to.equal('256');
        expect(find('.ephemeralStorageRequested-field .form-control').value)
          .to.equal('10');
        expect(find('.ephemeralStorageLimit-field .form-control').value).to.equal('20');
        done();
      });

    it('disables "resources" section when "override resources" toggle is unchecked',
      async function (done) {
        await renderComponent();

        await toggleOverrideResources(false);

        expect(find('.resourcesSections-field .field-enabled')).to.not.exist;
        done();
      }
    );

    it('enables "resources" section when "override resources" toggle is checked',
      async function (done) {
        await renderComponent();

        await toggleOverrideResources(true);

        expect(find('.resourcesSections-field .field-disabled')).to.not.exist;
        done();
      }
    );

    it('allows to setup resources override (minimal values provided)',
      async function (done) {
        const changeSpy = this.get('changeSpy');
        await renderComponent();

        await toggleOverrideResources(true);

        expect(changeSpy).to.be.calledWith(sinon.match({
          data: sinon.match({
            resourceSpecOverride: {
              cpuRequested: 0.1,
              cpuLimit: null,
              memoryRequested: 128 * 1024 * 1024,
              memoryLimit: null,
              ephemeralStorageRequested: 0,
              ephemeralStorageLimit: null,
            },
          }),
        }));
        done();
      }
    );

    it('allows to setup resources override (all values provided)', async function (done) {
      const changeSpy = this.get('changeSpy');
      await renderComponent();

      await toggleOverrideResources(true);
      await fillIn('.cpuRequested-field input', '2');
      await fillIn('.cpuLimit-field input', '10');
      await fillIn('.memoryRequested-field input', '100');
      await fillIn('.memoryLimit-field input', '200');
      await fillIn('.ephemeralStorageRequested-field input', '300');
      await fillIn('.ephemeralStorageLimit-field input', '400');

      expect(changeSpy).to.be.calledWith(sinon.match({
        data: sinon.match({
          resourceSpecOverride: {
            cpuRequested: 2,
            cpuLimit: 10,
            memoryRequested: 100 * 1024 * 1024,
            memoryLimit: 200 * 1024 * 1024,
            ephemeralStorageRequested: 300 * 1024 * 1024,
            ephemeralStorageLimit: 400 * 1024 * 1024,
          },
        }),
      }));
      done();
    });

    it('resets changes in "resources" section when it becomes disabled',
      async function (done) {
        const changeSpy = this.get('changeSpy');
        await renderComponent();

        await toggleOverrideResources(true);
        await fillIn('.cpuRequested-field input', '2');
        await fillIn('.cpuLimit-field input', '10');
        await fillIn('.memoryRequested-field input', '100');
        await fillIn('.memoryLimit-field input', '200');
        await fillIn('.ephemeralStorageRequested-field input', '100');
        await fillIn('.ephemeralStorageLimit-field input', '200');
        changeSpy.resetHistory();
        await toggleOverrideResources(false);

        expect(find('.cpuRequested-field input').value).to.equal('0.1');
        expect(find('.cpuLimit-field input').value).to.equal('');
        expect(find('.memoryRequested-field input').value).to.equal('128');
        expect(find('.memoryLimit-field input').value).to.equal('');
        expect(find('.ephemeralStorageRequested-field input').value).to.equal('0');
        expect(find('.ephemeralStorageLimit-field input').value).to.equal('');
        expect(changeSpy).to.be.calledWith(
          sinon.match((val) => !('resourceSpecOverride' in val))
        );
        done();
      }
    );
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        task: _.cloneDeep(exampleTask),
        changeSpy: sinon.spy(),
      });
    });

    itHasModeClass('edit');
    itHasEnabledFieldsByDefault();
    itAllowsToDisableAllFields();
    itShowsLambdaInfo();
    itFillsFieldsWithDataOfPassedTask();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithIteratedItemValueBuilder();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithConstantValueValueBuilder();
    itFillsFieldsWithDataAboutResultsWithAllStoreTypesAndDispatchMethods();
    itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned();
    itFillsFieldsWithDataAboutNoResourceOverride();
    itFillsFieldsWithDataAboutResourceOverride();

    it('does not update form values on passed task change', async function (done) {
      await renderComponent();

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await settled();

      expect(find('.name-field .form-control')).to.have.value(exampleTask.name);
      done();
    });

    it('migrates form values when user changes revision number', async function (done) {
      const revision1 = {
        name: 'f1',
        summary: 'f1sum',
        argumentSpecs: [{
          name: 'arg1',
          dataSpec: {
            type: 'number',
            valueConstraints: {},
          },
          isOptional: true,
        }, {
          name: 'arg2',
          dataSpec: {
            type: 'string',
            valueConstraints: {},
          },
          isOptional: true,
        }, {
          name: 'arg3',
          dataSpec: {
            type: 'number',
            valueConstraints: {},
          },
          isOptional: true,
        }],
        resultSpecs: [{
          name: 'res1',
          dataSpec: {
            type: 'string',
            valueConstraints: {},
          },
        }, {
          name: 'res2',
          dataSpec: {
            type: 'file',
            valueConstraints: {
              fileType: 'ANY',
            },
          },
        }, {
          name: 'res3',
          dataSpec: {
            type: 'string',
            valueConstraints: {},
          },
        }, {
          name: 'res4',
          dataSpec: {
            type: 'range',
            valueConstraints: {},
          },
        }],
        resourceSpec: {
          cpuRequested: 0.1,
          cpuLimit: null,
          memoryRequested: 128 * 1024 * 1024,
          memoryLimit: null,
          ephemeralStorageRequested: 0,
          ephemeralStorageLimit: null,
        },
      };
      const revision2 = _.cloneDeep(revision1);
      revision2.name = 'f2';
      revision2.summary = 'f2sum';
      revision2.argumentSpecs = [{
        name: 'arg2',
        dataSpec: {
          type: 'string',
          valueConstraints: {},
        },
        isOptional: true,
      }, {
        name: 'arg1',
        dataSpec: {
          type: 'number',
          valueConstraints: {},
        },
        isOptional: true,
      }, {
        name: 'arg3',
        dataSpec: {
          type: 'string',
          valueConstraints: {},
        },
        isOptional: true,
      }];
      revision2.resultSpecs = [{
        name: 'res2',
        dataSpec: {
          type: 'file',
          valueConstraints: {
            fileType: 'ANY',
          },
        },
      }, {
        name: 'res1',
        dataSpec: {
          type: 'string',
          valueConstraints: {},
        },
      }, {
        name: 'res3',
        dataSpec: {
          type: 'number',
          valueConstraints: {},
        },
      }, {
        name: 'res4new',
        dataSpec: {
          type: 'range',
          valueConstraints: {},
        },
      }];
      this.setProperties({
        atmLambda: {
          entityId: 'id1',
          revisionRegistry: {
            1: revision1,
            2: revision2,
          },
        },
        task: {
          id: 't1',
          name: 't1',
          argumentMappings: [{
            argumentName: 'arg1',
            valueBuilder: {
              valueBuilderType: 'iteratedItem',
            },
          }, {
            argumentName: 'arg2',
            valueBuilder: {
              valueBuilderType: 'const',
              valueBuilderRecipe: 'abc',
            },
          }, {
            argumentName: 'arg3',
            valueBuilder: {
              valueBuilderType: 'singleValueStoreContent',
              valueBuilderRecipe: 'singleValueNumberId',
            },
          }],
          resultMappings: [{
            resultName: 'res1',
            storeSchemaId: 'singleValueStringId',
            storeContentUpdateOptions: {
              type: 'singleValueStoreContentUpdateOptions',
            },
          }, {
            resultName: 'res2',
            storeSchemaId: 'treeForestFileId',
            storeContentUpdateOptions: {
              type: 'treeForestStoreContentUpdateOptions',
              function: 'append',
            },
          }, {
            resultName: 'res3',
            storeSchemaId: 'singleValueStringId',
            storeContentUpdateOptions: {
              type: 'singleValueStoreContentUpdateOptions',
            },
          }, {
            resultName: 'res4',
            storeSchemaId: 'singleValueRangeId',
            storeContentUpdateOptions: {
              type: 'singleValueStoreContentUpdateOptions',
            },
          }],
          timeSeriesStoreConfig: null,
        },
      });
      await renderComponent();

      await atmLambdaRevisionNumberDropdown.selectOptionByText('2');

      // Fixing missing values after revision change - it is not possible to guess
      // and convert everything.
      const missingValueBuilderStoreDropdown =
        find('.collection-item:nth-child(3) .valueBuilderStore-field');
      expect(missingValueBuilderStoreDropdown).to.have.class('has-error');
      await new OneDrodopdownHelper(missingValueBuilderStoreDropdown)
        .selectOptionByText('singleValueStringStore');
      await click(
        '.resultMappings-field .collection-item:nth-child(3) .remove-field-button'
      );

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: 2,
          name: 't1',
          argumentMappings: [{
            argumentName: 'arg2',
            valueBuilder: {
              valueBuilderType: 'const',
              valueBuilderRecipe: 'abc',
            },
          }, {
            argumentName: 'arg1',
            valueBuilder: {
              valueBuilderType: 'iteratedItem',
            },
          }, {
            argumentName: 'arg3',
            valueBuilder: {
              valueBuilderType: 'singleValueStoreContent',
              valueBuilderRecipe: 'singleValueStringId',
            },
          }],
          resultMappings: [{
            resultName: 'res2',
            storeSchemaId: 'treeForestFileId',
            storeContentUpdateOptions: {
              type: 'treeForestStoreContentUpdateOptions',
              function: 'append',
            },
          }, {
            resultName: 'res1',
            storeSchemaId: 'singleValueStringId',
            storeContentUpdateOptions: {
              type: 'singleValueStoreContentUpdateOptions',
            },
          }, {
            resultName: 'res4new',
            storeSchemaId: 'singleValueRangeId',
            storeContentUpdateOptions: {
              type: 'singleValueStoreContentUpdateOptions',
            },
          }],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });

      done();
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'view',
        task: _.cloneDeep(exampleTask),
      });
    });

    itHasModeClass('view');
    itShowsLambdaInfo();
    itFillsFieldsWithDataOfPassedTask();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithIteratedItemValueBuilder();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithConstantValueValueBuilder();
    itFillsFieldsWithDataAboutResultsWithAllStoreTypesAndDispatchMethods();
    itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned();
    itFillsFieldsWithDataAboutNoResourceOverride();
    itFillsFieldsWithDataAboutResourceOverride();

    it('updates form values on passed task change', async function (done) {
      await renderComponent();

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await settled();

      expect(find('.name-field .field-component')).to.have.trimmed.text('task2');
      done();
    });
  });
});

async function renderComponent() {
  await render(hbs `{{workflow-visualiser/task-form
    mode=mode
    task=task
    atmLambda=atmLambda
    atmLambdaRevisionNumber=atmLambdaRevisionNumber
    definedStores=definedStores
    isDisabled=isDisabled
    actionsFactory=actionsFactory
    onChange=changeSpy
  }}`);
}

async function toggleOverrideResources(value) {
  const overrideToggle = find('.overrideResources-field .one-way-toggle');
  if (value !== overrideToggle.matches('.checked')) {
    await click(overrideToggle);
  }
}

function getComponent() {
  return find(`.${componentClass}`);
}

function itHasModeClass(mode) {
  const modeClass = `mode-${mode}`;
  it(`has class "${modeClass}"`, async function (done) {
    await renderComponent();

    expect(getComponent()).to.have.class(modeClass);
    done();
  });
}

function itHasEnabledFieldsByDefault() {
  it('has all fields enabled by default', async function (done) {
    await renderComponent();

    expect(getComponent()).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(find('.field-enabled')).to.exist;
    done();
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function (done) {
    this.set('isDisabled', true);

    await renderComponent();

    expect(getComponent()).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(find('.field-enabled')).to.not.exist;
    done();
  });
}

function itShowsLambdaInfo() {
  it('shows brief information about used lambda', async function (done) {
    await renderComponent();

    expect(find('.atmLambdaName-field .field-component'))
      .to.have.trimmed.text(exampleAtmLambdaRevision.name);
    expect(find('.atmLambdaRevisionNumber-field .field-component'))
      .to.have.trimmed.text('1');
    expect(find('.atmLambdaSummary-field .field-component'))
      .to.have.trimmed.text(exampleAtmLambdaRevision.summary);
    done();
  });
}

function itProvidesPossibleDispatchFunctionsForResultWithStoreAttached(
  storeDescription,
  targetStore,
  dispatchFunctions
) {
  it(`provides possible dispatch functions for result with store "${storeDescription}" attached`,
    async function (done) {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: getStoreDataSpec(targetStore),
      }]);

      await renderComponent();
      await click('.singleResultMappings-add-field-button');
      await targetStoreDropdown.selectOptionByText(targetStore.name);

      expect(dispatchFunctionDropdown.getSelectedOptionText())
        .to.equal(dispatchFunctionLabels[dispatchFunctions[0]]);
      expect(await dispatchFunctionDropdown.getOptionsText()).to.deep.equal(
        dispatchFunctions.map((func) => dispatchFunctionLabels[func])
      );
      done();
    });
}

function itAllowsToSetupResultToUseStoreWithDispatchFunction(
  storeDescription,
  targetStore,
  dispatchFunction,
) {
  it(`allows to setup result to use "${storeDescription}" store with "${dispatchFunction}" dispatch function`,
    async function (done) {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: getStoreDataSpec(targetStore),
      }]);

      await renderComponent();
      await click('.singleResultMappings-add-field-button');
      await targetStoreDropdown.selectOptionByText(targetStore.name);
      await dispatchFunctionDropdown.selectOptionByText(
        dispatchFunctionLabels[dispatchFunction]
      );

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
          name: 'function1',
          argumentMappings: [],
          resultMappings: [{
            resultName: 'res1',
            storeSchemaId: targetStore.id,
            storeContentUpdateOptions: {
              type: `${targetStore.type}StoreContentUpdateOptions`,
              function: dispatchFunction,
            },
          }],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });
      done();
    });
}

function itAllowsToSetupResultToUseStoreWithoutDispatchFunction(
  storeDescription,
  targetStore,
) {
  it(`allows to setup result to use "${storeDescription}" store`,
    async function (done) {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: getStoreDataSpec(targetStore),
      }]);

      await renderComponent();
      await click('.singleResultMappings-add-field-button');
      await targetStoreDropdown.selectOptionByText(targetStore.name);

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
          lambdaId: 'id1',
          lambdaRevisionNumber: this.get('atmLambdaRevisionNumber'),
          name: 'function1',
          argumentMappings: [],
          resultMappings: [{
            resultName: 'res1',
            storeSchemaId: targetStore.id,
            storeContentUpdateOptions: sinon.match({
              type: `${targetStore.type}StoreContentUpdateOptions`,
            }),
          }],
          timeSeriesStoreConfig: null,
        },
        isValid: true,
      });
      done();
    });
}

function itFillsFieldsWithDataOfPassedTask() {
  it('fills fields with data of passed task', async function (done) {
    const inEditMode = this.get('mode') !== 'view';
    await renderComponent();

    if (inEditMode) {
      expect(find('.name-field .form-control')).to.have.value(exampleTask.name);
    } else {
      expect(find('.name-field .field-component')).to.have.trimmed.text(exampleTask.name);
    }
    const args = findAll('.argumentMapping-field');
    expect(args).to.have.length(exampleAtmLambdaRevision.argumentSpecs.length);
    exampleAtmLambdaRevision.argumentSpecs.forEach(({ name }, idx) => {
      expect(args[idx].querySelector('.control-label').textContent.trim())
        .to.equal(`${name}:`);
    });
    const argumentValueBuilderTypes = args.map((node) =>
      node.querySelector('.valueBuilderType-field')
    );
    [
      'Iterated item',
      'Leave unassigned',
    ].forEach((builderLabel, idx) => {
      const argumentValueBuilderType = argumentValueBuilderTypes[idx];
      if (inEditMode) {
        expect(new OneDrodopdownHelper(argumentValueBuilderType).getSelectedOptionText())
          .to.equal(builderLabel);
      } else {
        expect(argumentValueBuilderType.querySelector('.field-component'))
          .to.have.trimmed.text(builderLabel);
      }
    });
    const results = findAll('.singleResultMappings-field');
    expect(results).to.have.length(exampleAtmLambdaRevision.resultSpecs.length);
    exampleAtmLambdaRevision.resultSpecs.forEach(({ name }, idx) => {
      expect(results[idx].querySelector('.control-label').textContent.trim())
        .to.equal(`${name}:`);
    });
    expect(find(`.field-${inEditMode ? 'view' : 'edit'}-mode`)).to.not.exist;
    done();
  });
}

function itFillsFieldsWithDataAboutNoResourceOverride() {
  it('fills fields with data about no resources override',
    async function (done) {
      const inEditMode = this.get('mode') !== 'view';
      delete this.get('task').resourceSpecOverride;

      await renderComponent();

      expect(find('.overrideResources-field .one-way-toggle'))
        .to.not.have.class('checked');
      if (inEditMode) {
        expect(find('.resourcesSections-field')).to.exist;
        expect(find('.cpuRequested-field input').value).to.equal('0.1');
        expect(find('.cpuLimit-field input').value).to.equal('');
        expect(find('.memoryRequested-field input').value).to.equal('128');
        expect(find('.memoryLimit-field input').value).to.equal('');
        expect(find('.ephemeralStorageRequested-field input').value).to.equal('0');
        expect(find('.ephemeralStorageLimit-field input').value).to.equal('');
      } else {
        expect(find('.resourcesSections-field')).to.not.exist;
      }
      done();
    });
}

function itFillsFieldsWithDataAboutResourceOverride() {
  it('fills fields with data about resources override',
    async function (done) {
      const inEditMode = this.get('mode') !== 'view';
      this.set('task.resourceSpecOverride', {
        cpuRequested: 2,
        cpuLimit: 10,
        memoryRequested: 100 * 1024 * 1024,
        memoryLimit: 200 * 1024 * 1024,
        ephemeralStorageRequested: 300 * 1024 * 1024,
        ephemeralStorageLimit: 400 * 1024 * 1024,
      });

      await renderComponent();

      expect(find('.overrideResources-field .one-way-toggle'))
        .to.have.class('checked');
      expect(find('.resourcesSections-field')).to.exist;
      if (inEditMode) {
        expect(find('.cpuRequested-field input').value).to.equal('2');
        expect(find('.cpuLimit-field input').value).to.equal('10');
        expect(find('.memoryRequested-field input').value).to.equal('100');
        expect(find('.memoryLimit-field input').value).to.equal('200');
        expect(find('.ephemeralStorageRequested-field input').value).to.equal('300');
        expect(find('.ephemeralStorageLimit-field input').value).to.equal('400');
      } else {
        expect(find('.cpuRequested-field .field-component').textContent.trim())
          .to.equal('2');
        expect(find('.cpuLimit-field .field-component').textContent.trim())
          .to.equal('10');
        expect(find('.memoryRequested-field .field-component').textContent.trim())
          .to.equal('100 MiB');
        expect(find('.memoryLimit-field .field-component').textContent.trim())
          .to.equal('200 MiB');
        expect(
          find('.ephemeralStorageRequested-field .field-component').textContent.trim()
        ).to.equal('300 MiB');
        expect(
          find('.ephemeralStorageLimit-field .field-component').textContent.trim()
        ).to.equal('400 MiB');
      }
      done();
    });
}

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithIteratedItemValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "Iterated item" value builder',
    async function (done) {
      const inEditMode = this.get('mode') !== 'view';
      const possibleDataSpecs = dataSpecs
        .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('iteratedItem'))
        .mapBy('dataSpec');
      this.set(
        'atmLambda.revisionRegistry.1.argumentSpecs',
        possibleDataSpecs.map((dataSpec, idx) => ({
          name: `arg${idx}`,
          dataSpec,
          isOptional: false,
        }))
      );
      this.set('task.argumentMappings', possibleDataSpecs.map((dataSpec, idx) => ({
        argumentName: `arg${idx}`,
        valueBuilder: {
          valueBuilderType: 'iteratedItem',
        },
      })));

      await renderComponent();

      const args = findAll('.argumentMapping-field');
      expect(args).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach((dataSpec, idx) => {
        expect(args[idx].querySelector('.control-label').textContent.trim())
          .to.equal(`arg${idx}:`);
        if (inEditMode) {
          expect(
            new OneDrodopdownHelper(args[idx].querySelector('.valueBuilderType-field'))
            .getSelectedOptionText()
          ).to.equal('Iterated item');
        } else {
          expect(args[idx].querySelector('.valueBuilderType-field .field-component'))
            .to.have.trimmed.text('Iterated item');
        }
      });
      done();
    });
}

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithConstantValueValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "Constant value" value builder',
    async function (done) {
      const inEditMode = this.get('mode') !== 'view';
      const possibleDataSpecs = dataSpecs
        .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('const'));
      this.set(
        'atmLambda.revisionRegistry.1.argumentSpecs',
        possibleDataSpecs.map(({ dataSpec }, idx) => ({
          name: `arg${idx}`,
          dataSpec,
          isOptional: false,
        }))
      );
      this.set(
        'task.argumentMappings',
        possibleDataSpecs.map(({ exampleConstValue }, idx) => ({
          argumentName: `arg${idx}`,
          valueBuilder: {
            valueBuilderType: 'const',
            valueBuilderRecipe: exampleConstValue,
          },
        }))
      );

      await renderComponent();

      const args = findAll('.argumentMapping-field');
      expect(args).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach(({ checkExampleConstValue }, idx) => {
        expect(args[idx].querySelector('.control-label').textContent.trim())
          .to.equal(`arg${idx}:`);
        if (inEditMode) {
          expect(
            new OneDrodopdownHelper(args[idx].querySelector('.valueBuilderType-field'))
            .getSelectedOptionText()
          ).to.equal('Constant value');
        } else {
          expect(args[idx].querySelector('.valueBuilderType-field .field-component'))
            .to.have.trimmed.text('Constant value');
        }
        checkExampleConstValue(
          `.argumentMappings-field .collection-item:nth-child(${idx + 1}) .valueBuilderConstValue-field`
        );
      });
      done();
    });
}

function itFillsFieldsWithDataAboutResultsWithAllStoreTypesAndDispatchMethods() {
  allPossibleStoreSpecs
    .filterBy('allowedDataSpecNames.length')
    .map(({ type, allowedDataSpecNames, dispatchFunctions }) => ({
      storeDesc: type,
      targetStore: allPossibleStores
        .findBy('name', `${type}${classify(allowedDataSpecNames[0])}Store`),
      dispatchFunctions,
    }))
    .concat([{
      storeDesc: 'task audit log',
      targetStore: taskAuditLogStore,
      dispatchFunctions: ['append'],
    }, {
      storeDesc: 'workflow audit log',
      targetStore: workflowAuditLogStore,
      dispatchFunctions: ['append'],
    }])
    .forEach(({ storeDesc, targetStore, dispatchFunctions = [undefined] }) => {
      it(`fills fields with data about results that uses "${storeDesc}" stores and all possible dispatch methods`,
        async function (done) {
          const inEditMode = this.get('mode') !== 'view';
          this.set(
            'atmLambda.revisionRegistry.1.resultSpecs',
            dispatchFunctions.map((dispatchFunction, idx) => ({
              name: `res${idx}`,
              dataSpec: getStoreDataSpec(targetStore),
              isOptional: false,
            }))
          );
          this.set(
            'task.resultMappings',
            dispatchFunctions.map((dispatchFunction, idx) => ({
              resultName: `res${idx}`,
              storeSchemaId: targetStore.id,
              storeContentUpdateOptions: {
                type: `${targetStore.type}StoreContentUpdateOptions`,
                function: dispatchFunction,
              },
            }))
          );

          await renderComponent();

          const results = findAll('.singleResultMappings-field');
          expect(results).to.have.length(dispatchFunctions.length);
          dispatchFunctions.forEach((dispatchFunction, idx) => {
            expect(results[idx].querySelector('.control-label').textContent.trim())
              .to.equal(`res${idx}:`);
            const dispatchFunctionField = results[idx]
              .querySelector('.dispatchFunction-field');
            if (inEditMode) {
              expect(
                new OneDrodopdownHelper(results[idx].querySelector('.targetStore-field'))
                .getSelectedOptionText()
              ).to.equal(targetStore.name);
            } else {
              expect(results[idx].querySelector('.targetStore-field .field-component'))
                .to.have.trimmed.text(targetStore.name);
            }
            if (dispatchFunction) {
              if (inEditMode) {
                expect(
                  new OneDrodopdownHelper(dispatchFunctionField).getSelectedOptionText()
                ).to.equal(dispatchFunctionLabels[dispatchFunction]);
              } else {
                expect(dispatchFunctionField.querySelector('.field-component'))
                  .to.have.trimmed.text(dispatchFunctionLabels[dispatchFunction]);
              }
            } else {
              expect(dispatchFunctionField).to.not.exist;
            }
          });
          done();
        });
    });
}

function itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned() {
  it('fills fields with data about results that are left unassigned',
    async function (done) {
      const inEditMode = this.get('mode') !== 'view';
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Number').dataSpec,
        isOptional: false,
      }]);
      this.set('task.resultMappings', []);

      await renderComponent();

      const results = findAll('.singleResultMappings-field');
      if (inEditMode) {
        expect(results).to.have.length(1);
        expect(results[0].querySelector('.targetStore-field')).to.not.exist;
      } else {
        expect(results[0].querySelector('.field-component').textContent.trim())
          .to.equal('Not assigned.');
      }
      expect(results[0].querySelector('.control-label').textContent.trim())
        .to.equal('res1:');
      done();
    });
}

function getStoreDataSpec(store) {
  const targetStoreSpec = allPossibleStoreSpecs.findBy('type', store.type);
  if (targetStoreSpec.dataSpecConfigKey) {
    return store.config[targetStoreSpec.dataSpecConfigKey];
  } else {
    const dataSpecName = targetStoreSpec.allowedDataSpecNames[0];
    return dataSpecs.findBy('name', dataSpecName).dataSpec;
  }
}
