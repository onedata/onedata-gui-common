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

    itShowsStatus('default');
    itShowsStatus('success');
    itShowsStatus('warning');
    itShowsStatus('error');

    itShowsProgressBarForPercent(0);
    // 25% is a breakpoint when the number of percent is shown in/outside of
    // the progress bar.
    itShowsProgressBarForPercent(24);
    itShowsProgressBarForPercent(26);
    // 55.5 to check rounding to 55%
    itShowsProgressBarForPercent(55.5);
    itShowsProgressBarForPercent(100);

    [
      ['not a number', NaN],
      ['null', null],
      ['undefined', undefined],
    ].forEach(([valueDescription, value]) => {
      it(`does not show progress bar when task "progressPercent" is ${valueDescription}`, function () {
        this.set('task.progressPercent', value);

        render(this);

        expect(this.$('.task-progress-bar')).to.not.exist;
      });
    });
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

    it('allows to remove task', async function () {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('task.onRemove', onRemoveSpy);
      render(this);

      await click('.task-actions-trigger');
      await click($('body .webui-popover.in .remove-task-action-trigger')[0]);
      await click(getModalFooter().find('.question-yes')[0]);

      expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(this.get('task'));
    });

    it('it does not shows progress and status', function () {
      setProperties(this.get('task'), {
        name: 'my-task',
        progressPercent: 20,
        status: 'success',
      });
      render(this);

      expect(this.$('.task-progress-bar')).to.not.exist;
      expect(this.$('.workflow-visualiser-task')).to.not.have.class('status-success');
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

function itShowsProgressBarForPercent(progressPercent) {
  it(`shows progress bar for ${progressPercent}%`, function () {
    this.set('task.progressPercent', progressPercent);

    render(this);

    const $progressBar = this.$('.task-progress-bar');
    expect($progressBar).to.exist;
    expect($progressBar.attr('style')).to.contain(`width: ${progressPercent}%;`);
    if (progressPercent >= 25) {
      expect($progressBar).to.have.class('counter-inside-bar');
    } else {
      expect($progressBar).to.not.have.class('counter-inside-bar');
    }
    expect($progressBar.find('.percent-counter').text().trim())
      .to.equal(`${Math.floor(progressPercent)}%`);
  });
}

function render(testCase) {
  testCase.render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/lane/task elementModel=task}}
  `);
}
