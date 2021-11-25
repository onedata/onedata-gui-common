import { expect } from 'chai';
import { describe, it } from 'mocha';
import areWorkflowSchemaRevisionsEqual from 'onedata-gui-common/utils/workflow-visualiser/are-workflow-schema-revisions-equal';

describe('Unit | Utility | workflow visualiser/are workflow schema revisions equal', function () {
  it('returns true for two identical revisions', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when dataSpec.valueConstraints changed from {} to empty', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.stores[0].dataSpec.valueConstraints = {};
    delete revision2.stores[0].dataSpec.valueConstraints;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when store.defaultInitialValue changed from null to empty', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.stores[0].defaultInitialValue = null;
    delete revision2.stores[0].defaultInitialValue;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when range store defaultInitialValue changed from defaults to empty values',
    function () {
      const revision1 = getExampleWorkflowSchemaRevision();
      const revision1Store1 = revision1.stores[0];
      revision1Store1.type = 'range';
      revision1Store1.defaultInitialValue = {
        start: 0,
        stop: 10,
        step: 1,
      };
      const revision2 = getExampleWorkflowSchemaRevision();
      const revision2Store1 = revision2.stores[0];
      revision2Store1.type = 'range';
      revision2Store1.defaultInitialValue = {
        stop: 10,
      };
      expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
    });

  it('returns true when stores order changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.stores.reverse();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when argumentMappings order changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].tasks[0].argumentMappings.reverse();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when valueBuilderRecipe changed from null to empty', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.lanes[0].parallelBoxes[0].tasks[0].argumentMappings[0].valueBuilder.valueBuilderRecipe = null;
    delete revision2.lanes[0].parallelBoxes[0].tasks[0].argumentMappings[0].valueBuilder.valueBuilderRecipe;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when resultMappings order changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].tasks[0].resultMappings.reverse();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns false when order of parallel boxes changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes.reverse();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when order of tasks changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].tasks.reverse();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when name of parallel box changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].name = 'xyz';
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when name of task changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].tasks[0].name = 'xyz';
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when one of argument mappings was removed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].tasks[0].argumentMappings.pop();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when one of result mappings was removed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.lanes[0].parallelBoxes[0].tasks[0].resultMappings.pop();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when maxBatchSize of lane changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.lanes[0].storeIteratorSpec.maxBatchSize = 100;
    revision2.lanes[0].storeIteratorSpec.maxBatchSize = 1;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when name of store changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision2.stores[0].name = 'xyz';
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when range store defaultInitialValue changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision1Store1 = revision1.stores[0];
    revision1Store1.type = 'range';
    revision1Store1.defaultInitialValue = {
      start: 0,
      stop: 10,
      step: 1,
    };
    const revision2 = getExampleWorkflowSchemaRevision();
    const revision2Store1 = revision2.stores[0];
    revision2Store1.type = 'range';
    revision2Store1.defaultInitialValue = {
      start: 1,
      stop: 10,
      step: 1,
    };
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });
});

function getExampleWorkflowSchemaRevision() {
  return {
    state: 'stable',
    description: 'desc',
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
