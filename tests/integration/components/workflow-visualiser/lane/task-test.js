import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import { click, fillIn } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { set } from '@ember/object';
import sinon from 'sinon';
import $ from 'jquery';

const taskActionsSpec = [{
  className: 'remove-task-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | workflow visualiser/lane/task', function () {
  setupComponentTest('workflow-visualiser/lane/task', {
    integration: true,
  });

  it('has classes "workflow-visualiser-task" and "workflow-visualiser-lane-element"', function () {
    this.render(hbs `{{workflow-visualiser/lane/task}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0)).to.have.class('workflow-visualiser-task')
      .and.to.have.class('workflow-visualiser-lane-element');
  });

  ['view', 'edit'].forEach(mode => {
    it(`shows task name in "${mode}" mode`, function () {
      const taskName = 'task1';
      this.set('task', Task.create({
        name: taskName,
        mode,
      }));

      this.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);

      expect(this.$('.task-name').text().trim()).to.equal(taskName);
    });
  });

  it('allows to modify task name in "edit" mode', async function () {
    this.set('task', Task.create({
      name: 'my-task',
      mode: 'edit',
      onModify(task, { name }) {
        return new Promise(resolve => {
          set(task, 'name', name);
          resolve();
        });
      },
    }));
    this.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);

    await click('.task-name .one-label');
    await fillIn('.task-name input', 'new-name');
    await click('.task-name .save-icon');

    expect(this.$('.task-name').text().trim()).to.equal('new-name');
  });

  it('does not allow to modify task name in "view" mode', async function () {
    this.set('task', Task.create({
      name: 'my-task',
      mode: 'view',
    }));
    this.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);

    // .one-label is a trigger for one-inline-editor
    expect(this.$('.task-name .one-label')).to.not.exist;
  });

  it('renders actions in "edit" mode', async function () {
    this.set('task', Task.create({
      mode: 'edit',
    }));
    this.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);

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

  it('does not render actions in "view" mode', function () {
    this.set('task', Task.create({
      mode: 'view',
    }));

    this.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);

    expect(this.$('.task-actions-trigger')).to.not.exist;
  });

  it('allows to remove task', async function () {
    const onRemoveSpy = sinon.spy();
    const block = this.set('task', Task.create({
      mode: 'edit',
      onRemove: onRemoveSpy,
    }));
    this.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);

    await click('.task-actions-trigger');
    await click($('body .webui-popover.in .remove-task-action-trigger')[0]);

    expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(block);
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    itShowsStatus('default');
    itShowsStatus('success');
    itShowsStatus('warning');
    itShowsStatus('error');

    itShowsProgressBarForPercent(0);
    // 20% is a breakpoint when the number of percent is shown in/outside of
    // the progress bar.
    itShowsProgressBarForPercent(19);
    itShowsProgressBarForPercent(21);
    // 55.5 to check rounding to 55%
    itShowsProgressBarForPercent(55.5);
    itShowsProgressBarForPercent(100);

    it('does not show progress bar when task "progressPercent" is not a number', function () {
      this.set('task', Task.create({ progressPercent: NaN }));

      render(this);

      expect(this.$('.task-progress-bar')).to.not.exist;
    });
  });
});

function itShowsStatus(status) {
  it(`shows "${status}" status`, function () {
    this.set('task', Task.create({ status }));

    render(this);

    expect(this.$('.workflow-visualiser-task')).to.have.class(`status-${status}`);
  });
}

function itShowsProgressBarForPercent(progressPercent) {
  it(`shows progress bar for ${progressPercent}%`, function () {
    this.set('task', Task.create({ progressPercent }));

    render(this);

    const $progressBar = this.$('.task-progress-bar');
    expect($progressBar).to.exist;
    expect($progressBar.attr('style')).to.contain(`width: ${progressPercent}%;`);
    if (progressPercent >= 20) {
      expect($progressBar).to.have.class('counter-inside-bar');
    } else {
      expect($progressBar).to.not.have.class('counter-inside-bar');
    }
    expect($progressBar.find('.percent-counter').text().trim())
      .to.equal(`${Math.floor(progressPercent)}%`);
  });
}

function render(testCase) {
  testCase.set('task.mode', testCase.get('mode'));
  testCase.render(hbs `{{workflow-visualiser/lane/task laneElement=task}}`);
}
