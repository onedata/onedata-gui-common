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
import { dasherize } from '@ember/string';
import { getModalFooter } from '../../helpers/modal';

const possibleTaskStatuses = ['success', 'warning', 'error'];
const laneWidth = 300;

const idGenerators = {
  lane: laneIdFromExample,
  parallelBlock: parallelBlockIdFromExample,
  task: taskIdFromExample,
};

const noLanesExample = [];
const twoEmptyLanesExample = generateExample(2, 0, 0);
const twoLanesWithEmptyBlocksExample = generateExample(2, 2, 0);
const twoNonEmptyLanesExample = generateExample(2, 2, 2);
const threeNonEmptyLanesExample = generateExample(3, 3, 2);
const threeNonEmptyLanesNoProgressExample = generateExample(3, 3, 2, false);

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

    itAddsNewTask('adds the first task', twoLanesWithEmptyBlocksExample, 0);
    itAddsNewTask('adds a task after the last task', twoNonEmptyLanesExample, 2);

    itChangesName('lane', (rawDump, newName) => rawDump[0].name = newName);
    itChangesName(
      'parallelBlock',
      (rawDump, newName) => rawDump[0].tasks[0].name = newName
    );
    itChangesName(
      'task',
      (rawDump, newName) => rawDump[0].tasks[0].tasks[0].name = newName
    );

    itMovesLane('first lane', 0, 'right');
    itMovesLane('middle lane', 1, 'right');
    itDoesNotMoveLane('last lane', 2, 'right');
    itMovesLane('last lane', 2, 'left');
    itMovesLane('middle lane', 1, 'left');
    itDoesNotMoveLane('first lane', 0, 'left');

    itMovesParallelBlock('last parallel block', 0, 'down');
    itMovesParallelBlock('middle parallel block', 1, 'down');
    itDoesNotMoveParallelBlock('last parallel block', 2, 'down');
    itMovesParallelBlock('last parallel block', 2, 'up');
    itMovesParallelBlock('middle parallel block', 1, 'up');
    itDoesNotMoveParallelBlock('last parallel block', 0, 'up');

    itPerformsActionWithConfirmation({
      description: 'clears non-empty lane',
      actionTriggerGetter: () => getActionTrigger('lane', [0], 'clear'),
      applyUpdate: rawDump => rawDump[0].tasks.length = 0,
    });
    itDoesNotPerformAction({
      description: 'does not clear empty lane',
      actionTriggerGetter: () => getActionTrigger('lane', [0], 'clear'),
      initialRawLanes: twoEmptyLanesExample,
    });

    itPerformsActionWithConfirmation({
      description: 'removes lane',
      actionTriggerGetter: () => getActionTrigger('lane', [0], 'remove'),
      applyUpdate: rawDump => rawDump.splice(0, 1),
    });
    itPerformsActionWithConfirmation({
      description: 'removes parallel block',
      actionTriggerGetter: () => getActionTrigger('parallelBlock', [0, 0], 'remove'),
      applyUpdate: rawDump => rawDump[0].tasks.splice(0, 1),
    });
    itPerformsActionWithConfirmation({
      description: 'removes task',
      actionTriggerGetter: () => getActionTrigger('task', [0, 0, 0], 'remove'),
      applyUpdate: rawDump => rawDump[0].tasks[0].tasks.splice(0, 1),
    });

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

    it('does not show tasks progress when progress is not available', function () {
      const rawLanes = threeNonEmptyLanesNoProgressExample;

      renderWithRawLanes(this, rawLanes);

      checkTasksProgress(this, rawLanes);
    });

    it('shows tasks progress', function () {
      const rawLanes = threeNonEmptyLanesExample;

      renderWithRawLanes(this, rawLanes);

      checkTasksProgress(this, rawLanes);
    });

    it('updates rendered tasks progress', async function () {
      const rawLanes = threeNonEmptyLanesExample;
      renderWithRawLanes(this, rawLanes);

      const updatedRawLanes = _.cloneDeep(rawLanes);
      const firstTask = updatedRawLanes[0].tasks[0].tasks[0];
      const secondTask = updatedRawLanes[0].tasks[0].tasks[1];
      firstTask.progressPercent = (firstTask.progressPercent + 25) % 100;
      secondTask.status = possibleTaskStatuses.without(secondTask.status)[0];
      this.set('rawLanes', updatedRawLanes);
      await wait();

      checkTasksProgress(this, updatedRawLanes);
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
      expect(this.$('.parallel-block-name .one-label')).to.not.exist;
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

    checkRenderedLanesStructure(this, rawLanes);
  });

  itRendersEmptyLanes('shows an empty lane', 1);
  itRendersEmptyLanes('shows two empty lanes', 2);

  it('shows a non-empty lane', function () {
    const rawLanes = twoNonEmptyLanesExample;

    renderWithRawLanes(this, rawLanes);

    checkRenderedLanesStructure(this, rawLanes);
  });
}

function itRendersEmptyLanes(message, lanesNumber) {
  it(message, function () {
    const rawLanes = generateExample(lanesNumber, 0, 0);

    renderWithRawLanes(this, rawLanes);

    checkRenderedLanesStructure(this, rawLanes);
  });
}

function itAddsNewLane(message, initialRawLanes, insertIndex) {
  let extraTriggerSelectorCondition = '';
  if (initialRawLanes.length) {
    if (insertIndex <= initialRawLanes.length - 1) {
      extraTriggerSelectorCondition = `[data-element-after-id="${initialRawLanes[insertIndex].id}"]`;
    } else {
      extraTriggerSelectorCondition = `[data-element-before-id="${initialRawLanes[insertIndex - 1].id}"]`;
    }
  }
  const addTriggerSelector =
    `.workflow-visualiser-interlane-space${extraTriggerSelectorCondition} .add-lane-action-trigger`;

  itPerformsAction({
    description: message,
    actionTriggerGetter: testCase => testCase.$(addTriggerSelector),
    applyUpdate: rawDump => rawDump.splice(insertIndex, 0, {
      id: sinon.match.string,
      type: 'lane',
      name: 'Untitled lane',
      tasks: [],
    }),
    initialRawLanes,
  });
}

function itAddsNewParallelBlock(message, initialRawLanes, insertIndex) {
  const targetLane = initialRawLanes[0];
  let addTriggerSelector =
    `[data-visualiser-element-id="${targetLane.id}"] .workflow-visualiser-interblock-space`;
  if (targetLane.tasks.length) {
    if (insertIndex <= targetLane.tasks.length - 1) {
      addTriggerSelector += `[data-element-after-id="${targetLane.tasks[insertIndex].id}"]`;
    } else {
      addTriggerSelector = `[data-element-before-id="${targetLane.tasks[insertIndex - 1].id}"]`;
    }
  }
  addTriggerSelector += ' .add-block-action-trigger';

  itPerformsAction({
    description: message,
    actionTriggerGetter: testCase => testCase.$(addTriggerSelector),
    applyUpdate: rawDump => rawDump[0].tasks.splice(insertIndex, 0, {
      id: sinon.match.string,
      type: 'parallelBlock',
      name: 'Parallel block',
      tasks: [],
    }),
    initialRawLanes,
  });
}

function itAddsNewTask(message, initialRawLanes, insertIndex) {
  const targetBlock = initialRawLanes[0].tasks[0];
  let addTriggerSelector =
    `[data-visualiser-element-id="${targetBlock.id}"] .workflow-visualiser-interblock-space`;
  if (targetBlock.tasks.length) {
    if (insertIndex <= targetBlock.tasks.length - 1) {
      addTriggerSelector += `[data-element-after-id="${targetBlock.tasks[insertIndex].id}"]`;
    } else {
      addTriggerSelector = `[data-element-before-id="${targetBlock.tasks[insertIndex - 1].id}"]`;
    }
  }
  addTriggerSelector += ' .add-block-action-trigger';

  itPerformsAction({
    description: message,
    actionTriggerGetter: testCase => testCase.$(addTriggerSelector),
    applyUpdate: rawDump => rawDump[0].tasks[0].tasks.splice(insertIndex, 0, {
      id: sinon.match.string,
      type: 'task',
      name: 'Untitled task',
    }),
    initialRawLanes,
  });
}

function itChangesName(elementType, applyUpdate) {
  const newName = 'new-name';
  const nameElementSelector =
    `[data-visualiser-element-id="${idGenerators[elementType](0, 0, 0)}"] .${dasherize(elementType)}-name`;

  itPerformsCustomAction({
    description: `changes ${_.startCase(elementType).toLowerCase()} name`,
    actionExecutor: async () => {
      await click(`${nameElementSelector} .one-label`);
      await fillIn(`${nameElementSelector} input`, newName);
      await click(`${nameElementSelector} .save-icon`);
    },
    applyUpdate: rawDump => applyUpdate(rawDump, newName),
    initialRawLanes: twoNonEmptyLanesExample,
  });
}

function itMovesLane(laneName, laneIdx, moveDirection) {
  itPerformsAction({
    description: `moves ${moveDirection} ${laneName}`,
    actionTriggerGetter: () => getActionTrigger('lane', [laneIdx], `move-${moveDirection}`),
    applyUpdate: rawDump => {
      const movedRawLane = rawDump[laneIdx];
      rawDump.splice(laneIdx, 1);
      rawDump.splice(laneIdx + (moveDirection === 'left' ? -1 : 1), 0, movedRawLane);
    },
  });
}

function itDoesNotMoveLane(laneName, laneIdx, moveDirection) {
  itDoesNotPerformAction({
    description: `does not allow to move ${moveDirection} ${laneName}`,
    actionTriggerGetter: () => getActionTrigger('lane', [laneIdx], `move-${moveDirection}`),
  });
}

function itMovesParallelBlock(parallelBlockName, blockIdx, moveDirection) {
  itPerformsAction({
    description: `moves ${moveDirection} ${parallelBlockName}`,
    actionTriggerGetter: () => getActionTrigger('parallelBlock', [0, blockIdx], `move-${moveDirection}`),
    applyUpdate: rawDump => {
      const blocksArray = rawDump[0].tasks;
      const movedRawBlock = blocksArray[blockIdx];
      blocksArray.splice(blockIdx, 1);
      blocksArray.splice(blockIdx + (moveDirection === 'up' ? -1 : 1), 0, movedRawBlock);
    },
  });
}

function itDoesNotMoveParallelBlock(parallelBlockName, blockIdx, moveDirection) {
  itDoesNotPerformAction({
    description: `does not allow to move ${moveDirection} ${parallelBlockName}`,
    actionTriggerGetter: () => getActionTrigger('parallelBlock', [0, blockIdx], `move-${moveDirection}`),
  });
}

function itPerformsActionWithConfirmation({
  description,
  actionTriggerGetter,
  applyUpdate,
  initialRawLanes = threeNonEmptyLanesExample,
}) {
  itPerformsCustomAction({
    description,
    actionExecutor: async testCase => {
      const $actionTrigger = await actionTriggerGetter(testCase);
      await click($actionTrigger[0]);
      await click(getModalFooter().find('.question-yes')[0]);
    },
    applyUpdate,
    initialRawLanes,
  });
}

function itPerformsAction({
  description,
  actionTriggerGetter,
  applyUpdate,
  initialRawLanes = threeNonEmptyLanesExample,
}) {
  itPerformsCustomAction({
    description,
    actionExecutor: async testCase => {
      const $actionTrigger = await actionTriggerGetter(testCase);
      await click($actionTrigger[0]);
    },
    applyUpdate,
    initialRawLanes,
  });
}

function itPerformsCustomAction({
  description,
  actionExecutor,
  applyUpdate,
  initialRawLanes,
}) {
  it(description, async function () {
    renderWithRawLanes(this, initialRawLanes);

    await actionExecutor(this);

    const changeStub = this.get('changeStub');
    const newRawLanes = _.cloneDeep(initialRawLanes);
    applyUpdate(newRawLanes);
    expect(changeStub).to.be.calledOnce.and.to.be.calledWith(newRawLanes);
    checkRenderedLanesStructure(this, initialRawLanes);

    this.set('rawLanes', changeStub.lastCall.args[0]);
    await wait();

    checkRenderedLanesStructure(this, changeStub.lastCall.args[0]);
  });
}

function itDoesNotPerformAction({
  description,
  actionTriggerGetter,
  initialRawLanes = threeNonEmptyLanesExample,
}) {
  it(description, async function () {
    renderWithRawLanes(this, initialRawLanes);

    const $actionTrigger = await actionTriggerGetter();

    const $actionParent = $actionTrigger.parent();
    expect($actionParent).to.have.class('disabled');
  });
}

function renderWithRawLanes(testCase, rawLanes) {
  testCase.set('rawLanes', rawLanes);
  testCase.render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser
      mode=mode
      rawData=rawLanes
      onChange=changeStub
    }}
  `);
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
        rawData=rawLanes
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

async function getActionTrigger(elementType, elementPath, actionName) {
  const elementTypeForClasses = dasherize(elementType);
  const elementId = idGenerators[elementType](...elementPath);
  await click(`[data-visualiser-element-id="${elementId}"] .${elementTypeForClasses}-actions-trigger`);
  return $(`body .webui-popover.in .${actionName}-${elementTypeForClasses}-action-trigger`);
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

function checkTasksProgress(testCase, rawLanes) {
  const tasks = _.flatten(_.flatten(rawLanes.mapBy('tasks')).mapBy('tasks'));
  tasks.forEach(({ id, status, progressPercent }) => {
    const $task = testCase.$(`[data-visualiser-element-id="${id}"]`);
    expect($task).to.have.class(`status-${status || 'default'}`);
    if (progressPercent !== null) {
      expect($task).to.contain(`${Math.floor(progressPercent)}%`);
    } else {
      expect($task.find('.task-progress-bar')).to.not.exist;
    }
  });
}

function checkRenderedLanesStructure(testCase, rawLanes) {
  const $lanes = testCase.$('.workflow-visualiser-lane');
  expect($lanes).to.have.length(rawLanes.length);
  rawLanes.forEach(({ name: laneName, tasks: laneTasks }, laneIndex) => {
    const $lane = $lanes.eq(laneIndex);
    expect($lane.find('.lane-name').text().trim()).to.equal(laneName);
    const $blocks = $lane.find('.workflow-visualiser-parallel-block');
    expect($blocks).to.have.length(laneTasks.length);
    laneTasks.forEach(({ name: blockName, tasks: blockTasks }, blockIndex) => {
      const $block = $blocks.eq(blockIndex);
      expect($block.find('.parallel-block-name').text().trim()).to.equal(blockName);
      const $tasks = $block.find('.workflow-visualiser-task');
      expect($tasks).to.have.length(blockTasks.length);
      blockTasks.forEach(({ name: taskName }, taskIndex) => {
        const $task = $tasks.eq(taskIndex);
        expect($task.find('.task-name').text().trim()).to.equal(taskName);
      });
    });
  });

  checkInterlaneSpaces(testCase, rawLanes);
  checkInterblockSpaces(testCase, rawLanes);
}

function checkInterblockSpaces(testCase, rawDump) {
  const $lanes = testCase.$('.workflow-visualiser-lane');
  expect($lanes).to.have.length(rawDump.length);

  rawDump.forEach(({ tasks: rawParallelBlocks }, laneIdx) => {
    const parallelBlockIds = rawParallelBlocks.mapBy('id');
    const taskIdsPerParallelBlock = rawParallelBlocks
      .map(rawParallelBlock => rawParallelBlock.tasks.mapBy('id'));
    const $blocks = $lanes.eq(laneIdx).find('.workflow-visualiser-parallel-block');
    expect($blocks).to.have.length(parallelBlockIds.length);
    const $betweenBlockSpaces = $lanes.eq(laneIdx).find(
      '.workflow-visualiser-interblock-space:not(.workflow-visualiser-parallel-block *)'
    );
    checkInterXSpaces($betweenBlockSpaces, parallelBlockIds);

    taskIdsPerParallelBlock.forEach((taskIds, blockIdx) => {
      const $innerBlockSpaces =
        $blocks.eq(blockIdx).find('.workflow-visualiser-interblock-space');
      checkInterXSpaces($innerBlockSpaces, taskIds);
    });
  });
}

function checkInterlaneSpaces(testCase, rawDump) {
  checkInterXSpaces(
    testCase.$('.workflow-visualiser-interlane-space'),
    rawDump.mapBy('id')
  );
}

function checkInterXSpaces($spaces, ids) {
  expect($spaces).to.have.length(ids.length + 1);
  let prevElementId;
  let elementId = ids[0];
  checkInterXSpace($spaces.eq(0), prevElementId, elementId);
  for (let i = 1; i <= ids.length; i++) {
    prevElementId = elementId;
    elementId = ids[i];
    checkInterXSpace($spaces.eq(i), prevElementId, elementId);
  }
}

function checkInterXSpace($space, beforeId, afterId) {
  [
    ['before', beforeId],
    ['after', afterId],
  ].forEach(([idName, idValue]) => {
    const attrName = `data-element-${idName}-id`;
    if (idValue) {
      expect($space).to.have.attr(attrName, idValue);
    } else {
      expect($space).to.not.have.attr(attrName);
    }
  });
}

function generateExample(
  lanesNumber,
  parallelBlocksPerLane,
  tasksPerParallelBlock,
  includeProgress = true
) {
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
        status: includeProgress ?
          getTaskStatusFromExample(laneNo, blockNo, taskNo) : null,
        progressPercent: includeProgress ?
          getTaskProgressFromExample(laneNo, blockNo, taskNo) : null,
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

function getTaskProgressFromExample(laneNo, blockNo, taskNo) {
  return (laneNo * 10 + blockNo * 5 + taskNo) % 100 + 1;
}

function getTaskStatusFromExample(laneNo, blockNo, taskNo) {
  return possibleTaskStatuses[(laneNo + blockNo + taskNo) % 3];
}
