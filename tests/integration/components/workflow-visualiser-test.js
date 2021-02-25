import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import _ from 'lodash';
import $ from 'jquery';

const noLanesExample = [];
const twoEmptyLanesExample = generateExample(2, 0, 0);
const twoNonEmptyLanesExample = generateExample(2, 2, 2);

describe('Integration | Component | workflow visualiser', function () {
  setupComponentTest('workflow-visualiser', {
    integration: true,
  });

  beforeEach(function () {
    this.set('changeStub', sinon.stub().resolves());
  });

  it('has class "workflow-visualiser"', function () {
    this.render(hbs `{{workflow-visualiser}}`);

    expect(this.$('.workflow-visualiser')).to.exist;
  });

  it('shows one interlane space when there are no lanes', function () {
    const rawLanes = noLanesExample;

    renderWithRawLanes(this, rawLanes);

    checkRenderingLanes(this, rawLanes);
  });

  itRendersEmptyLanes('shows an empty lane', 1);
  itRendersEmptyLanes('shows two empty lanes', 2);

  it('shows a non-empty lane', function () {
    const rawLanes = twoNonEmptyLanesExample;

    renderWithRawLanes(this, rawLanes);

    checkRenderingLanes(this, rawLanes);
  });

  itAddsNewLane('adds a first lane', noLanesExample, 0);
  itAddsNewLane('adds a lane before the first lane', twoNonEmptyLanesExample, 0);
  itAddsNewLane('adds a lane between existing lanes', twoNonEmptyLanesExample, 1);
  itAddsNewLane('adds a lane after the last lane', twoNonEmptyLanesExample, 2);

  itAddsNewParallelBlock('adds the first parallel block', twoEmptyLanesExample, 0, 0);
  itAddsNewParallelBlock(
    'adds a parallel block before the first parallel block',
    twoNonEmptyLanesExample,
    0
  );
  itAddsNewParallelBlock(
    'adds a parallel block between existing parallel blocks',
    twoNonEmptyLanesExample,
    1
  );
  itAddsNewParallelBlock(
    'adds a parallel block after the last parallel block',
    twoNonEmptyLanesExample,
    2
  );

  itAddsNewTask('adds the first task', generateExample(2, 2, 0), 0);
  itAddsNewTask('adds a task after the last task', twoNonEmptyLanesExample, 2);

  itChangesName(
    'lane',
    `[data-visualiser-element-id="${laneIdFromExample(0)}"] .lane-name`,
    (rawDump, newName) => rawDump[0].name = newName
  );
  itChangesName(
    'parallel block',
    `[data-visualiser-element-id="${parallelBlockIdFromExample(0, 0)}"] .block-name`,
    (rawDump, newName) => rawDump[0].tasks[0].name = newName
  );
  itChangesName(
    'task',
    `[data-visualiser-element-id="${taskIdFromExample(0, 0, 0)}"] .task-name`,
    (rawDump, newName) => rawDump[0].tasks[0].tasks[0].name = newName
  );

  itRemoves(
    'lane',
    `[data-visualiser-element-id="${laneIdFromExample(0)}"] .lane-actions-trigger`,
    '.remove-lane-action-trigger',
    rawDump => rawDump.splice(0, 1)
  );
  itRemoves(
    'parallel block',
    `[data-visualiser-element-id="${parallelBlockIdFromExample(0, 0)}"] .parallel-block-actions-trigger`,
    '.remove-block-action-trigger',
    rawDump => rawDump[0].tasks.splice(0, 1)
  );
  itRemoves(
    'task',
    `[data-visualiser-element-id="${taskIdFromExample(0, 0, 0)}"] .task-actions-trigger`,
    '.remove-task-action-trigger',
    rawDump => rawDump[0].tasks[0].tasks.splice(0, 1)
  );
});

function renderWithRawLanes(testCase, rawLanes) {
  testCase.set('rawLanes', rawLanes);
  testCase.render(hbs `{{workflow-visualiser
    rawLanes=rawLanes
    onChange=changeStub
  }}`);
}

function checkInterblockSpaces(testCase, idsPerLanePerBlock) {
  const $lanes = testCase.$('.workflow-visualiser-lane');
  expect($lanes).to.have.length(idsPerLanePerBlock.length);

  idsPerLanePerBlock.forEach((blockIdAndIdsPerBlock, laneIdx) => {
    const blockIds = blockIdAndIdsPerBlock.map(a => a[0]);
    const idsPerBlock = blockIdAndIdsPerBlock.map(a => a[1]);
    const $blocks = $lanes.eq(laneIdx).find('.workflow-visualiser-parallel-block');
    expect($blocks).to.have.length(idsPerBlock.length);
    const $betweenBlockSpaces = $lanes.eq(laneIdx).find(
      '.workflow-visualiser-interblock-space:not(.workflow-visualiser-parallel-block *)'
    );
    checkInterXSpaces($betweenBlockSpaces, 'block', blockIds);

    idsPerBlock.forEach((ids, blockIdx) => {
      const $innerBlockSpaces =
        $blocks.eq(blockIdx).find('.workflow-visualiser-interblock-space');
      checkInterXSpaces($innerBlockSpaces, 'block', ids);
    });
  });
}

function checkInterlaneSpaces(testCase, ids) {
  checkInterXSpaces(testCase.$('.workflow-visualiser-interlane-space'), 'lane', ids);
}

function checkInterXSpaces($spaces, spaceType, ids) {
  expect($spaces).to.have.length(ids.length + 1);
  let prevLaneId;
  let laneId = ids[0];
  checkInterXSpace($spaces.eq(0), spaceType, prevLaneId, laneId);
  for (let i = 1; i <= ids.length; i++) {
    prevLaneId = laneId;
    laneId = ids[i];
    checkInterXSpace($spaces.eq(i), spaceType, prevLaneId, laneId);
  }
}

function checkInterXSpace($space, spaceType, firstId, secondId) {
  [
    ['first', firstId],
    ['second', secondId],
  ].forEach(([idName, idValue]) => {
    const attrName = `data-${idName}-${spaceType}-id`;
    if (idValue) {
      expect($space).to.have.attr(attrName, idValue);
    } else {
      expect($space).to.not.have.attr(attrName);
    }
  });
}

function itRendersEmptyLanes(message, lanesNumber) {
  it(message, function () {
    const rawLanes = _.times(lanesNumber, i => ({
      id: `l${i}`,
      type: 'lane',
      name: `lane${i}`,
      tasks: [],
    }));

    renderWithRawLanes(this, rawLanes);

    checkRenderingLanes(this, rawLanes);
  });
}

function checkRenderingLanes(testCase, rawLanes) {
  const $lanes = testCase.$('.workflow-visualiser-lane');
  expect($lanes).to.have.length(rawLanes.length);
  rawLanes.forEach(({ name: laneName, tasks: laneTasks }, laneIndex) => {
    const $lane = $lanes.eq(laneIndex);
    expect($lane.find('.lane-name').text().trim()).to.equal(laneName);
    const $blocks = $lane.find('.workflow-visualiser-parallel-block');
    expect($blocks).to.have.length(laneTasks.length);
    laneTasks.forEach(({ name: blockName, tasks: blockTasks }, blockIndex) => {
      const $block = $blocks.eq(blockIndex);
      expect($block.find('.block-name').text().trim()).to.equal(blockName);
      const $tasks = $block.find('.workflow-visualiser-task');
      expect($tasks).to.have.length(blockTasks.length);
      blockTasks.forEach(({ name: taskName }, taskIndex) => {
        const $task = $tasks.eq(taskIndex);
        expect($task.find('.task-name').text().trim()).to.equal(taskName);
      });
    });
  });

  const interblockSpacesSpec = rawLanes.map(({ tasks }) => tasks.map(parallelBlock => [
    parallelBlock.id,
    parallelBlock.tasks.mapBy('id'),
  ]));
  checkInterblockSpaces(testCase, interblockSpacesSpec);
  checkInterlaneSpaces(testCase, rawLanes.mapBy('id'));
}

function itAddsNewLane(message, intitialRawLanes, insertIndex) {
  it(message, async function () {
    renderWithRawLanes(this, intitialRawLanes);

    let extraTriggerSelectorCondition = '';
    if (intitialRawLanes.length) {
      if (insertIndex <= intitialRawLanes.length - 1) {
        extraTriggerSelectorCondition = `[data-second-lane-id="${intitialRawLanes[insertIndex].id}"]`;
      } else {
        extraTriggerSelectorCondition = `[data-first-lane-id="${intitialRawLanes[insertIndex - 1].id}"]`;
      }
    }

    await click(
      `.workflow-visualiser-interlane-space${extraTriggerSelectorCondition} .add-lane-action-trigger`
    );

    const changeStub = this.get('changeStub');
    const newRawLanesMatch = [...intitialRawLanes];
    newRawLanesMatch.splice(insertIndex, 0, {
      id: sinon.match.string,
      type: 'lane',
      name: 'Untitled lane',
      tasks: [],
    });
    expect(changeStub).to.be.calledOnce.and.to.be.calledWith(newRawLanesMatch);
    checkRenderingLanes(this, intitialRawLanes);

    const newRawLanes = changeStub.lastCall.args[0];
    this.set('rawLanes', newRawLanes);
    await wait();

    checkRenderingLanes(this, newRawLanes);
  });
}

function itAddsNewParallelBlock(message, intitialRawLanes, insertIndex) {
  it(message, async function () {
    renderWithRawLanes(this, intitialRawLanes);

    const targetLane = intitialRawLanes[0];
    let addTriggerSelector =
      `[data-visualiser-element-id="${targetLane.id}"] .workflow-visualiser-interblock-space`;
    if (targetLane.tasks.length) {
      if (insertIndex <= targetLane.tasks.length - 1) {
        addTriggerSelector += `[data-second-block-id="${targetLane.tasks[insertIndex].id}"]`;
      } else {
        addTriggerSelector = `[data-first-block-id="${targetLane.tasks[insertIndex - 1].id}"]`;
      }
    }
    addTriggerSelector += ' .add-block-action-trigger';
    await click(addTriggerSelector);

    const changeStub = this.get('changeStub');
    const newRawLanesMatch = _.cloneDeep(intitialRawLanes);
    newRawLanesMatch[0].tasks.splice(insertIndex, 0, {
      id: sinon.match.string,
      type: 'parallelBlock',
      name: 'Parallel block',
      tasks: [],
    });
    expect(changeStub).to.be.calledOnce.and.to.be.calledWith(newRawLanesMatch);
    checkRenderingLanes(this, intitialRawLanes);

    const newRawLanes = changeStub.lastCall.args[0];
    this.set('rawLanes', newRawLanes);
    await wait();

    checkRenderingLanes(this, newRawLanes);
  });
}

function itAddsNewTask(message, intitialRawLanes, insertIndex) {
  it(message, async function () {
    renderWithRawLanes(this, intitialRawLanes);

    const targetBlock = intitialRawLanes[0].tasks[0];
    let addTriggerSelector =
      `[data-visualiser-element-id="${targetBlock.id}"] .workflow-visualiser-interblock-space`;
    if (targetBlock.tasks.length) {
      if (insertIndex <= targetBlock.tasks.length - 1) {
        addTriggerSelector += `[data-second-block-id="${targetBlock.tasks[insertIndex].id}"]`;
      } else {
        addTriggerSelector = `[data-first-block-id="${targetBlock.tasks[insertIndex - 1].id}"]`;
      }
    }
    addTriggerSelector += ' .add-block-action-trigger';
    await click(addTriggerSelector);

    const changeStub = this.get('changeStub');
    const newRawLanesMatch = _.cloneDeep(intitialRawLanes);
    newRawLanesMatch[0].tasks[0].tasks.splice(insertIndex, 0, {
      id: sinon.match.string,
      type: 'task',
      name: 'Untitled task',
    });
    expect(changeStub).to.be.calledOnce.and.to.be.calledWith(newRawLanesMatch);
    checkRenderingLanes(this, intitialRawLanes);

    const newRawLanes = changeStub.lastCall.args[0];
    this.set('rawLanes', newRawLanes);
    await wait();

    checkRenderingLanes(this, newRawLanes);
  });
}

function itChangesName(elementTypeDesc, nameElementSelector, applyUpdate) {
  it(`changes ${elementTypeDesc} name`, async function () {
    const rawLanes = twoNonEmptyLanesExample;
    renderWithRawLanes(this, rawLanes);

    const newName = 'new-name';
    await click(`${nameElementSelector} .one-label`);
    await fillIn(`${nameElementSelector} input`, newName);
    await click(`${nameElementSelector} .save-icon`);

    const changeStub = this.get('changeStub');
    const newRawLanes = _.cloneDeep(rawLanes);
    applyUpdate(newRawLanes, newName);
    expect(changeStub).to.be.calledOnce.and.to.be.calledWith(newRawLanes);
    checkRenderingLanes(this, rawLanes);

    this.set('rawLanes', changeStub.lastCall.args[0]);
    await wait();

    checkRenderingLanes(this, newRawLanes);
  });
}

function itRemoves(
  elementTypeDesc,
  actionsTriggerSelector,
  removeTriggerSelector,
  applyUpdate
) {
  it(`removes ${elementTypeDesc}`, async function () {
    const rawLanes = twoNonEmptyLanesExample;
    renderWithRawLanes(this, rawLanes);

    await click(actionsTriggerSelector);
    await click($(`body .webui-popover.in ${removeTriggerSelector}`)[0]);

    const changeStub = this.get('changeStub');
    const newRawLanes = _.cloneDeep(rawLanes);
    applyUpdate(newRawLanes);
    expect(changeStub).to.be.calledOnce.and.to.be.calledWith(newRawLanes);
    checkRenderingLanes(this, rawLanes);

    this.set('rawLanes', changeStub.lastCall.args[0]);
    await wait();

    checkRenderingLanes(this, newRawLanes);
  });
}

function generateExample(lanesNumber, parallelBlocksPerLane, tasksPerParallelBlock) {
  return _.range(lanesNumber).map(laneNo => ({
    id: laneIdFromExample(laneNo),
    type: 'lane',
    name: `lane${laneNo}`,
    tasks: _.range(parallelBlocksPerLane).map(blockNo => ({
      id: parallelBlockIdFromExample(laneNo, blockNo),
      type: 'parallelBlock',
      name: `block${laneNo}.${blockNo}`,
      tasks: _.range(tasksPerParallelBlock).map(taskNo => ({
        id: taskIdFromExample(laneNo, blockNo, taskNo),
        type: 'task',
        name: `task${laneNo}.${blockNo}.${taskNo}`,
      })),
    })),
  }));
}

function laneIdFromExample(laneNo) {
  return `l${laneNo}`;
}

function parallelBlockIdFromExample(laneNo, blockNo) {
  return `b${laneNo}.${blockNo}`;
}

function taskIdFromExample(laneNo, blockNo, taskNo) {
  return `t${laneNo}.${blockNo}.${taskNo}`;
}
