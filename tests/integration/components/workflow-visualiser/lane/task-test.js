import { expect } from 'chai';
import {
  describe,
  it,
  context,
  before,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  fillIn,
  find,
  findAll,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { Promise, resolve } from 'rsvp';
import { set, setProperties } from '@ember/object';
import sinon from 'sinon';
import { getModalFooter } from '../../../../helpers/modal';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';

const taskActionsSpec = [{
  className: 'modify-task-action-trigger',
  label: 'Modify',
  icon: 'rename',
}, {
  className: 'remove-task-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | workflow visualiser/lane/task', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('task', Task.create({
      actionsFactory: ActionsFactory.create({ ownerSource: this.owner }),
    }));
  });

  it('has classes "workflow-visualiser-task" and "workflow-visualiser-element"', async function () {
    await renderComponent();

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('workflow-visualiser-task')
      .and.to.have.class('workflow-visualiser-element');
  });

  context('in "view" mode', function () {
    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      CopyRecordIdAction.create();
    });

    beforeEach(function () {
      this.set('task.mode', 'view');
    });

    afterEach(function () {
      // Reset stubbed actions
      if (CopyRecordIdAction.prototype.execute.restore) {
        CopyRecordIdAction.prototype.execute.restore();
      }
    });

    itShowsTaskName();

    it('does not allow to modify task name', async function (done) {
      this.set('task.name', 'my-task');
      await renderComponent();

      // .one-label is a trigger for one-inline-editor
      expect(find('.task-name .one-label')).to.not.exist;
      done();
    });

    it('does not render actions', async function (done) {
      await renderComponent();

      expect(find('.task-actions-trigger')).to.not.exist;
      done();
    });

    it('has collapsed details section by default', async function (done) {
      await renderComponent();

      expect(find('.task-details-collapse')).to.not.have.class('in');
      done();
    });

    it('expands details section on task click', async function (done) {
      await renderComponent();
      await expandDetails();

      expect(find('.task-details-collapse')).to.have.class('in');
      done();
    });

    it('shows task details values', async function (done) {
      setProperties(this.get('task'), {
        instanceId: 'someId',
        runsRegistry: {
          1: {
            runNumber: 1,
            status: 'pending',
            itemsInProcessing: 1,
            itemsProcessed: 2,
            itemsFailed: 3,
          },
        },
      });
      await renderComponent();
      await expandDetails();

      const entries = findAll('.detail-entry');
      [
        ['instance-id', 'Instance ID', 'someId'],
        ['status', 'Status', 'Pending'],
        ['items-in-processing', 'In processing', '1'],
        ['items-processed', 'Processed', '2'],
        ['items-failed', 'Failed', '3'],
      ].forEach(([classNameElement, label, value], idx) => {
        const entry = entries[idx];
        expect(entry).to.have.class(`${classNameElement}-detail`);
        expect(entry.querySelector('.detail-label').textContent.trim())
          .to.equal(`${label}:`);
        expect(entry.querySelector('.detail-value').textContent.trim())
          .to.equal(value);
      });
      done();
    });

    itShowsStatus('pending', 'Pending');
    itShowsStatus('active', 'Active');
    itShowsStatus('stopping', 'Stopping');
    itShowsStatus('interrupted', 'Interrupted');
    itShowsStatus('paused', 'Paused');
    itShowsStatus('cancelled', 'Cancelled');
    itShowsStatus('skipped', 'Skipped');
    itShowsStatus('finished', 'Finished');
    itShowsStatus('failed', 'Failed');
    itShowsStatus('unknown', 'Unknown');

    it('allows to copy task instance id', async function (done) {
      const executeStub = sinon.stub(
        CopyRecordIdAction.prototype,
        'execute'
      ).callsFake(function () {
        expect(this.get('context.record.entityId')).to.equal('someId');
        return resolve({ status: 'done' });
      });
      this.set('task.instanceId', 'someId');
      await renderComponent();
      await expandDetails();

      await click('.copy-record-id-action-trigger');

      expect(executeStub).to.be.calledOnce;
      done();
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('task.mode', 'edit');
    });

    itShowsTaskName();

    it('allows to modify task name', async function (done) {
      setProperties(this.get('task'), {
        name: 'my-task',
        onModify(task, { name }) {
          return new Promise(resolve => {
            set(task, 'name', name);
            resolve();
          });
        },
      });
      await renderComponent();

      await click('.task-name .one-label');
      await fillIn('.task-name input', 'new-name');
      await click('.task-name .save-icon');

      expect(find('.task-name').textContent.trim()).to.equal('new-name');
      done();
    });

    it('renders actions', async function (done) {
      await renderComponent();

      const actionsTrigger = find('.task-actions-trigger');
      expect(actionsTrigger).to.exist;

      await click(actionsTrigger);

      const actions =
        document.querySelectorAll('.webui-popover.in .actions-popover-content a');
      expect(actions).to.have.length(taskActionsSpec.length);
      taskActionsSpec.forEach(({ className, label, icon }, index) => {
        const action = actions[index];
        expect(action).to.have.class(className);
        expect(action.textContent.trim()).to.equal(label);
        expect(action.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
      done();
    });

    it('allows to modify task', async function (done) {
      const taskDiff = { name: 'someName' };
      const detailsProviderStub = sinon.stub().resolves(taskDiff);
      this.get('task.actionsFactory')
        .setGetTaskModificationDataCallback(detailsProviderStub);
      const onModifySpy = sinon.stub().resolves();
      this.set('task.onModify', onModifySpy);
      await renderComponent();

      await click('.task-actions-trigger');
      await click(
        document.querySelector('.webui-popover.in .modify-task-action-trigger')
      );

      expect(detailsProviderStub).to.be.calledWith({
        definedStores: sinon.match.any,
        task: this.get('task'),
      });
      expect(onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('task'), taskDiff);
      done();
    });

    it('allows to remove task', async function (done) {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('task.onRemove', onRemoveSpy);
      await renderComponent();

      await click('.task-actions-trigger');
      await click(
        document.querySelector('body .webui-popover.in .remove-task-action-trigger')
      );
      await click(getModalFooter().querySelector('.question-yes'));

      expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(this.get('task'));
      done();
    });

    it('it does not show status', async function (done) {
      setProperties(this.get('task'), {
        name: 'my-task',
        status: 'finished',
      });
      await renderComponent();

      expect(find('.workflow-visualiser-task')).to.not.have.class('status-finished');
      done();
    });
  });
});

function itShowsTaskName() {
  it('shows task name', async function (done) {
    const taskName = 'task1';
    this.set('task.name', taskName);

    await renderComponent();

    expect(find('.task-name').textContent.trim()).to.equal(taskName);
    done();
  });
}

function itShowsStatus(status, statusTranslation) {
  it(`shows "${status}" status`, async function (done) {
    this.set('task.status', status);

    await renderComponent();
    await expandDetails();

    expect(find('.workflow-visualiser-task')).to.have.class(`status-${status}`);
    expect(find('.status-detail .detail-value').textContent.trim())
      .to.equal(statusTranslation);
    done();
  });
}

async function renderComponent() {
  await render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/lane/task elementModel=task}}
  `);
}

async function expandDetails() {
  await click('.draggable-task');
}
