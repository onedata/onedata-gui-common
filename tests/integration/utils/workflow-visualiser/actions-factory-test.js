import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
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
import ModifyTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-task-action';
import RemoveTaskAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-task-action';
import CreateStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/create-store-action';
import ViewStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-store-action';
import ModifyStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-store-action';
import RemoveStoreAction from 'onedata-gui-common/utils/workflow-visualiser/actions/remove-store-action';
import ModifyWorkflowChartDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-workflow-chart-dashboard-action';
import ViewWorkflowChartDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-workflow-chart-dashboard-action';
import ModifyLaneChartDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/modify-lane-chart-dashboard-action';
import ViewLaneChartDashboardAction from 'onedata-gui-common/utils/workflow-visualiser/actions/view-lane-chart-dashboard-action';
import { get } from '@ember/object';
import sinon from 'sinon';

describe('Integration | Utility | workflow-visualiser/actions-factory', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.factory.destroy();
    this.action.destroy();
  });

  it('creates action "CreateLaneAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const store = Store.create({
      id: 's1',
      name: 'store1',
    });
    this.factory.setWorkflowDataProvider({
      definedStores: [store],
    });
    const createLaneCallback = () => {};

    this.action = this.factory.createCreateLaneAction({ createLaneCallback });

    expect(this.action).to.be.instanceOf(CreateLaneAction);
    expect(get(this.action, 'definedStores').objectAt(0)).to.equal(store);
    expect(get(this.action, 'createStoreAction')).to.be.instanceOf(CreateStoreAction);
    expect(get(this.action, 'createLaneCallback')).to.equal(createLaneCallback);
  });

  it('creates action "ModifyLaneAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const store = Store.create({
      id: 's1',
      name: 'store1',
    });
    this.factory.setWorkflowDataProvider({
      definedStores: [store],
    });
    const lane = Lane.create();

    this.action = this.factory.createModifyLaneAction({ lane });

    expect(this.action).to.be.instanceOf(ModifyLaneAction);
    expect(get(this.action, 'lane')).to.equal(lane);
    expect(get(this.action, 'definedStores').objectAt(0)).to.equal(store);
    expect(get(this.action, 'createStoreAction')).to.be.instanceOf(CreateStoreAction);
  });

  itCreatesLaneAction('ViewLaneAction', ViewLaneAction, true);
  itCreatesLaneAction('MoveLeftLaneAction', MoveLeftLaneAction);
  itCreatesLaneAction('MoveRightLaneAction', MoveRightLaneAction);
  itCreatesLaneAction('ClearLaneAction', ClearLaneAction);
  itCreatesLaneAction('RemoveLaneAction', RemoveLaneAction);

  it('creates action "CreateParallelBoxAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const createParallelBoxCallback = () => {};

    this.action = this.factory.createCreateParallelBoxAction({
      createParallelBoxCallback,
    });

    expect(this.action).to.be.instanceOf(CreateParallelBoxAction);
    expect(get(this.action, 'createParallelBoxCallback'))
      .to.equal(createParallelBoxCallback);
  });

  itCreatesParallelBoxAction('MoveUpParallelBoxAction', MoveUpParallelBoxAction);
  itCreatesParallelBoxAction('MoveDownParallelBoxAction', MoveDownParallelBoxAction);
  itCreatesParallelBoxAction('RemoveParallelBoxAction', RemoveParallelBoxAction);

  it('creates action "CreateTaskAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const store = Store.create({
      id: 's1',
      name: 'store1',
    });
    this.factory.setWorkflowDataProvider({
      definedStores: [store],
    });
    const taskDetailsProviderCallback = () => {};
    this.factory.setGetTaskCreationDataCallback(taskDetailsProviderCallback);
    const createTaskCallback = () => {};

    this.action = this.factory.createCreateTaskAction({ createTaskCallback });

    expect(this.action).to.be.instanceOf(CreateTaskAction);
    expect(get(this.action, 'definedStores').objectAt(0)).to.equal(store);
    expect(get(this.action, 'taskDetailsProviderCallback'))
      .to.equal(taskDetailsProviderCallback);
    expect(get(this.action, 'createTaskCallback')).to.equal(createTaskCallback);
  });

  it('creates action "ModifyTaskAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const store = Store.create({
      id: 's1',
      name: 'store1',
    });
    this.factory.setWorkflowDataProvider({
      definedStores: [store],
    });
    const taskDetailsProviderCallback = () => {};
    this.factory.setGetTaskModificationDataCallback(taskDetailsProviderCallback);
    const task = Task.create();

    this.action = this.factory.createModifyTaskAction({ task });

    expect(this.action).to.be.instanceOf(ModifyTaskAction);
    expect(get(this.action, 'definedStores').objectAt(0)).to.equal(store);
    expect(get(this.action, 'taskDetailsProviderCallback'))
      .to.equal(taskDetailsProviderCallback);
    expect(get(this.action, 'task')).to.equal(task);
  });

  itCreatesTaskAction('RemoveTaskAction', RemoveTaskAction);

  it('creates action "CreateStoreAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const createStoreCallback = () => {};
    this.factory.setCreateStoreCallback(createStoreCallback);

    this.action = this.factory.createCreateStoreAction();

    expect(this.action).to.be.instanceOf(CreateStoreAction);
    expect(get(this.action, 'createStoreCallback')).to.equal(createStoreCallback);
  });

  it('creates action "ViewStoreAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const workflowDataProvider = {
      getStoreContent: sinon.stub().resolves(),
      getStoreContentPresenterContext: sinon.stub().returns('abc'),
    };
    this.factory.setWorkflowDataProvider(workflowDataProvider);
    const store = Store.create();

    this.action = this.factory.createViewStoreAction({ store });

    expect(this.action).to.be.instanceOf(ViewStoreAction);
    expect(get(this.action, 'store')).to.equal(store);
    expect(workflowDataProvider.getStoreContent).to.be.not.called;

    get(this.action, 'getStoreContentCallback')();
    expect(workflowDataProvider.getStoreContent).to.be.calledOnce;
    expect(this.action.storeContentPresenterContext).to.equal('abc');
  });

  itCreatesStoreAction('ModifyStoreAction', ModifyStoreAction);
  itCreatesStoreAction('RemoveStoreAction', RemoveStoreAction);

  it('creates action "ModifyWorkflowChartDashboardAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const workflowDataProvider = {
      workflow: {},
    };
    this.factory.setWorkflowDataProvider(workflowDataProvider);

    this.action = this.factory.createModifyWorkflowChartDashboardAction();

    expect(this.action).to.be.instanceOf(ModifyWorkflowChartDashboardAction);
    expect(get(this.action, 'workflow')).to.equal(workflowDataProvider.workflow);
  });

  it('creates action "ViewWorkflowChartDashboardAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const workflow = {};
    const workflowDataProvider = {
      workflow,
      getStoreContent: sinon.stub().resolves(),
      getTimeSeriesCollectionReferencesMap: sinon.spy(),
    };
    this.factory.setWorkflowDataProvider(workflowDataProvider);

    this.action = this.factory.createViewWorkflowChartDashboardAction();

    expect(this.action).to.be.instanceOf(ViewWorkflowChartDashboardAction);
    expect(get(this.action, 'workflow')).to.equal(workflow);
    expect(workflowDataProvider.getStoreContent).to.be.not.called;
    expect(workflowDataProvider.getTimeSeriesCollectionReferencesMap).to.be.not.called;

    get(this.action, 'getStoreContentCallback')();
    expect(workflowDataProvider.getStoreContent).to.be.calledOnce;

    get(this.action, 'getTimeSeriesCollectionRefsMapCallback')();
    expect(workflowDataProvider.getTimeSeriesCollectionReferencesMap).to.be.calledOnce;
  });

  it('creates action "ModifyLaneChartDashboardAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const lane = Lane.create();

    this.action = this.factory.createModifyLaneChartDashboardAction({ lane });

    expect(this.action).to.be.instanceOf(ModifyLaneChartDashboardAction);
    expect(this.action.lane).to.equal(lane);
  });

  it('creates action "ViewLaneChartDashboardAction"', function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const lane = Lane.create();
    const workflowDataProvider = {
      getStoreContent: sinon.stub().resolves(),
      getTimeSeriesCollectionReferencesMap: sinon.spy(),
    };
    this.factory.setWorkflowDataProvider(workflowDataProvider);

    this.action = this.factory.createViewLaneChartDashboardAction({
      lane,
      runNumber: 2,
    });

    expect(this.action).to.be.instanceOf(ViewLaneChartDashboardAction);
    expect(this.action.lane).to.equal(lane);
    expect(this.action.runNumber).to.equal(2);
    expect(workflowDataProvider.getStoreContent).to.be.not.called;
    expect(workflowDataProvider.getTimeSeriesCollectionReferencesMap).to.be.not.called;

    get(this.action, 'getStoreContentCallback')();
    expect(workflowDataProvider.getStoreContent).to.be.calledOnce;

    get(this.action, 'getTimeSeriesCollectionRefsMapCallback')();
    expect(workflowDataProvider.getTimeSeriesCollectionReferencesMap).to.be.calledOnce;
  });
});

function itCreatesLaneAction(actionName, actionClass, includeStores = false) {
  it(`creates action "${actionName}"`, function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    let store;
    if (includeStores) {
      store = Store.create({
        id: 's1',
        name: 'store1',
      });
      this.factory.setWorkflowDataProvider({
        definedStores: [store],
      });
    }
    const lane = Lane.create();

    this.action = this.factory[`create${actionName}`]({ lane });

    expect(this.action).to.be.instanceOf(actionClass);
    expect(get(this.action, 'lane')).to.equal(lane);
    if (includeStores) {
      expect(get(this.action, 'definedStores').objectAt(0)).to.equal(store);
    }
  });
}

function itCreatesParallelBoxAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const parallelBox = ParallelBox.create();

    this.action = this.factory[`create${actionName}`]({ parallelBox });

    expect(this.action).to.be.instanceOf(actionClass);
    expect(get(this.action, 'parallelBox')).to.equal(parallelBox);
  });
}

function itCreatesTaskAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const task = Task.create();

    this.action = this.factory[`create${actionName}`]({ task });

    expect(this.action).to.be.instanceOf(actionClass);
    expect(get(this.action, 'task')).to.equal(task);
  });
}

function itCreatesStoreAction(actionName, actionClass) {
  it(`creates action "${actionName}"`, function () {
    this.factory = ActionsFactory.create({ ownerSource: this.owner });
    const store = Store.create();

    this.action = this.factory[`create${actionName}`]({ store });

    expect(this.action).to.be.instanceOf(actionClass);
    expect(get(this.action, 'store')).to.equal(store);
  });
}
