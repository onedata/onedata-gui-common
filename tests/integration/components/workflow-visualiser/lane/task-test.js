import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { click, fillIn } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { set, setProperties } from '@ember/object';
import sinon from 'sinon';
import $ from 'jquery';
import { getModalFooter } from '../../../../helpers/modal';

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
  setupComponentTest('workflow-visualiser/lane/task', {
    integration: true,
  });

  beforeEach(function () {
    this.set('task', Task.create({
      actionsFactory: ActionsFactory.create({ ownerSource: this }),
    }));
  });

  it('has classes "workflow-visualiser-task" and "workflow-visualiser-element"', function () {
    render(this);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0)).to.have.class('workflow-visualiser-task')
      .and.to.have.class('workflow-visualiser-element');
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('task.mode', 'view');
    });

    itShowsTaskName();

    it('does not allow to modify task name', async function () {
      this.set('task.name', 'my-task');
      render(this);

      // .one-label is a trigger for one-inline-editor
      expect(this.$('.task-name .one-label')).to.not.exist;
    });

    it('does not render actions', function () {
      render(this);

      expect(this.$('.task-actions-trigger')).to.not.exist;
    });

    itShowsStatus('pending');
    itShowsStatus('active');
    itShowsStatus('finished');
    itShowsStatus('failed');
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('task.mode', 'edit');
    });

    itShowsTaskName();

    it('allows to modify task name', async function () {
      setProperties(this.get('task'), {
        name: 'my-task',
        onModify(task, { name }) {
          return new Promise(resolve => {
            set(task, 'name', name);
            resolve();
          });
        },
      });
      render(this);

      await click('.task-name .one-label');
      await fillIn('.task-name input', 'new-name');
      await click('.task-name .save-icon');

      expect(this.$('.task-name').text().trim()).to.equal('new-name');
    });

    it('renders actions', async function () {
      render(this);

      const $actionsTrigger = this.$('.task-actions-trigger');
      expect($actionsTrigger).to.exist;

      await click($actionsTrigger[0]);

      const $actions = $('body .webui-popover.in .actions-popover-content a');
      expect($actions).to.have.length(taskActionsSpec.length);
      taskActionsSpec.forEach(({ className, label, icon }, index) => {
        const $action = $actions.eq(index);
        expect($action).to.have.class(className);
        expect($action.text().trim()).to.equal(label);
        expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
    });

    it('allows to modify task', async function () {
      const taskDiff = { name: 'someName' };
      const detailsProviderStub = sinon.stub().resolves(taskDiff);
      this.get('task.actionsFactory')
        .registerGetTaskModificationDataCallback(detailsProviderStub);
      const onModifySpy = sinon.stub().resolves();
      this.set('task.onModify', onModifySpy);
      render(this);

      await click('.task-actions-trigger');
      await click($('body .webui-popover.in .modify-task-action-trigger')[0]);

      expect(detailsProviderStub).to.be.calledWith({
        stores: sinon.match.any,
        task: this.get('task'),
      });
      expect(onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('task'), taskDiff);
    });

    it('allows to remove task', async function () {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('task.onRemove', onRemoveSpy);
      render(this);

      await click('.task-actions-trigger');
      await click($('body .webui-popover.in .remove-task-action-trigger')[0]);
      await click(getModalFooter().find('.question-yes')[0]);

      expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(this.get('task'));
    });

    it('it does not show status', function () {
      setProperties(this.get('task'), {
        name: 'my-task',
        status: 'finished',
      });
      render(this);

      expect(this.$('.workflow-visualiser-task')).to.not.have.class('status-finished');
    });
  });
});

function itShowsTaskName() {
  it('shows task name', function () {
    const taskName = 'task1';
    this.set('task.name', taskName);

    render(this);

    expect(this.$('.task-name').text().trim()).to.equal(taskName);
  });
}

function itShowsStatus(status) {
  it(`shows "${status}" status`, function () {
    this.set('task.status', status);

    render(this);

    expect(this.$('.workflow-visualiser-task')).to.have.class(`status-${status}`);
  });
}

function render(testCase) {
  testCase.render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/lane/task elementModel=task}}
  `);
}
