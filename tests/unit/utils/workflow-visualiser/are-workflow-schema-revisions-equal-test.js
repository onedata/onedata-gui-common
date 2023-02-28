// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import areWorkflowSchemaRevisionsEqual from 'onedata-gui-common/utils/workflow-visualiser/are-workflow-schema-revisions-equal';

describe('Unit | Utility | workflow-visualiser/are-workflow-schema-revisions-equal', function () {
  it('returns true for two identical revisions', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when config.itemDataSpec.valueConstraints changed from {} to empty', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.stores[0].config.itemDataSpec.valueConstraints = {};
    delete revision2.stores[0].config.itemDataSpec.valueConstraints;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when config changed from {} to empty', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.stores[0].config = {};
    delete revision2.stores[0].config;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when store.defaultInitialContent changed from null to empty', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.stores[0].defaultInitialContent = null;
    delete revision2.stores[0].defaultInitialContent;
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns true when range store defaultInitialContent changed from defaults to empty values',
    function () {
      const revision1 = getExampleWorkflowSchemaRevision();
      const revision1Store1 = revision1.stores[0];
      revision1Store1.type = 'range';
      revision1Store1.defaultInitialContent = {
        start: 0,
        stop: 10,
        step: 1,
      };
      const revision2 = getExampleWorkflowSchemaRevision();
      const revision2Store1 = revision2.stores[0];
      revision2Store1.type = 'range';
      revision2Store1.defaultInitialContent = {
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

  it('returns true when empty storeContentUpdateOptions is omitted in resultMappings', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    delete revision1.lanes[0].parallelBoxes[0].tasks[0].resultMappings[0].storeContentUpdateOptions;
    revision2.lanes[0].parallelBoxes[0].tasks[0].resultMappings[0].storeContentUpdateOptions = {
      type: 'singleValueStoreContentUpdateOptions',
    };
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.true;
  });

  it('returns false when non-empty storeContentUpdateOptions is omitted in resultMappings', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    delete revision1.lanes[0].parallelBoxes[0].tasks[0].resultMappings[1].storeContentUpdateOptions;
    revision2.lanes[0].parallelBoxes[0].tasks[0].resultMappings[1].storeContentUpdateOptions = {
      type: 'treeForestStoreContentUpdateOptions',
      function: 'append',
    };
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns false when non-empty storeContentUpdateOptions changes in resultMappings', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    revision1.lanes[0].parallelBoxes[0].tasks[0].resultMappings[1].storeContentUpdateOptions = {
      type: 'treeForestStoreContentUpdateOptions',
      function: 'append',
    };
    revision2.lanes[0].parallelBoxes[0].tasks[0].resultMappings[1].storeContentUpdateOptions = {
      type: 'treeForestStoreContentUpdateOptions',
      function: 'extend',
    };
    expect(areWorkflowSchemaRevisionsEqual(revision1, revision2)).to.be.false;
  });

  it('returns true when undefined resourceSpecOverride changes to null', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision2 = getExampleWorkflowSchemaRevision();
    delete revision1.lanes[0].parallelBoxes[0].tasks[0].resourceSpecOverride;
    revision2.lanes[0].parallelBoxes[0].tasks[0].resourceSpecOverride = null;
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

  it('returns false when range store defaultInitialContent changed', function () {
    const revision1 = getExampleWorkflowSchemaRevision();
    const revision1Store1 = revision1.stores[0];
    revision1Store1.type = 'range';
    revision1Store1.defaultInitialContent = {
      start: 0,
      stop: 10,
      step: 1,
    };
    const revision2 = getExampleWorkflowSchemaRevision();
    const revision2Store1 = revision2.stores[0];
    revision2Store1.type = 'range';
    revision2Store1.defaultInitialContent = {
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
      requiresInitialContent: false,
      name: 'list int',
      id: 'b4fd4a8b5eb4c28a7a7527ec84b478a7740a38',
      description: '',
      defaultInitialContent: null,
      config: {
        itemDataSpec: {
          valueConstraints: {},
          type: 'number',
        },
      },
    }, {
      type: 'singleValue',
      requiresInitialContent: false,
      name: 'int',
      id: '205cbbbc1aba54432776f44b8ea1ffd50381c5',
      description: '',
      defaultInitialContent: null,
      config: {
        itemDataSpec: {
          valueConstraints: {},
          type: 'number',
        },
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
            storeContentUpdateOptions: {
              type: 'singleValueStoreContentUpdateOptions',
            },
          }, {
            resultName: 'resanyfile',
            storeSchemaId: 'treeForestAnyFileId',
            dispatchFunction: 'append',
            storeContentUpdateOptions: {
              type: 'treeForestStoreContentUpdateOptions',
              function: 'append',
            },
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
