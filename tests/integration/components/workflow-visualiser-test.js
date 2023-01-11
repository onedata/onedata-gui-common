// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  settled,
  click,
  fillIn,
  find,
  findAll,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
// TODO: VFS-9129 use scrollTo helper from @ember/test-helpers after upgrading it to 2.0
import { scrollTo } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import _ from 'lodash';
import { htmlSafe } from '@ember/string';
import { dasherize } from '@ember/string';
import { getModalBody, getModalFooter } from '../../helpers/modal';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import { resolve, Promise } from 'rsvp';
import { schedule } from '@ember/runloop';
import dom from 'onedata-gui-common/utils/dom';

const laneWidth = 300;

const idGenerators = {
  lane: laneIdFromExample,
  parallelBox: parallelBoxIdFromExample,
  task: taskIdFromExample,
};

const noLanesExample = generateExample(0, 0, 0);
const twoEmptyLanesExample = generateExample(2, 0, 0);
const twoLanesWithEmptyBlocksExample = generateExample(2, 2, 0);
const twoNonEmptyLanesExample = generateExample(2, 2, 2);
const threeNonEmptyLanesExample = generateExample(3, 3, 2);

describe('Integration | Component | workflow visualiser', function () {
  setupRenderingTest();

  beforeEach(function () {
    const actionsFactory = ActionsFactory.create({ ownerSource: this.owner });
    actionsFactory.setGetTaskCreationDataCallback(
      () => resolve({ name: 'Untitled task' })
    );
    actionsFactory.setGetTaskModificationDataCallback(
      () => resolve({ name: 'othername' })
    );
    this.set('actionsFactory', actionsFactory);
  });

  it('has class "workflow-visualiser"', async function () {
    const rawData = noLanesExample;

    await renderWithRawData(this, rawData);

    expect(find('.workflow-visualiser')).to.exist;
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        changeStub: sinon.stub().callsFake(newData => new Promise(resolve => {
          schedule('afterRender', this, async () => {
            this.set('rawData', newData);
            resolve();
          });
        })),
      });
    });

    itHasModeClass('edit');
    itShowsVisualiserElements();
    itShowsStoresList();

    itAddsNewLane('adds a first lane', noLanesExample, 0);
    itAddsNewLane('adds a lane before the first lane', twoNonEmptyLanesExample, 0);
    itAddsNewLane('adds a lane between existing lanes', twoNonEmptyLanesExample, 1);
    itAddsNewLane('adds a lane after the last lane', twoNonEmptyLanesExample, 2);

    itPerformsCustomAction({
      description: 'adds a lane with store created in place',
      actionExecutor: async () => {
        await click('.workflow-visualiser-interlane-space .create-lane-action-trigger');
        await fillIn(getModalBody().querySelector('.name-field .form-control'), 'lane1');
        await selectChoose(
          getModalBody().querySelector('.sourceStore-field'),
          'Create store...'
        );
        await fillIn(
          getModalBody('store-modal').querySelector('.name-field .form-control'),
          'new store'
        );
        await selectChoose(
          getModalBody('store-modal').querySelector('.data-spec-editor'),
          'Integer'
        );
        await click(getModalFooter('store-modal').querySelector('.btn-submit'));
        await click(getModalFooter().querySelector('.btn-submit'));
      },
      applyUpdate: (rawDump, newDump) => {
        const lastStoreId = newDump.stores[newDump.stores.length - 1].id;
        rawDump.stores.push({
          id: lastStoreId,
          name: 'new store',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: {
              type: 'integer',
              valueConstraints: {},
            },
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        });
        rawDump.lanes.push({
          id: sinon.match.string,
          name: 'lane1',
          maxRetries: 0,
          storeIteratorSpec: {
            storeSchemaId: lastStoreId,
            maxBatchSize: 100,
          },
          parallelBoxes: [],
        });
      },
      initialRawData: noLanesExample,
    });

    itAddsNewParallelBox('adds the first parallel box', twoEmptyLanesExample, 0, 0);
    itAddsNewParallelBox(
      'adds a parallel box before the first parallel box',
      twoNonEmptyLanesExample,
      0
    );
    itAddsNewParallelBox(
      'adds a parallel box between existing parallel boxes',
      twoNonEmptyLanesExample,
      1
    );
    itAddsNewParallelBox(
      'adds a parallel box after the last parallel box',
      twoNonEmptyLanesExample,
      2
    );

    itAddsNewTask('adds the first task', twoLanesWithEmptyBlocksExample, 0);
    itAddsNewTask('adds a task after the last task', twoNonEmptyLanesExample, 2);

    itChangesName('lane', (rawDump, newName) => rawDump.lanes[0].name = newName);
    itChangesName(
      'parallelBox',
      (rawDump, newName) => rawDump.lanes[0].parallelBoxes[0].name = newName
    );
    itChangesName(
      'task',
      (rawDump, newName) => rawDump.lanes[0].parallelBoxes[0].tasks[0].name = newName
    );

    itPerformsCustomAction({
      description: 'modifies lane details',
      actionExecutor: async () => {
        await click(await getActionTrigger('lane', [0], 'modify'));
        await fillIn(
          getModalBody().querySelector('.name-field .form-control'),
          'othername'
        );
        await selectChoose(getModalBody().querySelector('.sourceStore-field'), 'store1');
        await click(getModalFooter().querySelector('.btn-submit'));
      },
      applyUpdate: rawDump => Object.assign(rawDump.lanes[0], {
        name: 'othername',
        maxRetries: 0,
        storeIteratorSpec: {
          storeSchemaId: 's1',
          maxBatchSize: 100,
        },
      }),
      initialRawData: twoEmptyLanesExample,
    });

    itPerformsCustomAction({
      description: 'modifies lane details by creating new store in place and using it as source store',
      actionExecutor: async () => {
        await click(await getActionTrigger('lane', [0], 'modify'));
        await selectChoose(
          getModalBody().querySelector('.sourceStore-field'),
          'Create store...'
        );
        await fillIn(
          getModalBody('store-modal').querySelector('.name-field .form-control'),
          'new store'
        );
        await selectChoose(
          getModalBody('store-modal').querySelector('.data-spec-editor'),
          'Integer'
        );
        await click(getModalFooter('store-modal').querySelector('.btn-submit'));
        await click(getModalFooter().querySelector('.btn-submit'));
      },
      applyUpdate: (rawDump, newDump) => {
        const lastStoreId = newDump.stores[newDump.stores.length - 1].id;
        rawDump.stores.push({
          id: lastStoreId,
          name: 'new store',
          description: '',
          type: 'list',
          config: {
            itemDataSpec: {
              type: 'integer',
              valueConstraints: {},
            },
          },
          defaultInitialContent: null,
          requiresInitialContent: false,
        });
        Object.assign(rawDump.lanes[0], {
          maxRetries: 0,
          storeIteratorSpec: {
            storeSchemaId: lastStoreId,
            maxBatchSize: 100,
          },
        });
      },
      initialRawData: twoEmptyLanesExample,
    });

    itPerformsAction({
      description: 'modifies task details',
      actionTriggerGetter: () => getActionTrigger('task', [0, 0, 0], 'modify'),
      applyUpdate: rawDump => Object.assign(rawDump.lanes[0].parallelBoxes[0].tasks[0], {
        name: 'othername',
      }),
      initialRawData: twoNonEmptyLanesExample,
    });

    itMovesLane('first lane', 0, 'right');
    itMovesLane('middle lane', 1, 'right');
    itDoesNotMoveLane('last lane', 2, 'right');
    itMovesLane('last lane', 2, 'left');
    itMovesLane('middle lane', 1, 'left');
    itDoesNotMoveLane('first lane', 0, 'left');

    itMovesParallelBox('last parallel box', 0, 'down');
    itMovesParallelBox('middle parallel box', 1, 'down');
    itDoesNotMoveParallelBox('last parallel box', 2, 'down');
    itMovesParallelBox('last parallel box', 2, 'up');
    itMovesParallelBox('middle parallel box', 1, 'up');
    itDoesNotMoveParallelBox('last parallel box', 0, 'up');

    itPerformsActionWithConfirmation({
      description: 'clears non-empty lane',
      actionTriggerGetter: () => getActionTrigger('lane', [0], 'clear'),
      applyUpdate: rawDump => rawDump.lanes[0].parallelBoxes.length = 0,
    });
    itDoesNotPerformAction({
      description: 'does not clear empty lane',
      actionTriggerGetter: () => getActionTrigger('lane', [0], 'clear'),
      initialRawData: twoEmptyLanesExample,
    });

    itPerformsActionWithConfirmation({
      description: 'removes lane',
      actionTriggerGetter: () => getActionTrigger('lane', [0], 'remove'),
      applyUpdate: rawDump => rawDump.lanes.splice(0, 1),
    });
    itPerformsActionWithConfirmation({
      description: 'removes parallel box',
      actionTriggerGetter: () => getActionTrigger('parallelBox', [0, 0], 'remove'),
      applyUpdate: rawDump => rawDump.lanes[0].parallelBoxes.splice(0, 1),
    });
    itPerformsActionWithConfirmation({
      description: 'removes task',
      actionTriggerGetter: () => getActionTrigger('task', [0, 0, 0], 'remove'),
      applyUpdate: rawDump => rawDump.lanes[0].parallelBoxes[0].tasks.splice(0, 1),
    });

    itPerformsCustomAction({
      description: 'allows to add new store',
      actionExecutor: async () => {
        await click('.create-store-action-trigger');
        await fillIn(
          getModalBody().querySelector('.name-field .form-control'),
          'newstore'
        );
        await selectChoose(
          getModalBody().querySelector('.data-spec-editor'),
          'Integer'
        );
        await click(getModalFooter().querySelector('.btn-submit'));
      },
      applyUpdate: rawDump => rawDump.stores.push({
        id: sinon.match.string,
        name: 'newstore',
        description: '',
        type: 'list',
        config: {
          itemDataSpec: {
            type: 'integer',
            valueConstraints: {},
          },
        },
        defaultInitialContent: null,
        requiresInitialContent: false,
      }),
      initialRawData: noLanesExample,
    });

    itPerformsCustomAction({
      description: 'allows to modify store',
      actionExecutor: async () => {
        await click('.workflow-visualiser-stores-list-store');
        await fillIn(getModalBody().querySelector('.name-field .form-control'), 'xyz');
        await click(getModalFooter().querySelector('.btn-submit'));
      },
      applyUpdate: rawDump => rawDump.stores.findBy('name', 'store0').name = 'xyz',
      initialRawData: noLanesExample,
    });

    itPerformsActionWithConfirmation({
      description: 'allows to remove store',
      actionTriggerGetter: () => find('.remove-store-action-trigger'),
      applyUpdate: rawDump => rawDump.stores = rawDump.stores.rejectBy('name', 'store0'),
      initialRawData: noLanesExample,
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itHasModeClass('view');
    itShowsVisualiserElements();
    itShowsStoresList();

    it('shows lane details', async function (done) {
      const rawData = twoEmptyLanesExample;

      await renderWithRawData(this, rawData);
      await click(await getActionTrigger('lane', [0], 'view'));

      expect(
        getModalBody().querySelector('.name-field .field-component').textContent.trim()
      ).to.equal('lane0');
      done();
    });

    it('shows store information in modal', async function (done) {
      const rawData = noLanesExample;
      await renderWithRawData(this, rawData);

      await click('.workflow-visualiser-stores-list-store');

      await click(getModalBody().querySelector('.bs-tab-onedata .nav-link'));
      expect(
        getModalBody().querySelector('.name-field .field-component').textContent.trim()
      ).to.equal('store0');
      done();
    });

    it('does not show edition-related elements in empty visualiser', async function (done) {
      const rawData = noLanesExample;

      await renderWithRawData(this, rawData);

      expect(find('.create-lane-action-trigger')).to.not.exist;
      done();
    });

    it('does not allow to change lane name', async function (done) {
      const rawData = twoEmptyLanesExample;

      await renderWithRawData(this, rawData);

      // .one-label is a trigger for one-inline-editor
      expect(find('.lane-name .one-label')).to.not.exist;
      done();
    });

    it('does not show edition-related elements in lanes and interlane spaces', async function (done) {
      const rawData = twoNonEmptyLanesExample;

      await renderWithRawData(this, rawData);
      const modifyTrigger = await getActionTrigger('lane', [0], 'modify');

      expect(modifyTrigger).to.not.exist;
      expect(find('.create-lane-action-trigger')).to.not.exist;
      done();
    });

    it('does not show edition-related elements in empty lane', async function (done) {
      const rawData = twoEmptyLanesExample;

      await renderWithRawData(this, rawData);

      expect(find(
        '.workflow-visualiser-interblock-space .add-block-action-trigger'
      )).to.not.exist;
      done();
    });

    it('does not allow to change parallel box name', async function (done) {
      const rawData = twoEmptyLanesExample;

      await renderWithRawData(this, rawData);

      // .one-label is a trigger for one-inline-editor
      expect(find('.parallel-box-name .one-label')).to.not.exist;
      done();
    });

    it('does not show edition-related elements of parallel boxes and spaces between them',
      async function (done) {
        const rawData = twoNonEmptyLanesExample;

        await renderWithRawData(this, rawData);

        expect(find('.parallel-box-actions-trigger')).to.not.exist;
        expect(find(
          '.workflow-visualiser-interblock-space.between-parallel-box-space .add-block-action-trigger'
        )).to.not.exist;
        done();
      });

    it('does not show edition-related elements in empty parallel box', async function (done) {
      const rawData = twoLanesWithEmptyBlocksExample;

      await renderWithRawData(this, rawData);

      expect(find(
        '.workflow-visualiser-parallel-box .workflow-visualiser-interblock-space .add-block-action-trigger'
      )).to.not.exist;
      done();
    });

    it('does not allow to change task name', async function (done) {
      const rawData = twoEmptyLanesExample;

      await renderWithRawData(this, rawData);

      // .one-label is a trigger for one-inline-editor
      expect(find('.task-name .one-label')).to.not.exist;
      done();
    });

    it('does not show edition-related elements of tasks and spaces between them', async function (done) {
      const rawData = twoNonEmptyLanesExample;

      await renderWithRawData(this, rawData);

      expect(find('.task-actions-trigger')).to.not.exist;
      expect(find(
        '.workflow-visualiser-interblock-space.between-task-space .add-block-action-trigger'
      )).to.not.exist;
      done();
    });
  });

  context('regarding left edge scroll', function () {
    it('does not show scroll button, when there is no overflow', async function (done) {
      await renderForScrollTest(this, 5, laneWidth * 10);

      expect(find('.left-edge-scroll-step-trigger')).to.not.have.class('visible');
      done();
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
    it('does not show scroll button, when there is no overflow', async function (done) {
      await renderForScrollTest(this, 5, laneWidth * 10);

      expect(find('.right-edge-scroll-step-trigger')).to.not.have.class('visible');
      done();
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
  it(message, async function (done) {
    await renderForScrollTest(this, 5, laneWidth * 0.6);
    await scrollToLane(overflowEdge, overflowLane, 10);
    for (const operation of operations) {
      if (operation.startsWith('width:')) {
        const width = Number(operation.slice('width:'.length));
        await changeContainerWidthForScrollTest(this, width);
      } else {
        const scrollTrigger = find(`.${operation}-edge-scroll-step-trigger`);
        expect(scrollTrigger).to.have.class('visible');
        await click(scrollTrigger);
      }
    }

    const lanesContainer = find('.visualiser-elements');
    const lanes = findAll('.workflow-visualiser-lane');
    const targetLane = lanes[laneToCheck];
    if (edgeToCheck === 'left') {
      if (laneToCheck === 0) {
        expect(lanesContainer.scrollLeft).to.equal(0);
      } else {
        expect(dom.offset(targetLane).left).to.be.closeTo(dom.offset(lanesContainer).left, 2);
      }
    } else {
      if (laneToCheck === lanes.length - 1) {
        expect(lanesContainer.scrollLeft).to.be.closeTo(
          lanesContainer.scrollWidth -
          dom.width(lanesContainer, dom.LayoutBox.PaddingBox),
          2
        );
      } else {
        expect(dom.offset(targetLane).left + dom.width(targetLane))
          .to.be.closeTo(dom.offset(lanesContainer).left + dom.width(lanesContainer), 2);
      }
    }
    done();
  });
}

function itHasModeClass(mode) {
  it(`has class "mode-${mode}"`, async function (done) {
    const rawData = noLanesExample;

    await renderWithRawData(this, rawData);

    expect(find('.workflow-visualiser')).to.have.class(`mode-${mode}`);
    done();
  });
}

function itShowsVisualiserElements() {
  it('shows one interlane space when there are no lanes', async function (done) {
    const rawData = noLanesExample;

    await renderWithRawData(this, rawData);

    checkRenderedLanesStructure(rawData);
    done();
  });

  itRendersEmptyLanes('shows an empty lane', 1);
  itRendersEmptyLanes('shows two empty lanes', 2);

  it('shows a non-empty lane', async function (done) {
    const rawData = twoNonEmptyLanesExample;

    await renderWithRawData(this, rawData);

    checkRenderedLanesStructure(rawData);
    done();
  });
}

function itShowsStoresList() {
  it('shows stores list', async function (done) {
    const rawData = noLanesExample;
    const mode = this.get('mode');

    await renderWithRawData(this, rawData);

    const storesList = find('.workflow-visualiser-stores-list');
    expect(storesList).to.exist;
    expect(storesList).to.have.class(`mode-${mode}`);
    checkRenderedStoresList(rawData);
    done();
  });
}

function itRendersEmptyLanes(message, lanesNumber) {
  it(message, async function (done) {
    const rawData = generateExample(lanesNumber, 0, 0);

    await renderWithRawData(this, rawData);

    checkRenderedLanesStructure(rawData);
    done();
  });
}

function itAddsNewLane(message, initialRawData, insertIndex) {
  let extraTriggerSelectorCondition = '';
  const rawLanes = initialRawData.lanes;
  if (rawLanes.length) {
    if (insertIndex <= initialRawData.lanes.length - 1) {
      extraTriggerSelectorCondition = `[data-element-after-id="${rawLanes[insertIndex].id}"]`;
    } else {
      extraTriggerSelectorCondition = `[data-element-before-id="${rawLanes[insertIndex - 1].id}"]`;
    }
  }
  const addTriggerSelector =
    `.workflow-visualiser-interlane-space${extraTriggerSelectorCondition} .create-lane-action-trigger`;

  itPerformsCustomAction({
    description: message,
    actionTriggerGetter: () => find(addTriggerSelector),
    actionExecutor: async () => {
      await click(addTriggerSelector);
      await fillIn(getModalBody().querySelector('.name-field .form-control'), 'lane999');
      await click(getModalFooter().querySelector('.btn-submit'));
    },
    applyUpdate: rawDump => rawDump.lanes.splice(insertIndex, 0, {
      id: sinon.match.string,
      name: 'lane999',
      maxRetries: 0,
      storeIteratorSpec: {
        storeSchemaId: storeIdFromExample(0),
        maxBatchSize: 100,
      },
      parallelBoxes: [],
    }),
    initialRawData,
  });
}

function itAddsNewParallelBox(message, initialRawData, insertIndex) {
  const targetLane = initialRawData.lanes[0];
  let addTriggerSelector =
    `[data-visualiser-element-id="${targetLane.id}"] .workflow-visualiser-interblock-space`;
  if (targetLane.parallelBoxes.length) {
    if (insertIndex <= targetLane.parallelBoxes.length - 1) {
      addTriggerSelector += `[data-element-after-id="${targetLane.parallelBoxes[insertIndex].id}"]`;
    } else {
      addTriggerSelector = `[data-element-before-id="${targetLane.parallelBoxes[insertIndex - 1].id}"]`;
    }
  }
  addTriggerSelector += ' .create-parallel-box-action-trigger';

  itPerformsAction({
    description: message,
    actionTriggerGetter: () => find(addTriggerSelector),
    applyUpdate: rawDump => rawDump.lanes[0].parallelBoxes.splice(insertIndex, 0, {
      id: sinon.match.string,
      name: 'Parallel box',
      tasks: [],
    }),
    initialRawData,
  });
}

function itAddsNewTask(message, initialRawData, insertIndex) {
  const targetBlock = initialRawData.lanes[0].parallelBoxes[0];
  let addTriggerSelector =
    `[data-visualiser-element-id="${targetBlock.id}"] .workflow-visualiser-interblock-space`;
  if (targetBlock.tasks.length) {
    if (insertIndex <= targetBlock.tasks.length - 1) {
      addTriggerSelector += `[data-element-after-id="${targetBlock.tasks[insertIndex].id}"]`;
    } else {
      addTriggerSelector = `[data-element-before-id="${targetBlock.tasks[insertIndex - 1].id}"]`;
    }
  }
  addTriggerSelector += ' .create-task-action-trigger';

  itPerformsAction({
    description: message,
    actionTriggerGetter: () => find(addTriggerSelector),
    applyUpdate: rawDump => rawDump.lanes[0].parallelBoxes[0].tasks.splice(insertIndex, 0, {
      id: sinon.match.string,
      name: 'Untitled task',
    }),
    initialRawData,
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
    initialRawData: twoNonEmptyLanesExample,
  });
}

function itMovesLane(laneName, laneIdx, moveDirection) {
  itPerformsAction({
    description: `moves ${moveDirection} ${laneName}`,
    actionTriggerGetter: () => getActionTrigger('lane', [laneIdx], `move-${moveDirection}`),
    applyUpdate: rawDump => {
      const movedRawLane = rawDump.lanes[laneIdx];
      rawDump.lanes.splice(laneIdx, 1);
      rawDump.lanes.splice(laneIdx + (moveDirection === 'left' ? -1 : 1), 0, movedRawLane);
    },
  });
}

function itDoesNotMoveLane(laneName, laneIdx, moveDirection) {
  itDoesNotPerformAction({
    description: `does not allow to move ${moveDirection} ${laneName}`,
    actionTriggerGetter: () => getActionTrigger('lane', [laneIdx], `move-${moveDirection}`),
  });
}

function itMovesParallelBox(parallelBoxName, blockIdx, moveDirection) {
  itPerformsAction({
    description: `moves ${moveDirection} ${parallelBoxName}`,
    actionTriggerGetter: () => getActionTrigger('parallelBox', [0, blockIdx], `move-${moveDirection}`),
    applyUpdate: rawDump => {
      const blocksArray = rawDump.lanes[0].parallelBoxes;
      const movedRawBlock = blocksArray[blockIdx];
      blocksArray.splice(blockIdx, 1);
      blocksArray.splice(blockIdx + (moveDirection === 'up' ? -1 : 1), 0, movedRawBlock);
    },
  });
}

function itDoesNotMoveParallelBox(parallelBoxName, blockIdx, moveDirection) {
  itDoesNotPerformAction({
    description: `does not allow to move ${moveDirection} ${parallelBoxName}`,
    actionTriggerGetter: () => getActionTrigger('parallelBox', [0, blockIdx], `move-${moveDirection}`),
  });
}

function itPerformsActionWithConfirmation({
  description,
  actionTriggerGetter,
  applyUpdate,
  initialRawData = threeNonEmptyLanesExample,
}) {
  itPerformsCustomAction({
    description,
    actionExecutor: async () => {
      const actionTrigger = await actionTriggerGetter();
      await click(actionTrigger);
      await click(getModalFooter().querySelector('.question-yes'));
    },
    applyUpdate,
    initialRawData,
  });
}

function itPerformsAction({
  description,
  actionTriggerGetter,
  applyUpdate,
  initialRawData = threeNonEmptyLanesExample,
}) {
  itPerformsCustomAction({
    description,
    actionExecutor: async () => {
      const actionTrigger = await actionTriggerGetter();
      await click(actionTrigger);
    },
    applyUpdate,
    initialRawData,
  });
}

function itPerformsCustomAction({
  description,
  actionExecutor,
  applyUpdate,
  initialRawData,
}) {
  it(description, async function (done) {
    await renderWithRawData(this, initialRawData);

    await actionExecutor();

    const changeStub = this.get('changeStub');
    const newRawData = _.cloneDeep(initialRawData);
    applyUpdate(newRawData, changeStub.lastCall.args[0]);
    expect(changeStub).and.to.be.calledWith(newRawData);

    const yieldedRawData = changeStub.lastCall.args[0];
    checkRenderedLanesStructure(yieldedRawData);
    checkRenderedStoresList(yieldedRawData);
    done();
  });
}

function itDoesNotPerformAction({
  description,
  actionTriggerGetter,
  initialRawData = threeNonEmptyLanesExample,
}) {
  it(description, async function (done) {
    await renderWithRawData(this, initialRawData);

    const actionTrigger = await actionTriggerGetter();

    const actionParent = actionTrigger.parentElement;
    expect(actionParent).to.have.class('disabled');
    done();
  });
}

async function renderWithRawData(testCase, rawData) {
  testCase.setProperties({
    rawData,
    initialRawData: _.cloneDeep(rawData),
  });
  await render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser
      mode=mode
      rawData=rawData
      actionsFactory=actionsFactory
      onChange=changeStub
    }}
  `);
}

async function renderForScrollTest(testCase, lanesNumber, containerWidth) {
  testCase.setProperties({
    rawData: generateExample(lanesNumber, 0, 0),
    _window: new WindowStub(),
  });
  await changeContainerWidthForScrollTest(testCase, containerWidth);

  await render(hbs `
    <div style={{containerStyle}}>
      {{workflow-visualiser
        mode="view"
        rawData=rawData
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
  await settled();
  testCase.get('_window').resizeListeners.forEach(f => f());
  await settled();
}

async function getActionTrigger(elementType, elementPath, actionName) {
  const elementTypeForClasses = dasherize(elementType);
  const elementId = idGenerators[elementType](...elementPath);
  await click(`[data-visualiser-element-id="${elementId}"] .${elementTypeForClasses}-actions-trigger`);
  return document.querySelector(
    `.webui-popover.in .${actionName}-${elementTypeForClasses}-action-trigger`
  );
}

async function scrollToLane(overflowSide, targetLaneIdx, offsetPercent = 0) {
  const lanesContainer = find('.visualiser-elements');
  const lanes = findAll('.workflow-visualiser-lane');
  const targetLane = targetLaneIdx >= 0 ? lanes[targetLaneIdx] : null;
  const laneWidth = dom.width(lanes[0]);
  let scrollXPosition;

  if (targetLaneIdx >= lanes.length) {
    scrollXPosition = lanesContainer.scrollWidth;
  } else if (targetLaneIdx < 0) {
    scrollXPosition = 0;
  } else {
    if (overflowSide === 'left') {
      if (targetLaneIdx === 0 && !offsetPercent) {
        scrollXPosition = 0;
      } else {
        const targetLaneOffset = dom.offset(targetLane).left -
          dom.offset(lanesContainer).left;
        scrollXPosition = targetLaneOffset + (offsetPercent / 100) * laneWidth;
      }
    } else {
      if (targetLaneIdx === lanes.length - 1 && !offsetPercent) {
        scrollXPosition = lanesContainer.scrollWidth;
      } else {
        const targetLaneOffset = dom.offset(targetLane).left + dom.width(targetLane) -
          (dom.offset(lanesContainer).left + dom.width(lanesContainer));

        scrollXPosition = targetLaneOffset - (offsetPercent / 100) * laneWidth;
      }
    }
  }
  await scrollTo(lanesContainer, scrollXPosition, 0);
}

function checkRenderedLanesStructure(rawData) {
  const lanes = findAll('.workflow-visualiser-lane');
  expect(lanes).to.have.length(rawData.lanes.length);
  rawData.lanes.forEach(({ name: laneName, parallelBoxes }, laneIndex) => {
    const lane = lanes[laneIndex];
    expect(lane.querySelector('.lane-name').textContent.trim()).to.equal(laneName);
    const blocks = lane.querySelectorAll('.workflow-visualiser-parallel-box');
    expect(blocks).to.have.length(parallelBoxes.length);
    parallelBoxes.forEach(({ name: blockName, tasks }, blockIndex) => {
      const block = blocks[blockIndex];
      expect(block.querySelector('.parallel-box-name').textContent.trim())
        .to.equal(blockName);
      const tasksElems = block.querySelectorAll('.workflow-visualiser-task');
      expect(tasksElems).to.have.length(tasks.length);
      tasks.forEach(({ name: taskName }, taskIndex) => {
        const taskElem = tasksElems[taskIndex];
        expect(taskElem.querySelector('.task-name').textContent.trim())
          .to.equal(taskName);
      });
    });
  });

  checkInterlaneSpaces(rawData);
  checkInterblockSpaces(rawData);
}

function checkInterblockSpaces(rawDump) {
  const lanes = findAll('.workflow-visualiser-lane');
  expect(lanes).to.have.length(rawDump.lanes.length);

  rawDump.lanes.forEach(({ parallelBoxes }, laneIdx) => {
    const parallelBoxIds = parallelBoxes.mapBy('id');
    const taskIdsPerParallelBox = parallelBoxes
      .map(rawParallelBox => rawParallelBox.tasks.mapBy('id'));
    const blocks = lanes[laneIdx].querySelectorAll('.workflow-visualiser-parallel-box');
    expect(blocks).to.have.length(parallelBoxIds.length);
    const betweenBlockSpaces = lanes[laneIdx].querySelectorAll(
      '.lane-elements > .workflow-visualiser-interblock-space'
    );
    checkInterXSpaces(betweenBlockSpaces, parallelBoxIds);

    taskIdsPerParallelBox.forEach((taskIds, blockIdx) => {
      const innerBlockSpaces =
        blocks[blockIdx].querySelectorAll('.workflow-visualiser-interblock-space');
      checkInterXSpaces(innerBlockSpaces, taskIds);
    });
  });
}

function checkInterlaneSpaces(rawDump) {
  checkInterXSpaces(
    findAll('.workflow-visualiser-interlane-space'),
    rawDump.lanes.mapBy('id')
  );
}

function checkInterXSpaces(spaces, ids) {
  expect(spaces).to.have.length(ids.length + 1);
  let prevElementId;
  let elementId = ids[0];
  checkInterXSpace(spaces[0], prevElementId, elementId);
  for (let i = 1; i <= ids.length; i++) {
    prevElementId = elementId;
    elementId = ids[i];
    checkInterXSpace(spaces[i], prevElementId, elementId);
  }
}

function checkInterXSpace(space, beforeId, afterId) {
  [
    ['before', beforeId],
    ['after', afterId],
  ].forEach(([idName, idValue]) => {
    const attrName = `data-element-${idName}-id`;
    if (idValue) {
      expect(space).to.have.attr(attrName, idValue);
    } else {
      expect(space).to.not.have.attr(attrName);
    }
  });
}

function checkRenderedStoresList(rawData) {
  const stores = findAll(
    '.workflow-visualiser-stores-list .workflow-visualiser-stores-list-store'
  );
  expect(stores).to.have.length(rawData.stores.length);
  rawData.stores.sortBy('name').forEach(({ name }, idx) =>
    expect(stores[idx].textContent).to.contain(name)
  );
}

function generateExample(
  lanesNumber,
  parallelBoxsPerLane,
  tasksPerParallelBox
) {
  return {
    lanes: _.range(lanesNumber).map(laneNo => ({
      id: laneIdFromExample(laneNo),
      name: `lane${laneNo}`,
      maxRetries: 0,
      storeIteratorSpec: {
        storeSchemaId: storeIdFromExample(0),
        maxBatchSize: 100,
      },
      parallelBoxes: _.range(parallelBoxsPerLane).map(blockNo => ({
        id: parallelBoxIdFromExample(laneNo, blockNo),
        name: `block${laneNo}.${blockNo}`,
        tasks: _.range(tasksPerParallelBox).map(taskNo => ({
          id: taskIdFromExample(laneNo, blockNo, taskNo),
          name: `task${laneNo}.${blockNo}.${taskNo}`,
        })),
      })),
    })),
    stores: _.range(2).map(storeNo => ({
      id: storeIdFromExample(storeNo),
      name: `store${storeNo}`,
      description: '',
      type: 'list',
      config: {
        itemDataSpec: {
          type: 'integer',
          valueConstraints: {},
        },
      },
      defaultInitialContent: '',
      requiresInitialContent: false,
    })),
  };
}

function laneIdFromExample(laneNo) {
  return `l${laneNo}`;
}

function parallelBoxIdFromExample(laneNo, blockNo) {
  return `b${laneNo}.${blockNo}`;
}

function taskIdFromExample(laneNo, blockNo, taskNo) {
  return `t${laneNo}.${blockNo}.${taskNo}`;
}

function storeIdFromExample(storeNo) {
  return `s${storeNo}`;
}
