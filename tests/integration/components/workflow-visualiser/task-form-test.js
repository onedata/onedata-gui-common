import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import _ from 'lodash';
import { classify } from '@ember/string';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { setProperties } from '@ember/object';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import { render, settled, fillIn, click, find, findAll } from '@ember/test-helpers';

const componentClass = 'task-form';

const dataSpecs = [{
  label: 'Integer',
  name: 'integer',
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
}, {
  label: 'String',
  name: 'string',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
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
    'onedatafsCredentials',
  ],
  canContain: [
    'anyFile',
    'regularFile',
    'directory',
    'symlink',
    'dataset',
    'range',
  ],
  // TODO: VFS-7816 uncomment or remove future code
  // valueBuilderTypes: ['iteratedItem', 'const', 'storeCredentials', 'onedatafsCredentials'],
  // canContain: ['Any file', 'Regular file', 'Directory', 'Symbolic link', 'Dataset', 'Archive'],
}, {
  // TODO: VFS-7816 uncomment or remove future code
  //   label: 'Histogram',
  //   name: 'histogram',
  //   dataSpec: {
  //     type: 'histogram',
  //     valueConstraints: {},
  //   },
  //   valueBuilderTypes: ['iteratedItem', 'const'],
  // }, {
  label: 'Any file',
  name: 'anyFile',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'ANY',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  canContain: ['regularFile', 'directory', 'symlink'],
}, {
  label: 'Regular file',
  name: 'regularFile',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'REG',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
}, {
  label: 'Directory',
  name: 'directory',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'DIR',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
}, {
  label: 'Symbolic link',
  name: 'symlink',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'SYMLNK',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
}, {
  label: 'Dataset',
  name: 'dataset',
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Archive',
  //   name: 'archive',
  //   dataSpec: {
  //     type: 'archive',
  //     valueConstraints: {},
  //   },
  //   valueBuilderTypes: ['iteratedItem', 'const'],
  // }, {
  //   label: 'Single value store cred.',
  //   name: 'singleValueStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'singleValue',
  //     },
  //   },
  //   preferredNestedType: 'Object',
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'List store cred.',
  //   name: 'listStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'list',
  //     },
  //   },
  //   preferredNestedType: 'Object',
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'Map store cred.',
  //   name: 'mapStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'map',
  //     },
  //   },
  //   preferredNestedType: 'Object',
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'Tree forest store cred.',
  //   name: 'treeForestStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'treeForest',
  //     },
  //   },
  //   preferredNestedType: 'Any file',
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'Range store cred.',
  //   name: 'rangeStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'range',
  //     },
  //   },
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'Histogram store cred.',
  //   name: 'histogramStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'histogram',
  //     },
  //   },
  //   preferredNestedType: 'Histogram',
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'Audit log store cred.',
  //   name: 'auditLogStore',
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'auditLog',
  //     },
  //   },
  //   preferredNestedType: 'Object',
  //   valueBuilderTypes: ['storeCredentials'],
}, {
  label: 'OnedataFS credentials',
  dataSpec: {
    type: 'onedatafsCredentials',
    valueConstraints: {},
  },
  valueBuilderTypes: ['onedatafsCredentials'],
}, {
  label: 'Range',
  name: 'range',
  dataSpec: {
    type: 'range',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'singleValueStoreContent', 'const'],
}];

const valueBuilderTypeLabels = {
  iteratedItem: 'Iterated item',
  singleValueStoreContent: 'Store content',
  const: 'Constant value',
  // storeCredentials: 'Store credentials',
  onedatafsCredentials: 'OnedataFS credentials',
};

const allSimpleDataSpecNames = [
  'integer',
  'string',
  'object',
  // TODO: VFS-7816 uncomment or remove future code
  // 'histogram',
  'anyFile',
  'regularFile',
  'directory',
  'symlink',
  'dataset',
  // TODO: VFS-7816 uncomment or remove future code
  // 'archive',
  'range',
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
  // TODO: VFS-7816 uncomment or remove future code
  // dispatchFunctions: ['append', 'prepend'],
  // }, {
  //   type: 'map',
  //   allowedDataSpecNames: allSimpleDataSpecNames,
  //   acceptsBatch: true,
  //   dispatchFunctions: ['add', 'remove'],
}, {
  type: 'treeForest',
  allowedDataSpecNames: [
    'anyFile',
    'regularFile',
    'directory',
    'symlink',
    'dataset',
    // TODO: VFS-7816 uncomment or remove future code
    // 'archive',
  ],
  dataSpecConfigKey: 'itemDataSpec',
  acceptsBatch: true,
  dispatchFunctions: ['append', 'extend'],
}, {
  type: 'range',
  allowedDataSpecNames: ['range'],
  acceptsBatch: false,
  dispatchFunctions: [],
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   type: 'histogram',
  //   allowedDataSpecNames: ['histogram'],
  //   acceptsBatch: true,
  //   dispatchFunctions: ['add'],
}, {
  type: 'auditLog',
  allowedDataSpecNames: allSimpleDataSpecNames,
  dataSpecConfigKey: 'logContentDataSpec',
  acceptsBatch: true,
  dispatchFunctions: ['append', 'extend'],
}];
const allPossibleStores = [];
allPossibleStoreSpecs.rejectBy('type', 'range').forEach(({
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

const dispatchFunctionLabels = {
  // TODO: VFS-7816 uncomment or remove future code
  // add: 'Add',
  // remove: 'Remove',
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
      type: 'integer',
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
  }, {
    // TODO: VFS-7816 uncomment or remove future code
    //   name: 'argstore',
    //   dataSpec: {
    //     type: 'storeCredentials',
    //     valueConstraints: {
    //       storeType: 'singleValue',
    //     },
    //   },
    //   isOptional: true,
    // }, {
    name: 'argodfs',
    dataSpec: {
      type: 'onedatafsCredentials',
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
    name: 'resanyfile',
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
  }, {
    // TODO: VFS-7816 uncomment or remove future code
    //   argumentName: 'argstore',
    //   valueBuilder: {
    //     valueBuilderType: 'storeCredentials',
    //     valueBuilderRecipe: 'singleValueObjectId',
    //   },
    // }, {
    argumentName: 'argodfs',
    valueBuilder: {
      valueBuilderType: 'onedatafsCredentials',
    },
  }],
  resultMappings: [{
    resultName: 'resstring',
    storeSchemaId: 'singleValueStringId',
    storeContentUpdateOptions: {
      type: 'singleValueStoreContentUpdateOptions',
    },
  }, {
    resultName: 'resanyfile',
    storeSchemaId: 'treeForestAnyFileId',
    storeContentUpdateOptions: {
      type: 'treeForestStoreContentUpdateOptions',
      function: 'append',
    },
  }],
};

describe('Integration | Component | workflow visualiser/task form', function () {
  setupRenderingTest();

  beforeEach(function () {
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

      expect(find('.name-field .form-control').value)
        .to.equal(exampleAtmLambdaRevision.name);
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
          name: exampleAtmLambdaRevision.name,
          argumentMappings: [],
          resultMappings: [],
        },
        isValid: true,
      });
      changeSpy.reset();

      await fillIn('.name-field .form-control', 'someName');
      expect(find('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          argumentMappings: [],
          resultMappings: [],
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

    dataSpecs.forEach(({ name, label, dataSpec, valueBuilderTypes, canContain }) => {
      it(`provides available value builder types for argument of type "${label}"`,
        async function (done) {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: false,
          }]);

          await renderComponent();
          await clickTrigger('.argumentMapping-field .valueBuilderType-field');

          expect(
            find('.valueBuilderType-field .dropdown-field-trigger').textContent.trim()
          ).to.equal(valueBuilderTypeLabels[valueBuilderTypes[0]]);
          const options = document.querySelectorAll('.ember-power-select-option');
          expect(options).to.have.length(valueBuilderTypes.length);
          valueBuilderTypes.forEach((type, idx) =>
            expect(options[idx].textContent.trim())
            .to.equal(valueBuilderTypeLabels[type])
          );
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
          await clickTrigger('.argumentMapping-field .valueBuilderType-field');

          expect(
            find('.valueBuilderType-field .dropdown-field-trigger').textContent.trim()
          ).to.equal('Leave unassigned');
          const options = document.querySelectorAll('.ember-power-select-option');
          expect(options).to.have.length(valueBuilderTypes.length + 1);
          expect(options[0].textContent.trim()).to.equal('Leave unassigned');
          valueBuilderTypes.forEach((type, idx) =>
            expect(options[idx + 1].textContent.trim())
            .to.equal(valueBuilderTypeLabels[type])
          );
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
          await selectChoose(
            '.argumentMapping-field .valueBuilderType-field',
            'Leave unassigned'
          );

          expect(this.get('changeSpy')).to.be.calledWith({
            data: {
              name: 'function1',
              argumentMappings: [],
              resultMappings: [],
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
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'Iterated item'
            );

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'iteratedItem',
                  },
                }],
                resultMappings: [],
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
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'Store content'
            );
            await clickTrigger('.argumentMapping-field .valueBuilderStore-field');

            const options = document.querySelectorAll('.ember-power-select-option');
            expect(options).to.have.length(sortedPossibleStores.length + 1);
            expect(options[0].textContent.trim()).to.equal('Create store...');
            sortedPossibleStores.forEach(({ name }, idx) =>
              expect(options[idx + 1].textContent.trim()).to.equal(name)
            );

            const storeToSelect = sortedPossibleStores[sortedPossibleStores.length - 1];
            await selectChoose(
              '.argumentMapping-field .valueBuilderStore-field',
              storeToSelect.name
            );

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'singleValueStoreContent',
                    valueBuilderRecipe: storeToSelect.id,
                  },
                }],
                resultMappings: [],
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
            const allowedDataTypes = dataSpecs.mapBy('name').filter(specName =>
              name === specName || (canContain || []).includes(specName)
            );

            await renderComponent();
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'Store content'
            );
            await selectChoose(
              '.argumentMapping-field .valueBuilderStore-field',
              'Create store...'
            );

            expect(
              find('.valueBuilderStore-field .dropdown-field-trigger').textContent.trim()
            ).to.equal('new store');
            const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
            expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
            const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

            expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
              .to.deep.equal(allowedStoreTypes.sort());
            expect(lastCreateStoreCallArg.allowedDataTypes.sort())
              .to.deep.equal(allowedDataTypes.sort());
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
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'Constant value'
            );
            await fillIn('.valueBuilderConstValue-field .form-control', '123');

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'const',
                    valueBuilderRecipe: 123,
                  },
                }],
                resultMappings: [],
              },
              isValid: true,
            });
            done();
          });
      }

      // TODO: VFS-7816 uncomment or remove future code
      // if (valueBuilderTypes.includes('storeCredentials')) {
      //   it(`allows to setup argument of type "${label}" using "Store credentials" value builder`,
      //     async function (done) {
      //       this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
      //         name: 'arg1',
      //         dataSpec,
      //         isOptional: false,
      //       }]);

      //       const possibleStoreType = dataSpec.valueConstraints.storeType;
      //       const possibleStores = possibleStoreType ?
      //         allPossibleStores.filterBy('type', possibleStoreType) :
      //         allPossibleStores;
      //       const sortedPossibleStores = possibleStores.sortBy('name');

      //       await renderComponent();
      //       await selectChoose(
      //         '.argumentMapping-field .valueBuilderType-field',
      //         'Store credentials'
      //       );
      //       await clickTrigger('.argumentMapping-field .valueBuilderStore-field');

      //       const $options = $('.ember-power-select-option');
      //       expect($options).to.have.length(sortedPossibleStores.length);
      //       sortedPossibleStores.forEach(({ name }, idx) =>
      //         expect($options[idx].textContent.trim()).to.equal(name)
      //       );

      //       const storeToSelect = sortedPossibleStores[sortedPossibleStores.length - 1];
      //       await selectChoose(
      //         '.argumentMapping-field .valueBuilderStore-field',
      //         storeToSelect.name
      //       );

      //       expect(this.get('changeSpy')).to.be.calledWith({
      //         data: {
      //           name: 'function1',
      //           argumentMappings: [{
      //             argumentName: 'arg1',
      //             valueBuilder: {
      //               valueBuilderType: 'storeCredentials',
      //               valueBuilderRecipe: storeToSelect.id,
      //             },
      //           }],
      //           resultMappings: [],
      //         },
      //         isValid: true,
      //       });
      //       done();
      //     });
      // }

      if (valueBuilderTypes.includes('onedatafsCredentials')) {
        it(`allows to setup argment of type "${label}" using "OnedataFS credentials" value builder`,
          async function (done) {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            await renderComponent();
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'OnedataFS credentials'
            );

            expect(this.get('changeSpy')).to.be.calledWith({
              data: {
                name: 'function1',
                argumentMappings: [{
                  argumentName: 'arg1',
                  valueBuilder: {
                    valueBuilderType: 'onedatafsCredentials',
                  },
                }],
                resultMappings: [],
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
      const results = resultMappings.querySelectorAll('.resultMapping-field');
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
      const sortedPossibleStoresWithBatch = sortedPossibleStores.filter(({ type }) =>
        allPossibleStoreSpecs.findBy('type', type).acceptsBatch
      );
      const allowSystemAuditLogStores = compatibleDataSpecNames.includes('object');

      it(`provides available stores for result of type "${dataSpecName}"`,
        async function (done) {
          this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
            name: 'res1',
            dataSpec,
          }]);

          await renderComponent();
          await clickTrigger('.resultMapping-field .targetStore-field');

          expect(find('.targetStore-field .dropdown-field-trigger').textContent.trim())
            .to.equal('Leave unassigned');
          const options = document.querySelectorAll('.ember-power-select-option');
          const extraOptionsCount = 2 + (allowSystemAuditLogStores ? 2 : 0);
          expect(options)
            .to.have.length(sortedPossibleStores.length + extraOptionsCount);
          expect(options[0].textContent.trim()).to.equal('Create store...');
          expect(options[1].textContent.trim()).to.equal('Leave unassigned');
          if (allowSystemAuditLogStores) {
            expect(options[2].textContent.trim()).to.equal(taskAuditLogStore.name);
            expect(options[3].textContent.trim()).to.equal(workflowAuditLogStore.name);
          }
          sortedPossibleStores.forEach((store, idx) =>
            expect(options[idx + extraOptionsCount].textContent.trim())
            .to.equal(store.name)
          );
          done();
        });

      it(`provides available stores for result of batched type "${dataSpecName}"`,
        async function (done) {
          setProperties(this.get('atmLambda.revisionRegistry.1'), {
            preferredBatchSize: 100,
            resultSpecs: [{
              name: 'res1',
              dataSpec,
            }],
          });

          await renderComponent();
          await clickTrigger('.resultMapping-field .targetStore-field');

          expect(find('.targetStore-field .dropdown-field-trigger').textContent.trim())
            .to.equal('Leave unassigned');
          const options = document.querySelectorAll('.ember-power-select-option');
          const extraOptionsCount = 2 + (allowSystemAuditLogStores ? 2 : 0);
          expect(options)
            .to.have.length(sortedPossibleStoresWithBatch.length + extraOptionsCount);
          expect(options[0].textContent.trim()).to.equal('Create store...');
          expect(options[1].textContent.trim()).to.equal('Leave unassigned');
          if (allowSystemAuditLogStores) {
            expect(options[2].textContent.trim()).to.equal(taskAuditLogStore.name);
            expect(options[3].textContent.trim()).to.equal(workflowAuditLogStore.name);
          }
          sortedPossibleStoresWithBatch.forEach((store, idx) =>
            expect(options[idx + extraOptionsCount].textContent.trim())
            .to.equal(store.name)
          );
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
          this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
            name: 'res1',
            dataSpec,
          }]);
          const allowedStoreTypes = sortedPossibleStores.mapBy('type').uniq();
          const allowedDataTypes = [...compatibleDataSpecNames];

          await renderComponent();
          await selectChoose('.resultMapping-field .targetStore-field', 'Create store...');

          expect(find('.targetStore-field .dropdown-field-trigger').textContent.trim())
            .to.equal('new store');
          const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
          expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
          const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

          expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
            .to.deep.equal(allowedStoreTypes.sort());
          expect(lastCreateStoreCallArg.allowedDataTypes.sort())
            .to.deep.equal(allowedDataTypes.sort());
          done();
        });

      it(`allows to create new store for result of batched type "${dataSpecName}"`,
        async function (done) {
          this.set('newStoreFromCreation', Store.create({
            id: 'newstore',
            name: 'new store',
            config: sortedPossibleStoresWithBatch[0].config,
            type: sortedPossibleStoresWithBatch[0].type,
          }));
          setProperties(this.get('atmLambda.revisionRegistry.1'), {
            preferredBatchSize: 100,
            resultSpecs: [{
              name: 'res1',
              dataSpec,
            }],
          });
          const allowedStoreTypes = sortedPossibleStoresWithBatch.mapBy('type').uniq();
          const allowedDataTypes = [...compatibleDataSpecNames];

          await renderComponent();
          await selectChoose('.resultMapping-field .targetStore-field', 'Create store...');

          expect(find('.targetStore-field .dropdown-field-trigger').textContent.trim())
            .to.equal('new store');
          const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
          expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
          const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

          expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
            .to.deep.equal(allowedStoreTypes.sort());
          expect(lastCreateStoreCallArg.allowedDataTypes.sort())
            .to.deep.equal(allowedDataTypes.sort());
          done();
        });
    });

    it('allows to setup result to be unassigned',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        }]);

        await renderComponent();
        await selectChoose(
          '.resultMapping-field .targetStore-field',
          'Leave unassigned'
        );

        expect(this.get('changeSpy')).to.be.calledWith({
          data: {
            name: 'function1',
            argumentMappings: [],
            resultMappings: [],
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
      await selectChoose(
        '.resultMapping-field .targetStore-field',
        taskAuditLogStore.name
      );

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
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
      await selectChoose(
        '.resultMapping-field .targetStore-field',
        workflowAuditLogStore.name
      );

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
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
        },
        isValid: true,
      });
      done();
    });

    it('does not allow to choose dispatch function when result store is left unassigned',
      async function (done) {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        }]);

        await renderComponent();

        expect(find('.dispatchFunction-field')).to.not.exist;
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
          dataSpec: dataSpecs.findBy('name', 'integer').dataSpec,
        }]);

        await renderComponent();
        await selectChoose('.resultMapping-field .targetStore-field', 'listIntegerStore');
        await selectChoose('.resultMapping-field .targetStore-field', 'singleValueIntegerStore');

        expect(find('.dispatchFunction-field')).to.not.exist;
        done();
      });

    it('renders "override resources" toggle, which is unchecked by default', async function (done) {
      await renderComponent();

      const overrideField = find('.overrideResources-field');
      expect(overrideField).to.have.class('toggle-field-renderer');
      expect(overrideField.querySelector('.control-label').textContent.trim())
        .to.equal('Override default resources:');
      expect(overrideField.querySelector('.one-way-toggle'))
        .to.not.have.class('checked');
      done();
    });

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

    it('disables "resources" section when "override resources" toggle is unchecked', async function (done) {
      await renderComponent();

      await toggleOverrideResources(false);

      expect(find('.resourcesSections-field .field-enabled')).to.not.exist;
      done();
    });

    it('enables "resources" section when "override resources" toggle is checked', async function (done) {
      await renderComponent();

      await toggleOverrideResources(true);

      expect(find('.resourcesSections-field .field-disabled')).to.not.exist;
      done();
    });

    it('allows to setup resources override (minimal values provided)', async function (done) {
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
    });

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

    it('resets changes in "resources" section when it becomes disabled', async function (done) {
      const changeSpy = this.get('changeSpy');
      await renderComponent();

      await toggleOverrideResources(true);
      await fillIn('.cpuRequested-field input', '2');
      await fillIn('.cpuLimit-field input', '10');
      await fillIn('.memoryRequested-field input', '100');
      await fillIn('.memoryLimit-field input', '200');
      await fillIn('.ephemeralStorageRequested-field input', '100');
      await fillIn('.ephemeralStorageLimit-field input', '200');
      changeSpy.reset();
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
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        task: _.cloneDeep(exampleTask),
      });
    });

    itHasModeClass('edit');
    itHasEnabledFieldsByDefault();
    itAllowsToDisableAllFields();
    itShowsLambdaInfo();
    itFillsFieldsWithDataOfPassedTask();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithIteratedItemValueBuilder();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithConstantValueValueBuilder();
    // TODO: VFS-7816 uncomment or remove future code
    // itFillsFieldsWithDataAboutArgumentsOfAllTypesWithStoreCredsValueBuilder();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithOnedatafsCredsValueBuilder();
    itFillsFieldsWithDataAboutResultsWithAllStoreTypesAndDispatchMethods();
    itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned();
    itFillsFieldsWithDataAboutNoResourceOverride();
    itFillsFieldsWithDataAboutResourceOverride();

    it('does not update form values on passed task change', async function (done) {
      await renderComponent();

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await settled();

      expect(find('.name-field .form-control').value).to.equal(exampleTask.name);
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
    // TODO: VFS-7816 uncomment or remove future code
    // itFillsFieldsWithDataAboutArgumentsOfAllTypesWithStoreCredsValueBuilder();
    itFillsFieldsWithDataAboutArgumentsOfAllTypesWithOnedatafsCredsValueBuilder();
    itFillsFieldsWithDataAboutResultsWithAllStoreTypesAndDispatchMethods();
    itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned();
    itFillsFieldsWithDataAboutNoResourceOverride();
    itFillsFieldsWithDataAboutResourceOverride();

    it('updates form values on passed task change', async function (done) {
      await renderComponent();

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await settled();

      expect(find('.name-field .field-component').textContent.trim())
        .to.equal('task2');
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
  if (value !== [...overrideToggle.classList].includes('checked')) {
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

    expect(find('.atm-lambda-name .value').textContent.trim())
      .to.equal(exampleAtmLambdaRevision.name);
    expect(find('.atm-lambda-revision-number .value').textContent.trim())
      .to.equal('1');
    expect(find('.atm-lambda-summary .value').textContent.trim())
      .to.equal(exampleAtmLambdaRevision.summary);
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
      await selectChoose('.resultMapping-field .targetStore-field', targetStore.name);
      await clickTrigger('.resultMapping-field .dispatchFunction-field');

      expect(find('.dispatchFunction-field .dropdown-field-trigger').textContent.trim())
        .to.equal(dispatchFunctionLabels[dispatchFunctions[0]]);
      const options = document.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(dispatchFunctions.length);
      dispatchFunctions.forEach((dispatchFunction, idx) =>
        expect(options[idx].textContent.trim())
        .to.equal(dispatchFunctionLabels[dispatchFunction])
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
      await selectChoose('.resultMapping-field .targetStore-field', targetStore.name);
      await selectChoose(
        '.resultMapping-field .dispatchFunction-field',
        dispatchFunctionLabels[dispatchFunction]
      );

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
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
      await selectChoose('.resultMapping-field .targetStore-field', targetStore.name);

      expect(this.get('changeSpy')).to.be.calledWith({
        data: {
          name: 'function1',
          argumentMappings: [],
          resultMappings: [{
            resultName: 'res1',
            storeSchemaId: targetStore.id,
            storeContentUpdateOptions: {
              type: `${targetStore.type}StoreContentUpdateOptions`,
            },
          }],
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
      expect(find('.name-field .form-control').value).to.equal(exampleTask.name);
    } else {
      expect(find('.name-field .field-component').textContent.trim())
        .to.equal(exampleTask.name);
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
      // TODO: VFS-7816 uncomment or remove future code
      // 'Store credentials',
      'OnedataFS credentials',
    ].forEach((builderLabel, idx) =>
      expect(
        argumentValueBuilderTypes[idx]
        .querySelector('.field-component')
        .textContent.trim()
      ).to.equal(builderLabel)
    );
    // TODO: VFS-7816 uncomment or remove future code
    // expect(args[2].querySelector('.valueBuilderStore-field .field-component').textContent.trim())
    //   .to.equal('singleValueObjectStore');
    const results = findAll('.resultMapping-field');
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
      const possibleDataSpecs = dataSpecs
        .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('iteratedItem'))
        .mapBy('dataSpec');
      this.set('atmLambda.revisionRegistry.1.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
        name: `arg${idx}`,
        dataSpec,
        isOptional: false,
      })));
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
        expect(
          args[idx].querySelector('.valueBuilderType-field .field-component')
          .textContent.trim()
        ).to.equal('Iterated item');
      });
      done();
    });
}

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithConstantValueValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "Constant value" value builder',
    async function (done) {
      const possibleDataSpecs = dataSpecs
        .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('const'))
        .mapBy('dataSpec');
      this.set('atmLambda.revisionRegistry.1.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
        name: `arg${idx}`,
        dataSpec,
        isOptional: false,
      })));
      this.set('task.argumentMappings', possibleDataSpecs.map((dataSpec, idx) => ({
        argumentName: `arg${idx}`,
        valueBuilder: {
          valueBuilderType: 'const',
          valueBuilderRecipe: String(idx),
        },
      })));

      await renderComponent();

      const args = findAll('.argumentMapping-field');
      expect(args).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach((dataSpec, idx) => {
        expect(args[idx].querySelector('.control-label').textContent.trim())
          .to.equal(`arg${idx}:`);
        expect(
          args[idx].querySelector('.valueBuilderType-field .field-component')
          .textContent.trim()
        ).to.equal('Constant value');
        expect(
          args[idx].querySelector('.valueBuilderConstValue-field .form-control').value
        ).to.equal(`"${idx}"`);
      });
      done();
    });
}

// TODO: VFS-7816 uncomment or remove future code
// function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithStoreCredsValueBuilder() {
//   it('fills fields with data about arguments of all possible types, that uses "Store credentials" value builder',
//     async function (done) {
//       const possibleDataSpecs = dataSpecs
//         .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('storeCredentials'))
//         .mapBy('dataSpec');
//       this.set('atmLambda.revisionRegistry.1.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
//         name: `arg${idx}`,
//         dataSpec,
//         isOptional: false,
//       })));
//       const usedStores = possibleDataSpecs.map(({ valueConstraints: { storeType } }) => {
//         const possibleStores = storeType ?
//           allPossibleStores.filterBy('type', storeType) :
//           allPossibleStores;
//         return possibleStores[0];
//       });
//       this.set('task.argumentMappings', possibleDataSpecs.map((dataSpec, idx) => {
//         return {
//           argumentName: `arg${idx}`,
//           valueBuilder: {
//             valueBuilderType: 'storeCredentials',
//             valueBuilderRecipe: usedStores[idx].id,
//           },
//         };
//       }));

//       await renderComponent();

//       const args = findAll('.argumentMapping-field');
//       expect(args).to.have.length(possibleDataSpecs.length);
//       possibleDataSpecs.forEach((dataSpec, idx) => {
//         expect(args[idx].querySelector('.control-label').textContent.trim())
//           .to.equal(`arg${idx}:`);
//         expect(
//           args[idx].querySelector('.valueBuilderType-field .field-component')
//           .textContent.trim()
//         ).to.equal('Store credentials');
//         expect(
//           args[idx].querySelector('.valueBuilderStore-field .field-component')
//           .textContent.trim()
//         ).to.equal(usedStores[idx].name);
//       });
//       done();
//     });
// }

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithOnedatafsCredsValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "OnedataFS credentials" value builder',
    async function (done) {
      const possibleDataSpecs = dataSpecs
        .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('onedatafsCredentials'))
        .mapBy('dataSpec');
      this.set('atmLambda.revisionRegistry.1.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
        name: `arg${idx}`,
        dataSpec,
        isOptional: false,
      })));
      this.set('task.argumentMappings', possibleDataSpecs.map((dataSpec, idx) => ({
        argumentName: `arg${idx}`,
        valueBuilder: {
          valueBuilderType: 'onedatafsCredentials',
        },
      })));

      await renderComponent();

      const args = findAll('.argumentMapping-field');
      expect(args).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach((dataSpec, idx) => {
        expect(args[idx].querySelector('.control-label').textContent.trim())
          .to.equal(`arg${idx}:`);
        expect(
          args[idx].querySelector('.valueBuilderType-field .field-component')
          .textContent.trim()
        ).to.equal('OnedataFS credentials');
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

          const results = findAll('.resultMapping-field');
          expect(results).to.have.length(dispatchFunctions.length);
          dispatchFunctions.forEach((dispatchFunction, idx) => {
            expect(results[idx].querySelector('.control-label').textContent.trim())
              .to.equal(`res${idx}:`);
            expect(
              results[idx].querySelector('.targetStore-field .field-component')
              .textContent.trim()
            ).to.equal(targetStore.name);
            if (dispatchFunction) {
              expect(
                results[idx].querySelector('.dispatchFunction-field .field-component')
                .textContent.trim()
              ).to.equal(dispatchFunctionLabels[dispatchFunction]);
            } else {
              expect(results[idx].querySelector('.dispatchFunction-field'))
                .to.not.exist;
            }
          });
          done();
        });
    });
}

function itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned() {
  it('fills fields with data about results that are left unassigned',
    async function (done) {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        isOptional: false,
      }]);
      this.set('task.resultMappings', []);

      await renderComponent();

      const results = findAll('.resultMapping-field');
      expect(results).to.have.length(1);
      expect(results[0].querySelector('.control-label').textContent.trim()).to.equal('res1:');
      expect(
        results[0].querySelector('.targetStore-field .field-component')
        .textContent.trim()
      ).to.equal('Leave unassigned');
      expect(results[0].querySelector('.dispatchFunction-field')).to.not.exist;
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
