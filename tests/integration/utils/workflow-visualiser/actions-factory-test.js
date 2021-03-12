import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import CreateLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-lane-action';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import MoveRightLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-right-lane-action';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';
import MoveUpParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-up-parallel-block-action';
import MoveDownParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-down-parallel-block-action';
import RemoveParallelBlockAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-block-action';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';
import { get } from '@ember/object';

describe('Integration | Utility | workflow visualiser/actions factory', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  itCreatesLaneAction('MoveLeftLaneAction', MoveLeftLaneAction);
  itCreatesLaneAction('MoveRightLaneAction', MoveRightLaneAction);
  itCreatesLaneAction('ClearLaneAction', ClearLaneAction);
  itCreatesLaneAction('RemoveLaneAction', RemoveLaneAction);

  it('creates action "CreateLaneAction"', function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const createLaneCallback = () => {};

    const action = factory.createCreateLaneAction({ createLaneCallback });

    expect(action).to.be.instanceOf(CreateLaneAction);
    expect(get(action, 'createLaneCallback')).to.equal(createLaneCallback);
  });

  itCreatesParallelBlockAction('MoveUpParallelBlockAction', MoveUpParallelBlockAction);
  itCreatesParallelBlockAction('MoveDownParallelBlockAction', MoveDownParallelBlockAction);
  itCreatesParallelBlockAction('RemoveParallelBlockAction', RemoveParallelBlockAction);

  itCreatesTaskAction('RemoveTaskAction', RemoveTaskAction);
});

function itCreatesLaneAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const lane = Lane.create();

    const action = factory[`create${actionName}`]({ lane });

    expect(action).to.be.instanceOf(actionClass);
    expect(get(action, 'lane')).to.equal(lane);
  });
}

function itCreatesParallelBlockAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const parallelBlock = ParallelBlock.create();

    const action = factory[`create${actionName}`]({ parallelBlock });

    expect(action).to.be.instanceOf(actionClass);
    expect(get(action, 'parallelBlock')).to.equal(parallelBlock);
  });
}

function itCreatesTaskAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const task = Task.create();

    const action = factory[`create${actionName}`]({ task });

    expect(action).to.be.instanceOf(actionClass);
    expect(get(action, 'task')).to.equal(task);
  });
}
