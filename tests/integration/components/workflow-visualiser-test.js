import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import _ from 'lodash';
import $ from 'jquery';
import { htmlSafe } from '@ember/string';

const noLanesExample = [];
const twoEmptyLanesExample = generateExample(2, 0, 0);
const twoLanesWithEmptyBlocksExample = generateExample(2, 2, 0);
const twoNonEmptyLanesExample = generateExample(2, 2, 2);

const laneWidth = 300;

describe('Integration | Component | workflow visualiser', function () {
  setupComponentTest('workflow-visualiser', {
    integration: true,
  });

  it('has class "workflow-visualiser"', function () {
    const rawLanes = noLanesExample;

    renderWithRawLanes(this, rawLanes);

    expect(this.$('.workflow-visualiser')).to.exist;
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        changeStub: sinon.stub().resolves(),
      });
    });

    itHasModeClass('edit');
    itShowsVisualiserElements();

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

    it('does not show tasks progress', function () {
      const rawLanes = twoNonEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$('.task-progress-bar')).to.not.exist;
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itHasModeClass('view');
    itShowsVisualiserElements();

    it('shows tasks progress', function () {
      const rawLanes = twoNonEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);
      // TODO VFS-7330 add detailed tests when progress will be calculated
      expect(this.$('.task-progress-bar')).to.exist;
    });

    it('does not show edition-related elements in empty visualiser', function () {
      const rawLanes = noLanesExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$('.add-lane-action-trigger')).to.not.exist;
    });

    it('does not allow to change lane name', function () {
      const rawLanes = twoEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      // .one-label is a trigger for one-inline-editor
      expect(this.$('.lane-name .one-label')).to.not.exist;
    });

    it('does not show edition-related elements in lanes and interlane spaces', function () {
      const rawLanes = twoNonEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$('.lane-actions-trigger')).to.not.exist;
      expect(this.$('.add-lane-action-trigger')).to.not.exist;
    });

    it('does not show edition-related elements in empty lane', function () {
      const rawLanes = twoEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$(
        '.workflow-visualiser-interblock-space .add-block-action-trigger'
      )).to.not.exist;
    });

    it('does not allow to change parallel block name', function () {
      const rawLanes = twoEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      // .one-label is a trigger for one-inline-editor
      expect(this.$('.block-name .one-label')).to.not.exist;
    });

    it('does not show edition-related elements of parallel blocks and spaces between them', function () {
      const rawLanes = twoNonEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$('.parallel-block-actions-trigger')).to.not.exist;
      expect(this.$(
        '.workflow-visualiser-interblock-space.between-parallel-blocks-space .add-block-action-trigger'
      )).to.not.exist;
    });

    it('does not show edition-related elements in empty parallel block', function () {
      const rawLanes = twoLanesWithEmptyBlocksExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$(
        '.workflow-visualiser-parallel-block .workflow-visualiser-interblock-space .add-block-action-trigger'
      )).to.not.exist;
    });

    it('does not allow to change task name', function () {
      const rawLanes = twoEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      // .one-label is a trigger for one-inline-editor
      expect(this.$('.task-name .one-label')).to.not.exist;
    });

    it('does not show edition-related elements of tasks and spaces between them', function () {
      const rawLanes = twoNonEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      expect(this.$('.task-actions-trigger')).to.not.exist;
      expect(this.$(
        '.workflow-visualiser-interblock-space.between-task-space .add-block-action-trigger'
      )).to.not.exist;
    });
  });

  context('regarding left edge scroll', function () {
    it('does not show scroll button, when there is no overflow', function () {
      renderForScrollTest(this, 5, laneWidth * 10);

      expect(this.$('.left-edge-scroll-step-trigger')).to.not.have.class('visible');
    });

    itScrollsToLane(
      'scrolls via button to the start, when overflow is on the first lane',
      ['left', 0],
      ['left'],
      ['left', 0]
    );
    itScrollsToLane(
      'scrolls via button to the second lane, when overflow is on the second lane',
      ['left', 1],
      ['left'],
      ['left', 1]
    );
    itScrollsToLane(
      'scrolls via button to the third lane on double scroll, when overflow is on the fourth lane',
      ['left', 3],
      ['left', 'left'],
      ['left', 2]
    );
    itScrollsToLane(
      'scrolls via button to the fourth lane on scroll, when overflow is on the fifth lane and container becomes wider',
      ['left', 4],
      [`width:${laneWidth * 1.3}`, 'left'],
      ['left', 3]
    );
  });

  context('regarding right edge scroll', function () {
    it('does not show scroll button, when there is no overflow', function () {
      renderForScrollTest(this, 5, laneWidth * 10);

      expect(this.$('.right-edge-scroll-step-trigger')).to.not.have.class('visible');
    });

    itScrollsToLane(
      'scrolls via button to the end, when overflow is on the last lane',
      ['right', 4],
      ['right'],
      ['right', 4]
    );
    itScrollsToLane(
      'scrolls via button to the second lane from the end, when overflow is on the second lane from the end',
      ['right', 3],
      ['right'],
      ['right', 3]
    );
    itScrollsToLane(
      'scrolls via button to the third lane from the end on double scroll, when overflow is on the fourth lane from the end',
      ['right', 1],
      ['right', 'right'],
      ['right', 2]
    );
    itScrollsToLane(
      'scrolls via button to the fourth lane from the end on scroll, when overflow is on the fifth lane from the end and container becomes wider',
      ['right', 0],
      [`width:${laneWidth * 1.3}`, 'right'],
      ['right', 1]
    );
  });

  context('regarding both edges scroll', function () {
    itScrollsToLane(
      'scrolls via button back to the second lane on double right scroll and double left scroll, when overflow is on the second lane',
      ['left', 1],
      ['right', 'right', 'left', 'left'],
      ['left', 1]
    );
    itScrollsToLane(
      'scrolls via button back to the fourth lane on double left scroll and double right scroll, when overflow is on the fourth lane',
      ['right', 3],
      ['left', 'left', 'right', 'right'],
      ['right', 3]
    );
  });
});

class WindowStub {
  constructor() {
    this.resizeListeners = [];
  }

  addEventListener(eventName, listener) {
    if (eventName === 'resize') {
      this.resizeListeners.push(listener);
    }
  }

  removeEventListener() {}
}

function renderWithRawLanes(testCase, rawLanes) {
  testCase.set('rawLanes', rawLanes);
  testCase.render(hbs `{{workflow-visualiser
    mode=mode
    rawLanes=rawLanes
    onChange=changeStub
  }}`);
}

function renderForScrollTest(testCase, lanesNumber, containerWidth) {
  testCase.setProperties({
    rawLanes: generateExample(lanesNumber, 0, 0),
    _window: new WindowStub(),
  });
  changeContainerWidthForScrollTest(testCase, containerWidth);

  testCase.render(hbs `
    <div style={{containerStyle}}>
      {{workflow-visualiser
        mode="view"
        rawLanes=rawLanes
        _window=_window
      }}
    </div>
  `);
}

async function changeContainerWidthForScrollTest(testCase, newWidth) {
  testCase.set(
    'containerStyle',
    htmlSafe(`min-width: ${newWidth}px; max-width: ${newWidth}px`)
  );
  await wait();
  testCase.get('_window').resizeListeners.forEach(f => f());
  await wait();
}

function itScrollsToLane(message, [overflowEdge, overflowLane], operations, [edgeToCheck, laneToCheck]) {
  it(message, async function () {
    renderForScrollTest(this, 5, laneWidth * 0.6);

    await scrollToLane(this, overflowEdge, overflowLane, 10);

    for (let operation of operations) {
      if (operation.startsWith('width:')) {
        const width = Number(operation.slice('width:'.length));
        await changeContainerWidthForScrollTest(this, width);
      } else {
        const $scrollTrigger = this.$(`.${operation}-edge-scroll-step-trigger`);
        expect($scrollTrigger).to.have.class('visible');
        await click($scrollTrigger[0]);
      }
    }

    const $lanesContainer = this.$('.visualiser-elements');
    const $lanes = this.$('.workflow-visualiser-lane');
    const $targetLane = $lanes.eq(laneToCheck);
    if (edgeToCheck === 'left') {
      if (laneToCheck === 0) {
        expect($lanesContainer.scrollLeft()).to.equal(0);
      } else {
        expect($targetLane.offset().left).to.be.closeTo($lanesContainer.offset().left, 1);
      }
    } else {
      if (laneToCheck === $lanes.length - 1) {
        expect($lanesContainer.scrollLeft())
          .to.be.closeTo($lanesContainer.prop('scrollWidth') - $lanesContainer.width(), 1);
      } else {
        expect($targetLane.offset().left + $targetLane.width())
          .to.be.closeTo($lanesContainer.offset().left + $lanesContainer.width(), 1);
      }
    }
  });
}

async function scrollToLane(testCase, overflowSide, targetLane, offsetPercent = 0) {
  const $lanesContainer = testCase.$('.visualiser-elements');
  const $lanes = testCase.$('.workflow-visualiser-lane');
  const $targetLane = targetLane >= 0 ? $lanes.eq(targetLane) : null;
  const laneWidth = $lanes.width();
  let scrollXPosition;

  if (targetLane >= $lanes.length) {
    scrollXPosition = $lanesContainer.prop('scrollWidth');
  } else if (targetLane < 0) {
    scrollXPosition = 0;
  } else {
    if (overflowSide === 'left') {
      if (targetLane === 0 && !offsetPercent) {
        scrollXPosition = 0;
      } else {
        const targetLaneOffset = $targetLane.offset().left -
          $lanesContainer.offset().left;
        scrollXPosition = targetLaneOffset + (offsetPercent / 100) * laneWidth;
      }
    } else {
      if (targetLane === $lanes.length - 1 && !offsetPercent) {
        scrollXPosition = $lanesContainer.prop('scrollWidth');
      } else {
        const targetLaneOffset = $targetLane.offset().left + $targetLane.width() -
          ($lanesContainer.offset().left + $lanesContainer.width());

        scrollXPosition = targetLaneOffset - (offsetPercent / 100) * laneWidth;
      }
    }
  }

  $lanesContainer.scrollLeft(scrollXPosition);
  await wait();
}

function itHasModeClass(mode) {
  it(`has class "mode-${mode}"`, function () {
    const rawLanes = noLanesExample;

    renderWithRawLanes(this, rawLanes);

    expect(this.$('.workflow-visualiser')).to.have.class(`mode-${mode}`);
  });
}

function itShowsVisualiserElements() {
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
