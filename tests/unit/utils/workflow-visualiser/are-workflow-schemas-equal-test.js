import { expect } from 'chai';
import { describe, it } from 'mocha';
import areWorkflowSchemasEqual from 'onedata-gui-common/utils/workflow-visualiser/are-workflow-schemas-equal';

describe('Unit | Utility | workflow visualiser/are workflow schemas equal', function () {
  it('returns true for two identical schemas', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when dataSpec.valueConstraints changed from {} to empty', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    delete schema2.stores[0].dataSpec.valueConstraints;
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when store.defaultInitialValue changed from null to empty', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    delete schema2.stores[0].defaultInitialValue;
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when range store defaultInitialValue changed from defaults to empty values',
    function () {
      const schema1 = getExampleWorkflowSchema();
      const schema1Store1 = schema1.stores[0];
      schema1Store1.type = 'range';
      schema1Store1.defaultInitialValue = {
        start: 0,
        stop: 10,
        step: 1,
      };
      const schema2 = getExampleWorkflowSchema();
      const schema2Store1 = schema2.stores[0];
      schema2Store1.type = 'range';
      schema2Store1.defaultInitialValue = {
        stop: 10,
      };
      expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
    });

  it('returns true when stores order changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.stores.reverse();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when batchSize was added to lane without batch iterator', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].storeIteratorSpec.strategy.batchSize = 100;
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when argumentMappings order changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].tasks[0].argumentMappings.reverse();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when valueBuilderRecipe changed from null to empty', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema1.lanes[0].parallelBoxes[0].tasks[0].argumentMappings[0].valueBuilder.valueBuilderRecipe = null;
    delete schema2.lanes[0].parallelBoxes[0].tasks[0].argumentMappings[0].valueBuilder.valueBuilderRecipe;
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns true when resultMappings order changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].tasks[0].resultMappings.reverse();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.true;
  });

  it('returns false when order of parallel boxes changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes.reverse();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when order of tasks changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].tasks.reverse();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when name of parallel box changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].name = 'xyz';
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when name of task changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].tasks[0].name = 'xyz';
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when one of argument mappings was removed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].tasks[0].argumentMappings.pop();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when one of result mappings was removed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.lanes[0].parallelBoxes[0].tasks[0].resultMappings.pop();
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when batchSize in lane with batch iterator changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema1.lanes[0].storeIteratorSpec.strategy = {
      type: 'batch',
      batchSize: 100,
    };
    schema2.lanes[0].storeIteratorSpec.strategy = {
      type: 'batch',
      batchSize: 101,
    };
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when name of store changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema2 = getExampleWorkflowSchema();
    schema2.stores[0].name = 'xyz';
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });

  it('returns false when range store defaultInitialValue changed', function () {
    const schema1 = getExampleWorkflowSchema();
    const schema1Store1 = schema1.stores[0];
    schema1Store1.type = 'range';
    schema1Store1.defaultInitialValue = {
      start: 0,
      stop: 10,
      step: 1,
    };
    const schema2 = getExampleWorkflowSchema();
    const schema2Store1 = schema2.stores[0];
    schema2Store1.type = 'range';
    schema2Store1.defaultInitialValue = {
      start: 1,
      stop: 10,
      step: 1,
    };
    expect(areWorkflowSchemasEqual(schema1, schema2)).to.be.false;
  });
});

function getExampleWorkflowSchema() {
  return {
    stores: [{
      type: 'list',
      requiresInitialValue: false,
      name: 'list int',
      id: 'b4fd4a8b5eb4c28a7a7527ec84b478a7740a38',
      description: '',
      defaultInitialValue: null,
      dataSpec: {
        valueConstraints: {},
        type: 'integer',
      },
    }, {
      type: 'singleValue',
      requiresInitialValue: false,
      name: 'int',
      id: '205cbbbc1aba54432776f44b8ea1ffd50381c5',
      description: '',
      defaultInitialValue: null,
      dataSpec: {
        valueConstraints: {},
        type: 'integer',
      },
    }],
    lanes: [{
      storeIteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 'b4fd4a8b5eb4c28a7a7527ec84b478a7740a38',
      },
      parallelBoxes: [{
        tasks: [{
          name: 'l1',
          lambdaId: '31b8a0737f8afda44af62d3f3eb6ec85ch2cee',
          id: '076b87640fdbb41795306d5793b17a5c6991d1',
          argumentMappings: [{
            valueBuilder: {
              valueBuilderType: 'iteratedItem',
              valueBuilderRecipe: null,
            },
            argumentName: 'file',
          }, {
            valueBuilder: {
              valueBuilderType: 'const',
              valueBuilderRecipe: {
                file_id: 'asdf',
              },
            },
            argumentName: 'file2',
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
        }, {
          name: 'l2',
          lambdaId: '31badf737f8afda44af62d3f3eb6ec85ch2cee',
          id: '076b87640fdbbadf95306d5793b17a5c6991d1',
          argumentMappings: [],
          resultMappings: [],
        }],
        name: 'Parallel box',
        id: 'b953b4a70ba483b76bb7f70e66285ed872d021',
      }, {
        name: 'Parallel box',
        id: 'b953b4a70ba483b76b23450e66285ed872d021',
      }],
      name: 'l1',
      id: '856f7efdd8063a9cb4a35b39855736fde2ac5f',
    }],
  };
}
