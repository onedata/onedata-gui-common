import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import CreateLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-lane-action';
import ModifyLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-lane-action';
import ViewLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-lane-action';
import MoveLeftLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-left-lane-action';
import MoveRightLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-right-lane-action';
import ClearLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/clear-lane-action';
import RemoveLaneAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-lane-action';
import CreateParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-parallel-box-action';
import MoveUpParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-up-parallel-box-action';
import MoveDownParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/move-down-parallel-box-action';
import RemoveParallelBoxAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-parallel-box-action';
import CreateTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-task-action';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';
import CreateStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-store-action';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import ModifyStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-store-action';
import RemoveStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-store-action';
import { get } from '@ember/object';

describe('Integration | Utility | workflow visualiser/actions factory', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('creates action "CreateLaneAction"', function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const store = Store.create({
      id: 's1',
      name: 'store1',
    });
    factory.registerWorkflowDataProvider({
      stores: [store],
    });
    const createLaneCallback = () => {};

    const action = factory.createCreateLaneAction({ createLaneCallback });

    expect(action).to.be.instanceOf(CreateLaneAction);
    expect(get(action, 'stores').objectAt(0)).to.equal(store);
    expect(get(action, 'createLaneCallback')).to.equal(createLaneCallback);
  });

  itCreatesLaneAction('ModifyLaneAction', ModifyLaneAction, true);
  itCreatesLaneAction('ViewLaneAction', ViewLaneAction, true);
  itCreatesLaneAction('MoveLeftLaneAction', MoveLeftLaneAction);
  itCreatesLaneAction('MoveRightLaneAction', MoveRightLaneAction);
  itCreatesLaneAction('ClearLaneAction', ClearLaneAction);
  itCreatesLaneAction('RemoveLaneAction', RemoveLaneAction);

  it('creates action "CreateParallelBoxAction"', function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const createParallelBoxCallback = () => {};

    const action = factory.createCreateParallelBoxAction({
      createParallelBoxCallback,
    });

    expect(action).to.be.instanceOf(CreateParallelBoxAction);
    expect(get(action, 'createParallelBoxCallback'))
      .to.equal(createParallelBoxCallback);
  });

  itCreatesParallelBoxAction('MoveUpParallelBoxAction', MoveUpParallelBoxAction);
  itCreatesParallelBoxAction('MoveDownParallelBoxAction', MoveDownParallelBoxAction);
  itCreatesParallelBoxAction('RemoveParallelBoxAction', RemoveParallelBoxAction);

  it('creates action "CreateTaskAction"', function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const createTaskCallback = () => {};

    const action = factory.createCreateTaskAction({ createTaskCallback });

    expect(action).to.be.instanceOf(CreateTaskAction);
    expect(get(action, 'createTaskCallback')).to.equal(createTaskCallback);
  });

  itCreatesTaskAction('RemoveTaskAction', RemoveTaskAction);

  it('creates action "CreateStoreAction"', function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const createStoreCallback = () => {};

    const action = factory.createCreateStoreAction({ createStoreCallback });

    expect(action).to.be.instanceOf(CreateStoreAction);
    expect(get(action, 'createStoreCallback')).to.equal(createStoreCallback);
  });

  itCreatesStoreAction('ViewStoreAction', ViewStoreAction);
  itCreatesStoreAction('ModifyStoreAction', ModifyStoreAction);
  itCreatesStoreAction('RemoveStoreAction', RemoveStoreAction);
});

function itCreatesLaneAction(actionName, actionClass, includeStores = false) {
  it(`creates action "${actionName}"`, function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    let store;
    if (includeStores) {
      store = Store.create({
        id: 's1',
        name: 'store1',
      });
      factory.registerWorkflowDataProvider({
        stores: [store],
      });
    }
    const lane = Lane.create();

    const action = factory[`create${actionName}`]({ lane });

    expect(action).to.be.instanceOf(actionClass);
    expect(get(action, 'lane')).to.equal(lane);
    if (includeStores) {
      expect(get(action, 'stores').objectAt(0)).to.equal(store);
    }
  });
}

function itCreatesParallelBoxAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const parallelBox = ParallelBox.create();

    const action = factory[`create${actionName}`]({ parallelBox });

    expect(action).to.be.instanceOf(actionClass);
    expect(get(action, 'parallelBox')).to.equal(parallelBox);
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

function itCreatesStoreAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    const factory = ActionsFactory.create({ ownerSource: this });
    const store = Store.create();

    const action = factory[`create${actionName}`]({ store });

    expect(action).to.be.instanceOf(actionClass);
    expect(get(action, 'store')).to.equal(store);
  });
}
