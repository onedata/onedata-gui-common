import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn, click } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import $ from 'jquery';
import _ from 'lodash';
import { classify } from '@ember/string';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { setProperties } from '@ember/object';

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
];
const allPossibleStoreSpecs = [{
  type: 'singleValue',
  allowedDataSpecNames: allSimpleDataSpecNames,
  acceptsBatch: false,
  dispatchFunctions: ['set'],
}, {
  type: 'list',
  allowedDataSpecNames: allSimpleDataSpecNames,
  acceptsBatch: true,
  dispatchFunctions: ['append'],
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
  acceptsBatch: true,
  dispatchFunctions: ['append'],
}, {
  type: 'range',
  allowedDataSpecNames: [],
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
  acceptsBatch: true,
  dispatchFunctions: ['append'],
}];
const allPossibleStores = [];
allPossibleStoreSpecs.rejectBy('type', 'range').forEach(({
    type,
    allowedDataSpecNames,
  }) =>
  allPossibleStores.push(...allowedDataSpecNames.map(dataSpecName => {
    const storeLabel = `${type}${classify(dataSpecName)}`;
    return {
      id: `${storeLabel}Id`,
      name: `${storeLabel}Store`,
      type,
      dataSpec: dataSpecs.findBy('name', dataSpecName).dataSpec,
      requiresInitialValue: false,
    };
  }))
);
allPossibleStores.push({
  id: 'rangeId',
  name: 'rangeStore',
  type: 'range',
  defaultInitialValue: {
    start: 1,
    end: 10,
    step: 2,
  },
  requiresInitialValue: false,
});
const taskAuditLogStore = {
  id: 'CURRENT_TASK_SYSTEM_AUDIT_LOG',
  name: 'Current task system audit log',
  type: 'auditLog',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
  requiresInitialValue: false,
};
const workflowAuditLogStore = {
  id: 'WORKFLOW_SYSTEM_AUDIT_LOG',
  name: 'Workflow system audit log',
  type: 'auditLog',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
  requiresInitialValue: false,
};

const dispatchFunctionLabels = {
  // TODO: VFS-7816 uncomment or remove future code
  // add: 'Add',
  // remove: 'Remove',
  append: 'Append',
  // TODO: VFS-7816 uncomment or remove future code
  // prepend: 'Prepend',
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
    dispatchFunction: 'set',
  }, {
    resultName: 'resanyfile',
    storeSchemaId: 'treeForestAnyFileId',
    dispatchFunction: 'append',
  }],
};

describe('Integration | Component | workflow visualiser/task form', function () {
  setupComponentTest('workflow-visualiser/task-form', {
    integration: true,
  });

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
      definedStores: A(_.cloneDeep(allPossibleStores)),
      createStoreSucceeds: true,
      newStoreFromCreation: undefined,
      actionsFactory,
      createCreateStoreActionStub,
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
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

    it('renders "name" field', async function () {
      await render(this);

      const $label = this.$('.name-field .control-label');
      const $field = this.$('.name-field .form-control');
      expect($label.text().trim()).to.equal('Name:');
      expect($field).to.have.attr('type', 'text');
    });

    it('uses lambda name as default value for name field', async function () {
      await render(this);

      expect(this.$('.name-field .form-control')).to.have.value(exampleAtmLambdaRevision.name);
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', '');

      expect(this.$('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', 'somename');

      expect(this.$('.name-field')).to.have.class('has-success');
    });

    it('notifies about changes of values and validation state', async function () {
      const changeSpy = this.get('changeSpy');

      await render(this);

      expect(this.$('.has-error')).to.not.exist;
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
      expect(this.$('.has-error')).to.not.exist;
      expect(changeSpy).to.be.calledWith({
        data: {
          name: 'someName',
          argumentMappings: [],
          resultMappings: [],
        },
        isValid: true,
      });
    });

    it('does not render arguments section, if lambda does not specify any',
      async function () {
        this.set('atmLambda.revisionRegistry.1.argumentSpecs', []);

        await render(this);

        expect(this.$('.argumentMappings-field')).to.not.exist;
      });

    it('renders arguments section', async function () {
      await render(this);

      const $argumentMappings = this.$('.argumentMappings-field');
      expect($argumentMappings).to.exist;
      expect($argumentMappings.find('.control-label').eq(0).text().trim())
        .to.equal('Arguments');
      const $arguments = $argumentMappings.find('.argumentMapping-field');
      expect($arguments).to.have.length(exampleAtmLambdaRevision.argumentSpecs.length);
      exampleAtmLambdaRevision.argumentSpecs.forEach(({ name }, idx) => {
        expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`${name}:`);
      });
    });

    dataSpecs.forEach(({ name, label, dataSpec, valueBuilderTypes, canContain }) => {
      it(`provides available value builder types for argument of type "${label}"`,
        async function () {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: false,
          }]);

          await render(this);
          await clickTrigger('.argumentMapping-field .valueBuilderType-field');

          expect(this.$('.valueBuilderType-field .dropdown-field-trigger').text().trim())
            .to.equal(valueBuilderTypeLabels[valueBuilderTypes[0]]);
          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(valueBuilderTypes.length);
          valueBuilderTypes.forEach((type, idx) =>
            expect($options.eq(idx).text().trim())
            .to.equal(valueBuilderTypeLabels[type])
          );
        });

      it(`provides available value builder types for optional argument of type "${label}"`,
        async function () {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: true,
          }]);

          await render(this);
          await clickTrigger('.argumentMapping-field .valueBuilderType-field');

          expect(this.$('.valueBuilderType-field .dropdown-field-trigger').text().trim())
            .to.equal('Leave unassigned');
          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(valueBuilderTypes.length + 1);
          expect($options.eq(0).text().trim()).to.equal('Leave unassigned');
          valueBuilderTypes.forEach((type, idx) =>
            expect($options.eq(idx + 1).text().trim())
            .to.equal(valueBuilderTypeLabels[type])
          );
        });

      it(`allows to setup optional argument of type "${label}" using "Leave unassigned" value builder`,
        async function () {
          this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
            name: 'arg1',
            dataSpec,
            isOptional: true,
          }]);

          await render(this);
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
        });

      if (valueBuilderTypes.includes('iteratedItem')) {
        it(`allows to setup argument of type "${label}" using "Iterated item" value builder`,
          async function () {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            await render(this);
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
          });
      }

      if (valueBuilderTypes.includes('singleValueStoreContent')) {
        it(`allows to setup argument of type "${label}" using "Store content" value builder`,
          async function () {
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

            await render(this);
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'Store content'
            );
            await clickTrigger('.argumentMapping-field .valueBuilderStore-field');

            const $options = $('.ember-power-select-option');
            expect($options).to.have.length(sortedPossibleStores.length + 1);
            expect($options.eq(0).text().trim()).to.equal('Create store...');
            sortedPossibleStores.forEach(({ name }, idx) =>
              expect($options.eq(idx + 1).text().trim()).to.equal(name)
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
          });

        it(`allows to create new store for argument of type "${label}" using "Store content" value builder`,
          async function () {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            this.set('newStoreFromCreation', {
              id: 'newstore',
              name: 'new store',
              dataSpec: dataSpec,
              type: 'singleValue',
            });
            const allowedStoreTypes = ['singleValue'];
            const allowedDataTypes = dataSpecs.mapBy('name').filter(specName =>
              name === specName || (canContain || []).includes(specName)
            );

            await render(this);
            await selectChoose(
              '.argumentMapping-field .valueBuilderType-field',
              'Store content'
            );
            await selectChoose(
              '.argumentMapping-field .valueBuilderStore-field',
              'Create store...'
            );

            expect(this.$('.valueBuilderStore-field .dropdown-field-trigger').text().trim())
              .to.equal('new store');
            const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
            expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
            const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

            expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
              .to.deep.equal(allowedStoreTypes.sort());
            expect(lastCreateStoreCallArg.allowedDataTypes.sort())
              .to.deep.equal(allowedDataTypes.sort());
          });
      }

      if (valueBuilderTypes.includes('const')) {
        it(`allows to setup argument of type "${label}" using "Constant value" value builder`,
          async function () {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            await render(this);
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
          });
      }

      // TODO: VFS-7816 uncomment or remove future code
      // if (valueBuilderTypes.includes('storeCredentials')) {
      //   it(`allows to setup argument of type "${label}" using "Store credentials" value builder`,
      //     async function () {
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

      //       await render(this);
      //       await selectChoose(
      //         '.argumentMapping-field .valueBuilderType-field',
      //         'Store credentials'
      //       );
      //       await clickTrigger('.argumentMapping-field .valueBuilderStore-field');

      //       const $options = $('.ember-power-select-option');
      //       expect($options).to.have.length(sortedPossibleStores.length);
      //       sortedPossibleStores.forEach(({ name }, idx) =>
      //         expect($options.eq(idx).text().trim()).to.equal(name)
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
      //     });
      // }

      if (valueBuilderTypes.includes('onedatafsCredentials')) {
        it(`allows to setup argment of type "${label}" using "OnedataFS credentials" value builder`,
          async function () {
            this.set('atmLambda.revisionRegistry.1.argumentSpecs', [{
              name: 'arg1',
              dataSpec,
              isOptional: false,
            }]);

            await render(this);
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
          });
      }
    });

    it('does not render results section, if lambda does not specify any',
      async function () {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', []);

        await render(this);

        expect(this.$('.resultMappings-field')).to.not.exist;
      });

    it('renders results section', async function () {
      await render(this);

      const $resultMappings = this.$('.resultMappings-field');
      expect($resultMappings).to.exist;
      expect($resultMappings.find('.control-label').eq(0).text().trim())
        .to.equal('Results');
      const $results = $resultMappings.find('.resultMapping-field');
      expect($results).to.have.length(exampleAtmLambdaRevision.resultSpecs.length);
      exampleAtmLambdaRevision.resultSpecs.forEach(({ name }, idx) => {
        expect($results.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`${name}:`);
      });
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
        async function () {
          this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
            name: 'res1',
            dataSpec,
          }]);

          await render(this);
          await clickTrigger('.resultMapping-field .targetStore-field');

          expect(this.$('.targetStore-field .dropdown-field-trigger').text().trim())
            .to.equal('Leave unassigned');
          const $options = $('.ember-power-select-option');
          const extraOptionsCount = 2 + (allowSystemAuditLogStores ? 2 : 0);
          expect($options)
            .to.have.length(sortedPossibleStores.length + extraOptionsCount);
          expect($options.eq(0).text().trim()).to.equal('Create store...');
          expect($options.eq(1).text().trim()).to.equal('Leave unassigned');
          if (allowSystemAuditLogStores) {
            expect($options.eq(2).text().trim()).to.equal(taskAuditLogStore.name);
            expect($options.eq(3).text().trim()).to.equal(workflowAuditLogStore.name);
          }
          sortedPossibleStores.forEach((store, idx) =>
            expect($options.eq(idx + extraOptionsCount).text().trim()).to.equal(store.name)
          );
        });

      it(`provides available stores for result of batched type "${dataSpecName}"`,
        async function () {
          setProperties(this.get('atmLambda.revisionRegistry.1'), {
            preferredBatchSize: 100,
            resultSpecs: [{
              name: 'res1',
              dataSpec,
            }],
          });

          await render(this);
          await clickTrigger('.resultMapping-field .targetStore-field');

          expect(this.$('.targetStore-field .dropdown-field-trigger').text().trim())
            .to.equal('Leave unassigned');
          const $options = $('.ember-power-select-option');
          const extraOptionsCount = 2 + (allowSystemAuditLogStores ? 2 : 0);
          expect($options)
            .to.have.length(sortedPossibleStoresWithBatch.length + extraOptionsCount);
          expect($options.eq(0).text().trim()).to.equal('Create store...');
          expect($options.eq(1).text().trim()).to.equal('Leave unassigned');
          if (allowSystemAuditLogStores) {
            expect($options.eq(2).text().trim()).to.equal(taskAuditLogStore.name);
            expect($options.eq(3).text().trim()).to.equal(workflowAuditLogStore.name);
          }
          sortedPossibleStoresWithBatch.forEach((store, idx) =>
            expect($options.eq(idx + extraOptionsCount).text().trim()).to.equal(store.name)
          );
        });

      it(`allows to create new store for result of type "${dataSpecName}"`,
        async function () {
          this.set('newStoreFromCreation', {
            id: 'newstore',
            name: 'new store',
            dataSpec: sortedPossibleStores[0].dataSpec,
            type: sortedPossibleStores[0].type,
          });
          this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
            name: 'res1',
            dataSpec,
          }]);
          const allowedStoreTypes = sortedPossibleStores.mapBy('type').uniq();
          const allowedDataTypes = [...compatibleDataSpecNames];

          await render(this);
          await selectChoose('.resultMapping-field .targetStore-field', 'Create store...');

          expect(this.$('.targetStore-field .dropdown-field-trigger').text().trim())
            .to.equal('new store');
          const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
          expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
          const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

          expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
            .to.deep.equal(allowedStoreTypes.sort());
          expect(lastCreateStoreCallArg.allowedDataTypes.sort())
            .to.deep.equal(allowedDataTypes.sort());
        });

      it(`allows to create new store for result of batched type "${dataSpecName}"`,
        async function () {
          this.set('newStoreFromCreation', {
            id: 'newstore',
            name: 'new store',
            dataSpec: sortedPossibleStoresWithBatch[0].dataSpec,
            type: sortedPossibleStoresWithBatch[0].type,
          });
          setProperties(this.get('atmLambda.revisionRegistry.1'), {
            preferredBatchSize: 100,
            resultSpecs: [{
              name: 'res1',
              dataSpec,
            }],
          });
          const allowedStoreTypes = sortedPossibleStoresWithBatch.mapBy('type').uniq();
          const allowedDataTypes = [...compatibleDataSpecNames];

          await render(this);
          await selectChoose('.resultMapping-field .targetStore-field', 'Create store...');

          expect(this.$('.targetStore-field .dropdown-field-trigger').text().trim())
            .to.equal('new store');
          const createCreateStoreActionStub = this.get('createCreateStoreActionStub');
          expect(this.get('createCreateStoreActionStub')).to.be.calledOnce;
          const lastCreateStoreCallArg = createCreateStoreActionStub.lastCall.args[0];

          expect(lastCreateStoreCallArg.allowedStoreTypes.sort())
            .to.deep.equal(allowedStoreTypes.sort());
          expect(lastCreateStoreCallArg.allowedDataTypes.sort())
            .to.deep.equal(allowedDataTypes.sort());
        });
    });

    it('allows to setup result to be unassigned',
      async function () {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        }]);

        await render(this);
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
      });

    it('allows to setup result to use task audit log', async function () {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Object').dataSpec,
      }]);

      await render(this);
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
            dispatchFunction: 'append',
          }],
        },
        isValid: true,
      });
    });

    it('allows to setup result to use workflow audit log', async function () {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Object').dataSpec,
      }]);

      await render(this);
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
            dispatchFunction: 'append',
          }],
        },
        isValid: true,
      });
    });

    it('does not allow to choose dispatch function when result store is left unassigned',
      async function () {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        }]);

        await render(this);

        expect(this.$('.dispatchFunction-field')).to.not.exist;
      });

    allPossibleStoreSpecs
      .filterBy('allowedDataSpecNames.length')
      .forEach(({ type, allowedDataSpecNames, dispatchFunctions }) => {
        const targetStore = allPossibleStores
          .findBy('name', `${type}${classify(allowedDataSpecNames[0])}Store`);

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
      });

    [
      ['task audit log', taskAuditLogStore],
      ['workflow audit log', workflowAuditLogStore],
    ].forEach(([storeDesc, targetStore]) => {
      itProvidesPossibleDispatchFunctionsForResultWithStoreAttached(
        storeDesc,
        targetStore,
        ['append']
      );
      itAllowsToSetupResultToUseStoreWithDispatchFunction(
        storeDesc,
        targetStore,
        'append'
      );
    });

    it('changes available dispatch functions when result store type changes',
      async function () {
        this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('name', 'integer').dataSpec,
        }]);

        await render(this);
        await selectChoose('.resultMapping-field .targetStore-field', 'listIntegerStore');
        await selectChoose('.resultMapping-field .targetStore-field', 'singleValueIntegerStore');
        await clickTrigger('.resultMapping-field .dispatchFunction-field');

        const dispatchFunctions =
          allPossibleStoreSpecs.findBy('type', 'singleValue').dispatchFunctions;
        expect(this.$('.dispatchFunction-field .dropdown-field-trigger').text().trim())
          .to.equal(dispatchFunctionLabels[dispatchFunctions[0]]);
        const $options = $('.ember-power-select-option');
        expect($options).to.have.length(dispatchFunctions.length);
        dispatchFunctions.forEach((dispatchFunction, idx) =>
          expect($options.eq(idx).text().trim())
          .to.equal(dispatchFunctionLabels[dispatchFunction])
        );
      });

    it('renders "override resources" toggle, which is unchecked by default', async function () {
      await render(this);

      const $overrideField = this.$('.overrideResources-field');
      expect($overrideField).to.have.class('toggle-field-renderer');
      expect($overrideField.find('.control-label').text().trim())
        .to.equal('Override default resources:');
      expect($overrideField.find('.one-way-toggle')).to.not.have.class('checked');
    });

    it('renders "resources" section with cpu, memory and storage fields groups',
      async function () {
        await render(this);

        const $resourcesSection = this.$('.resources-field');
        expect($resourcesSection.find('.control-label').eq(0).text().trim())
          .to.equal('Resources');
        // Check if translations for resources fields are loaded
        expect($resourcesSection.text()).to.contain('Limit');

        expect(this.$('.cpuRequested-field .form-control')).to.have.value('0.1');
        expect(this.$('.cpuLimit-field .form-control')).to.have.value('');
        [{
          resourceName: 'memory',
          requested: ['128', 'MiB'],
          limit: ['', 'MiB'],
        }, {
          resourceName: 'ephemeralStorage',
          requested: ['0', 'MiB'],
          limit: ['', 'MiB'],
        }].forEach(({ resourceName, requested, limit }) => {
          const $requested = this.$(`.${resourceName}Requested-field`);
          expect($requested.find('input')).to.have.value(requested[0]);
          expect($requested.find('.ember-power-select-trigger').text())
            .to.contain(requested[1]);
          const $limit = this.$(`.${resourceName}Limit-field`);
          expect($limit.find('input')).to.have.value(limit[0]);
          expect($limit.find('.ember-power-select-trigger').text())
            .to.contain(limit[1]);
        });
      });

    it('renders "resources" section with full configuration',
      async function () {
        this.set('atmLambda.revisionRegistry.1.resourceSpec', {
          cpuRequested: 1,
          cpuLimit: 2,
          memoryRequested: 128 * 1024 * 1024,
          memoryLimit: 256 * 1024 * 1024,
          ephemeralStorageRequested: 10 * 1024 * 1024,
          ephemeralStorageLimit: 20 * 1024 * 1024,
        });

        await render(this);

        expect(this.$('.cpuRequested-field .form-control')).to.have.value('1');
        expect(this.$('.cpuLimit-field .form-control')).to.have.value('2');
        expect(this.$('.memoryRequested-field .form-control')).to.have.value('128');
        expect(this.$('.memoryLimit-field .form-control')).to.have.value('256');
        expect(this.$('.ephemeralStorageRequested-field .form-control'))
          .to.have.value('10');
        expect(this.$('.ephemeralStorageLimit-field .form-control'))
          .to.have.value('20');
      });

    it('disables "resources" section when "override resources" toggle is unchecked', async function () {
      await render(this);

      await toggleOverrideResources(this, false);

      expect(this.$('.resourcesSections-field .field-enabled')).to.not.exist;
    });

    it('enables "resources" section when "override resources" toggle is checked', async function () {
      await render(this);

      await toggleOverrideResources(this, true);

      expect(this.$('.resourcesSections-field .field-disabled')).to.not.exist;
    });

    it('allows to setup resources override (minimal values provided)', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await toggleOverrideResources(this, true);

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
    });

    it('allows to setup resources override (all values provided)', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await toggleOverrideResources(this, true);
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
    });

    it('resets changes in "resources" section when it becomes disabled', async function () {
      const changeSpy = this.get('changeSpy');
      await render(this);

      await toggleOverrideResources(this, true);
      await fillIn('.cpuRequested-field input', '2');
      await fillIn('.cpuLimit-field input', '10');
      await fillIn('.memoryRequested-field input', '100');
      await fillIn('.memoryLimit-field input', '200');
      await fillIn('.ephemeralStorageRequested-field input', '100');
      await fillIn('.ephemeralStorageLimit-field input', '200');
      changeSpy.reset();
      await toggleOverrideResources(this, false);

      expect(this.$('.cpuRequested-field input')).to.have.value('0.1');
      expect(this.$('.cpuLimit-field input')).to.have.value('');
      expect(this.$('.memoryRequested-field input')).to.have.value('128');
      expect(this.$('.memoryLimit-field input')).to.have.value('');
      expect(this.$('.ephemeralStorageRequested-field input')).to.have.value('0');
      expect(this.$('.ephemeralStorageLimit-field input')).to.have.value('');
      expect(changeSpy).to.be.calledWith(
        sinon.match((val) => !('resourceSpecOverride' in val))
      );
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

    it('does not update form values on passed task change', async function () {
      await render(this);

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await wait();

      expect(this.$('.name-field .form-control')).to.have.value(exampleTask.name);
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

    it('updates form values on passed task change', async function () {
      await render(this);

      this.set('task', Object.assign({}, exampleTask, { name: 'task2' }));
      await wait();

      expect(this.$('.name-field .field-component').text().trim())
        .to.equal('task2');
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{workflow-visualiser/task-form
    mode=mode
    task=task
    atmLambda=atmLambda
    atmLambdaRevisionNumber=atmLambdaRevisionNumber
    definedStores=definedStores
    isDisabled=isDisabled
    actionsFactory=actionsFactory
    onChange=changeSpy
  }}`);
  await wait();
}

async function toggleOverrideResources(testCase, value) {
  const $overrideToggle = testCase.$('.overrideResources-field .one-way-toggle');
  if (value !== $overrideToggle.hasClass('checked')) {
    await click($overrideToggle[0]);
  }
}

function getComponent(testCase) {
  return testCase.$(`.${componentClass}`);
}

function itHasModeClass(mode) {
  const modeClass = `mode-${mode}`;
  it(`has class "${modeClass}"`, async function () {
    await render(this);

    expect(getComponent(this)).to.have.class(modeClass);
  });
}

function itHasEnabledFieldsByDefault() {
  it('has all fields enabled by default', async function () {
    await render(this);

    expect(getComponent(this)).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(this.$('.field-enabled')).to.exist;
  });
}

function itAllowsToDisableAllFields() {
  it('allows to disable all fields', async function () {
    this.set('isDisabled', true);

    await render(this);

    expect(getComponent(this)).to.have.class('form-disabled')
      .and.to.not.have.class('form-enabled');
    expect(this.$('.field-enabled')).to.not.exist;
  });
}

function itShowsLambdaInfo() {
  it('shows brief information about used lambda', async function () {
    await render(this);

    expect(this.$('.atm-lambda-name .value').text().trim())
      .to.equal(exampleAtmLambdaRevision.name);
    expect(this.$('.atm-lambda-revision-number .value').text().trim())
      .to.equal('1');
    expect(this.$('.atm-lambda-summary .value').text().trim())
      .to.equal(exampleAtmLambdaRevision.summary);
  });
}

function itProvidesPossibleDispatchFunctionsForResultWithStoreAttached(
  storeDescription,
  targetStore,
  dispatchFunctions
) {
  it(`provides possible dispatch functions for result with store "${storeDescription}" attached`,
    async function () {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: targetStore.dataSpec,
      }]);

      await render(this);
      await selectChoose('.resultMapping-field .targetStore-field', targetStore.name);
      await clickTrigger('.resultMapping-field .dispatchFunction-field');

      expect(this.$('.dispatchFunction-field .dropdown-field-trigger').text().trim())
        .to.equal(dispatchFunctionLabels[dispatchFunctions[0]]);
      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(dispatchFunctions.length);
      dispatchFunctions.forEach((dispatchFunction, idx) =>
        expect($options.eq(idx).text().trim())
        .to.equal(dispatchFunctionLabels[dispatchFunction])
      );
    });
}

function itAllowsToSetupResultToUseStoreWithDispatchFunction(
  storeDescription,
  targetStore,
  dispatchFunction,
) {
  it(`allows to setup result to use "${storeDescription}" store with "${dispatchFunction}" dispatch function`,
    async function () {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: targetStore.dataSpec,
      }]);

      await render(this);
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
            dispatchFunction,
          }],
        },
        isValid: true,
      });
    });
}

function itFillsFieldsWithDataOfPassedTask() {
  it('fills fields with data of passed task', async function () {
    const inEditMode = this.get('mode') !== 'view';
    await render(this);

    if (inEditMode) {
      expect(this.$('.name-field .form-control')).to.have.value(exampleTask.name);
    } else {
      expect(this.$('.name-field .field-component').text().trim())
        .to.equal(exampleTask.name);
    }
    const $arguments = this.$('.argumentMapping-field');
    expect($arguments).to.have.length(exampleAtmLambdaRevision.argumentSpecs.length);
    exampleAtmLambdaRevision.argumentSpecs.forEach(({ name }, idx) => {
      expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
        .to.equal(`${name}:`);
    });
    const $argumentValueBuilderTypes = $arguments.find('.valueBuilderType-field');
    [
      'Iterated item',
      'Leave unassigned',
      // TODO: VFS-7816 uncomment or remove future code
      // 'Store credentials',
      'OnedataFS credentials',
    ].forEach((builderLabel, idx) =>
      expect($argumentValueBuilderTypes.eq(idx).find('.field-component').text().trim())
      .to.equal(builderLabel)
    );
    // TODO: VFS-7816 uncomment or remove future code
    // expect($arguments.eq(2).find('.valueBuilderStore-field .field-component').text().trim())
    //   .to.equal('singleValueObjectStore');
    const $results = this.$('.resultMapping-field');
    expect($results).to.have.length(exampleAtmLambdaRevision.resultSpecs.length);
    exampleAtmLambdaRevision.resultSpecs.forEach(({ name }, idx) => {
      expect($results.eq(idx).find('.control-label').eq(0).text().trim())
        .to.equal(`${name}:`);
    });
    expect(this.$(`.field-${inEditMode ? 'view' : 'edit'}-mode`)).to.not.exist;
  });
}

function itFillsFieldsWithDataAboutNoResourceOverride() {
  it('fills fields with data about no resources override',
    async function () {
      const inEditMode = this.get('mode') !== 'view';
      delete this.get('task').resourceSpecOverride;

      await render(this);

      expect(this.$('.overrideResources-field .one-way-toggle'))
        .to.not.have.class('checked');
      if (inEditMode) {
        expect(this.$('.resourcesSections-field')).to.exist;
        expect(this.$('.cpuRequested-field input')).to.have.value('0.1');
        expect(this.$('.cpuLimit-field input')).to.have.value('');
        expect(this.$('.memoryRequested-field input')).to.have.value('128');
        expect(this.$('.memoryLimit-field input')).to.have.value('');
        expect(this.$('.ephemeralStorageRequested-field input')).to.have.value('0');
        expect(this.$('.ephemeralStorageLimit-field input')).to.have.value('');
      } else {
        expect(this.$('.resourcesSections-field')).to.not.exist;
      }
    });
}

function itFillsFieldsWithDataAboutResourceOverride() {
  it('fills fields with data about resources override',
    async function () {
      const inEditMode = this.get('mode') !== 'view';
      this.set('task.resourceSpecOverride', {
        cpuRequested: 2,
        cpuLimit: 10,
        memoryRequested: 100 * 1024 * 1024,
        memoryLimit: 200 * 1024 * 1024,
        ephemeralStorageRequested: 300 * 1024 * 1024,
        ephemeralStorageLimit: 400 * 1024 * 1024,
      });

      await render(this);

      expect(this.$('.overrideResources-field .one-way-toggle'))
        .to.have.class('checked');
      expect(this.$('.resourcesSections-field')).to.exist;
      if (inEditMode) {
        expect(this.$('.cpuRequested-field input')).to.have.value('2');
        expect(this.$('.cpuLimit-field input')).to.have.value('10');
        expect(this.$('.memoryRequested-field input')).to.have.value('100');
        expect(this.$('.memoryLimit-field input')).to.have.value('200');
        expect(this.$('.ephemeralStorageRequested-field input')).to.have.value('300');
        expect(this.$('.ephemeralStorageLimit-field input')).to.have.value('400');
      } else {
        expect(this.$('.cpuRequested-field .field-component').text().trim()).to.equal('2');
        expect(this.$('.cpuLimit-field .field-component').text().trim()).to.equal('10');
        expect(this.$('.memoryRequested-field .field-component').text().trim()).to.equal('100 MiB');
        expect(this.$('.memoryLimit-field .field-component').text().trim()).to.equal('200 MiB');
        expect(this.$('.ephemeralStorageRequested-field .field-component').text().trim()).to.equal('300 MiB');
        expect(this.$('.ephemeralStorageLimit-field .field-component').text().trim()).to.equal('400 MiB');
      }
    });
}

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithIteratedItemValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "Iterated item" value builder',
    async function () {
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

      await render(this);

      const $arguments = this.$('.argumentMapping-field');
      expect($arguments).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach((dataSpec, idx) => {
        expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`arg${idx}:`);
        expect(
          $arguments.eq(idx).find('.valueBuilderType-field .field-component')
          .text().trim()
        ).to.equal('Iterated item');
      });
    });
}

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithConstantValueValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "Constant value" value builder',
    async function () {
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

      await render(this);

      const $arguments = this.$('.argumentMapping-field');
      expect($arguments).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach((dataSpec, idx) => {
        expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`arg${idx}:`);
        expect(
          $arguments.eq(idx).find('.valueBuilderType-field .field-component')
          .text().trim()
        ).to.equal('Constant value');
        expect(
          $arguments.eq(idx).find('.valueBuilderConstValue-field .form-control')
        ).to.have.value(`"${idx}"`);
      });
    });
}

// TODO: VFS-7816 uncomment or remove future code
// function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithStoreCredsValueBuilder() {
//   it('fills fields with data about arguments of all possible types, that uses "Store credentials" value builder',
//     async function () {
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

//       await render(this);

//       const $arguments = this.$('.argumentMapping-field');
//       expect($arguments).to.have.length(possibleDataSpecs.length);
//       possibleDataSpecs.forEach((dataSpec, idx) => {
//         expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
//           .to.equal(`arg${idx}:`);
//         expect(
//           $arguments.eq(idx).find('.valueBuilderType-field .field-component')
//           .text().trim()
//         ).to.equal('Store credentials');
//         expect(
//           $arguments.eq(idx).find('.valueBuilderStore-field .field-component')
//           .text().trim()
//         ).to.equal(usedStores[idx].name);
//       });
//     });
// }

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithOnedatafsCredsValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "OnedataFS credentials" value builder',
    async function () {
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

      await render(this);

      const $arguments = this.$('.argumentMapping-field');
      expect($arguments).to.have.length(possibleDataSpecs.length);
      possibleDataSpecs.forEach((dataSpec, idx) => {
        expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`arg${idx}:`);
        expect(
          $arguments.eq(idx).find('.valueBuilderType-field .field-component')
          .text().trim()
        ).to.equal('OnedataFS credentials');
      });
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
    .forEach(({ storeDesc, targetStore, dispatchFunctions }) => {
      it(`fills fields with data about results that uses "${storeDesc}" stores and all possible dispatch methods`,
        async function () {
          this.set(
            'atmLambda.revisionRegistry.1.resultSpecs',
            dispatchFunctions.map((dispatchFunction, idx) => ({
              name: `res${idx}`,
              dataSpec: targetStore.dataSpec,
              isOptional: false,
            }))
          );
          this.set(
            'task.resultMappings',
            dispatchFunctions.map((dispatchFunction, idx) => ({
              resultName: `res${idx}`,
              storeSchemaId: targetStore.id,
              dispatchFunction,
            }))
          );

          await render(this);

          const $results = this.$('.resultMapping-field');
          expect($results).to.have.length(dispatchFunctions.length);
          dispatchFunctions.forEach((dispatchFunction, idx) => {
            expect($results.eq(idx).find('.control-label').eq(0).text().trim())
              .to.equal(`res${idx}:`);
            expect(
              $results.eq(idx).find('.targetStore-field .field-component')
              .text().trim()
            ).to.equal(targetStore.name);
            expect(
              $results.eq(idx).find('.dispatchFunction-field .field-component')
              .text().trim()
            ).to.equal(dispatchFunctionLabels[dispatchFunction]);
          });
        });
    });
}

function itFillsFieldsWithDataAboutResultsThatAreLeftUnassigned() {
  it('fills fields with data about results that are left unassigned',
    async function () {
      this.set('atmLambda.revisionRegistry.1.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        isOptional: false,
      }]);
      this.set('task.resultMappings', []);

      await render(this);

      const $results = this.$('.resultMapping-field');
      expect($results).to.have.length(1);
      expect($results.find('.control-label').eq(0).text().trim()).to.equal('res1:');
      expect(
        $results.find('.targetStore-field .field-component')
        .text().trim()
      ).to.equal('Leave unassigned');
      expect($results.find('.dispatchFunction-field')).to.not.exist;
    });
}
