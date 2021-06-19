import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn } from 'ember-native-dom-helpers';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import $ from 'jquery';
import _ from 'lodash';
import { classify } from '@ember/string';

const componentClass = 'task-form';

const dataSpecs = [{
  label: 'Integer',
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
}, {
  label: 'String',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
}, {
  label: 'Object',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'const', 'onedatafsCredentials'],
  canContain: [
    'Any file',
    'Regular file',
    'Directory',
    'Symbolic link',
    'Dataset',
  ],
  // TODO: VFS-7816 uncomment or remove future code
  // valueBuilderTypes: ['iteratedItem', 'const', 'storeCredentials', 'onedatafsCredentials'],
  // canContain: ['Any file', 'Regular file', 'Directory', 'Symbolic link', 'Dataset', 'Archive'],
}, {
  // TODO: VFS-7816 uncomment or remove future code
  //   label: 'Histogram',
  //   dataSpec: {
  //     type: 'histogram',
  //     valueConstraints: {},
  //   },
  //   valueBuilderTypes: ['iteratedItem', 'const'],
  // }, {
  label: 'Any file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'ANY',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
  canContain: ['Regular file', 'Directory', 'Symbolic link'],
}, {
  label: 'Regular file',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'REG',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
}, {
  label: 'Directory',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'DIR',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
}, {
  label: 'Symbolic link',
  dataSpec: {
    type: 'file',
    valueConstraints: {
      fileType: 'SYMLNK',
    },
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
}, {
  label: 'Dataset',
  dataSpec: {
    type: 'dataset',
    valueConstraints: {},
  },
  valueBuilderTypes: ['iteratedItem', 'const'],
  // TODO: VFS-7816 uncomment or remove future code
  // }, {
  //   label: 'Archive',
  //   dataSpec: {
  //     type: 'archive',
  //     valueConstraints: {},
  //   },
  //   valueBuilderTypes: ['iteratedItem', 'const'],
  // }, {
  //   label: 'Single value store cred.',
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
  //   dataSpec: {
  //     type: 'storeCredentials',
  //     valueConstraints: {
  //       storeType: 'range',
  //     },
  //   },
  //   valueBuilderTypes: ['storeCredentials'],
  // }, {
  //   label: 'Histogram store cred.',
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
  const: 'Constant value',
  // storeCredentials: 'Store credentials',
  onedatafsCredentials: 'OnedataFS credentials',
};

const allSimpleDataSpecNames = [
  'Integer',
  'String',
  'Object',
  // TODO: VFS-7816 uncomment or remove future code
  // 'Histogram',
  'Any file',
  'Regular file',
  'Directory',
  'Symbolic link',
  'Dataset',
  // TODO: VFS-7816 uncomment or remove future code
  // 'Archive',
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
    'Any file',
    'Regular file',
    'Directory',
    'Symbolic link',
    'Dataset',
    // TODO: VFS-7816 uncomment or remove future code
    // 'Archive',
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
  //   allowedDataSpecNames: ['Histogram'],
  //   acceptsBatch: true,
  //   dispatchFunctions: ['add'],
  // }, {
  //   type: 'auditLog',
  //   allowedDataSpecNames: allSimpleDataSpecNames,
  //   acceptsBatch: true,
  //   dispatchFunctions: ['add'],
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
      dataSpec: dataSpecs.findBy('label', dataSpecName).dataSpec,
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

const dispatchFunctionLabels = {
  // TODO: VFS-7816 uncomment or remove future code
  // add: 'Add',
  // remove: 'Remove',
  append: 'Append',
  // TODO: VFS-7816 uncomment or remove future code
  // prepend: 'Prepend',
  set: 'Set',
};

const exampleAtmLambda = {
  name: 'function1',
  summary: 'function1 summary',
  argumentSpecs: [{
    name: 'argint',
    dataSpec: {
      type: 'integer',
      valueConstraints: {},
    },
    isOptional: true,
    isBatch: false,
  }, {
    name: 'argstring',
    dataSpec: {
      type: 'string',
      valueConstraints: {},
    },
    isOptional: true,
    isBatch: false,
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
    //   isBatch: false,
    // }, {
    name: 'argodfs',
    dataSpec: {
      type: 'onedatafsCredentials',
      valueConstraints: {},
    },
    isOptional: true,
    isBatch: false,
  }],
  resultSpecs: [{
    name: 'resstring',
    dataSpec: {
      type: 'string',
      valueConstraints: {},
    },
    isBatch: false,
  }, {
    name: 'resanyfile',
    dataSpec: {
      type: 'file',
      valueConstraints: {
        fileType: 'ANY',
      },
    },
    isBatch: false,
  }],
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
    name: 'resstring',
    storeSchemaId: 'singleValueStringId',
    dispatchFunction: 'set',
  }, {
    name: 'resanyfile',
    storeSchemaId: 'treeForestAnyFileId',
    dispatchFunction: 'append',
  }],
};

describe('Integration | Component | workflow visualiser/task form', function () {
  setupComponentTest('workflow-visualiser/task-form', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      atmLambda: _.cloneDeep(exampleAtmLambda),
      stores: _.cloneDeep(allPossibleStores),
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
    itHasAllFieldsEnabledByDefault();
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

      expect(this.$('.name-field .form-control')).to.have.value(exampleAtmLambda.name);
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
          name: exampleAtmLambda.name,
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
        this.set('atmLambda.argumentSpecs', []);

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
      expect($arguments).to.have.length(exampleAtmLambda.argumentSpecs.length);
      exampleAtmLambda.argumentSpecs.forEach(({ name }, idx) => {
        expect($arguments.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`${name}:`);
      });
    });

    dataSpecs.forEach(({ label, dataSpec, valueBuilderTypes }) => {
      it(`provides available value builder types for argument of type "${label}"`,
        async function () {
          this.set('atmLambda.argumentSpecs', [{
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
          this.set('atmLambda.argumentSpecs', [{
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
          this.set('atmLambda.argumentSpecs', [{
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
            this.set('atmLambda.argumentSpecs', [{
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

      if (valueBuilderTypes.includes('const')) {
        it(`allows to setup argument of type "${label}" using "Constant value" value builder`,
          async function () {
            this.set('atmLambda.argumentSpecs', [{
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
      //       this.set('atmLambda.argumentSpecs', [{
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
            this.set('atmLambda.argumentSpecs', [{
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
        this.set('atmLambda.resultSpecs', []);

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
      expect($results).to.have.length(exampleAtmLambda.resultSpecs.length);
      exampleAtmLambda.resultSpecs.forEach(({ name }, idx) => {
        expect($results.eq(idx).find('.control-label').eq(0).text().trim())
          .to.equal(`${name}:`);
      });
    });

    allSimpleDataSpecNames.forEach(dataSpecName => {
      const dataSpec = dataSpecs.findBy('label', dataSpecName).dataSpec;
      const compatibleDataSpecNames = dataSpecs.filter(({ label, canContain }) => {
        return label === dataSpecName || (canContain || []).includes(dataSpecName);
      }).mapBy('label');
      const possibleStores = allPossibleStores.filter(({ name }) =>
        compatibleDataSpecNames.some(compatibleDataSpecName =>
          name.endsWith(`${classify(compatibleDataSpecName)}Store`)
        )
      );
      const sortedPossibleStores = possibleStores.sortBy('name');
      const sortedPossibleStoresWithBatch = sortedPossibleStores.filter(({ type }) =>
        allPossibleStoreSpecs.findBy('type', type).acceptsBatch
      );

      it(`provides available stores for result of type "${dataSpecName}"`,
        async function () {
          this.set('atmLambda.resultSpecs', [{
            name: 'res1',
            dataSpec,
            isBatch: false,
          }]);

          await render(this);
          await clickTrigger('.resultMapping-field .targetStore-field');

          expect(this.$('.targetStore-field .dropdown-field-trigger').text().trim())
            .to.equal('Leave unassigned');
          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(sortedPossibleStores.length + 1);
          expect($options.eq(0).text().trim()).to.equal('Leave unassigned');
          sortedPossibleStores.forEach((store, idx) =>
            expect($options.eq(idx + 1).text().trim()).to.equal(store.name)
          );
        });

      it(`provides available stores for result of batched type "${dataSpecName}"`,
        async function () {
          this.set('atmLambda.resultSpecs', [{
            name: 'res1',
            dataSpec,
            isBatch: true,
          }]);

          await render(this);
          await clickTrigger('.resultMapping-field .targetStore-field');

          expect(this.$('.targetStore-field .dropdown-field-trigger').text().trim())
            .to.equal('Leave unassigned');
          const $options = $('.ember-power-select-option');
          expect($options).to.have.length(sortedPossibleStoresWithBatch.length + 1);
          expect($options.eq(0).text().trim()).to.equal('Leave unassigned');
          sortedPossibleStoresWithBatch.forEach((store, idx) =>
            expect($options.eq(idx + 1).text().trim()).to.equal(store.name)
          );
        });
    });

    it('allows to setup result to be unassigned',
      async function () {
        this.set('atmLambda.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
          isBatch: false,
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

    it('does not allow to choose dispatch function when result store is left unassigned',
      async function () {
        this.set('atmLambda.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
          isBatch: false,
        }]);

        await render(this);

        expect(this.$('.dispatchFunction-field')).to.not.exist;
      });

    allPossibleStoreSpecs
      .filterBy('allowedDataSpecNames.length')
      .forEach(({ type, allowedDataSpecNames, dispatchFunctions }) => {
        const targetStore = allPossibleStores
          .findBy('name', `${type}${classify(allowedDataSpecNames[0])}Store`);
        it(`provides possible dispatch functions for result with store "${type}" attached`,
          async function () {
            this.set('atmLambda.resultSpecs', [{
              name: 'res1',
              dataSpec: targetStore.dataSpec,
              isBatch: false,
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

        dispatchFunctions.forEach(dispatchFunction => {
          it(`allows to setup result to use "${type}" store with "${dispatchFunction}" dispatch function`,
            async function () {
              this.set('atmLambda.resultSpecs', [{
                name: 'res1',
                dataSpec: targetStore.dataSpec,
                isBatch: false,
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
        });
      });

    it('changes available dispatch functions when result store type changes',
      async function () {
        this.set('atmLambda.resultSpecs', [{
          name: 'res1',
          dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
          isBatch: false,
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
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        task: _.cloneDeep(exampleTask),
      });
    });

    itHasModeClass('edit');
    itHasAllFieldsEnabledByDefault();
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
    stores=stores
    isDisabled=isDisabled
    onChange=changeSpy
  }}`);
  await wait();
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

function itHasAllFieldsEnabledByDefault() {
  it('has all fields enabled by default', async function () {
    await render(this);

    expect(getComponent(this)).to.have.class('form-enabled')
      .and.to.not.have.class('form-disabled');
    expect(this.$('.field-disabled')).to.not.exist;
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

    expect(this.$('.atm-lambda-name').text().trim())
      .to.equal(exampleAtmLambda.name);
    expect(this.$('.atm-lambda-summary').text().trim())
      .to.equal(exampleAtmLambda.summary);
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
    expect($arguments).to.have.length(exampleAtmLambda.argumentSpecs.length);
    exampleAtmLambda.argumentSpecs.forEach(({ name }, idx) => {
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
    expect($results).to.have.length(exampleAtmLambda.resultSpecs.length);
    exampleAtmLambda.resultSpecs.forEach(({ name }, idx) => {
      expect($results.eq(idx).find('.control-label').eq(0).text().trim())
        .to.equal(`${name}:`);
    });
    expect(this.$(`.field-${inEditMode ? 'view' : 'edit'}-mode`)).to.not.exist;
  });
}

function itFillsFieldsWithDataAboutArgumentsOfAllTypesWithIteratedItemValueBuilder() {
  it('fills fields with data about arguments of all possible types, that uses "Iterated item" value builder',
    async function () {
      const possibleDataSpecs = dataSpecs
        .filter(({ valueBuilderTypes }) => valueBuilderTypes.includes('iteratedItem'))
        .mapBy('dataSpec');
      this.set('atmLambda.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
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
      this.set('atmLambda.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
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
//       this.set('atmLambda.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
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
      this.set('atmLambda.argumentSpecs', possibleDataSpecs.map((dataSpec, idx) => ({
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
    .forEach(({ type, allowedDataSpecNames, dispatchFunctions }) => {
      it(`fills fields with data about results that uses "${type}" stores and all possible dispatch methods`,
        async function () {
          const targetStore = allPossibleStores
            .findBy('name', `${type}${classify(allowedDataSpecNames[0])}Store`);
          this.set(
            'atmLambda.resultSpecs',
            dispatchFunctions.map((dispatchFunction, idx) => ({
              name: `res${idx}`,
              dataSpec: targetStore.dataSpec,
              isOptional: false,
              isBatch: false,
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
      this.set('atmLambda.resultSpecs', [{
        name: 'res1',
        dataSpec: dataSpecs.findBy('label', 'Integer').dataSpec,
        isOptional: false,
        isBatch: false,
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
