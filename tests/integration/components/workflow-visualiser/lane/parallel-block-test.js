import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { click, fillIn } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { set } from '@ember/object';
import sinon from 'sinon';
import $ from 'jquery';

const blockActionsSpec = [{
  className: 'remove-block-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | workflow visualiser/lane/parallel block', function () {
  setupComponentTest('workflow-visualiser/lane/task', {
    integration: true,
  });

  it('has classes "workflow-visualiser-parallel-block" and "workflow-visualiser-lane-element"', function () {
    this.render(hbs `{{workflow-visualiser/lane/parallel-block}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0)).to.have.class('workflow-visualiser-parallel-block')
      .and.to.have.class('workflow-visualiser-lane-element');
  });

  ['view', 'edit'].forEach(mode => {
    it(`shows name in "${mode}" mode`, function () {
      const name = 'block1';
      this.set('block', ParallelBlock.create({
        name,
        mode,
      }));

      this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

      expect(this.$('.block-name').text().trim()).to.equal(name);
    });
  });

  it('allows to modify block name in "edit" mode', async function () {
    this.set('block', ParallelBlock.create({
      name: 'my-block',
      mode: 'edit',
      onModify(block, { name }) {
        return new Promise(resolve => {
          set(block, 'name', name);
          resolve();
        });
      },
    }));
    this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

    await click('.block-name .one-label');
    await fillIn('.block-name input', 'new-name');
    await click('.block-name .save-icon');

    expect(this.$('.block-name').text().trim()).to.equal('new-name');
  });

  it('does not allow to modify block name in "view" mode', async function () {
    this.set('block', ParallelBlock.create({
      name: 'my-block',
      mode: 'view',
    }));
    this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

    // .one-label is a trigger for one-inline-editor
    expect(this.$('.block-name .one-label')).to.not.exist;
  });

  it('renders actions in "edit" mode', async function () {
    this.set('block', ParallelBlock.create({
      mode: 'edit',
    }));
    this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

    const $actionsTrigger = this.$('.parallel-block-actions-trigger');
    expect($actionsTrigger).to.exist;

    await click($actionsTrigger[0]);

    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(blockActionsSpec.length);
    blockActionsSpec.forEach(({ className, label, icon }, index) => {
      const $action = $actions.eq(index);
      expect($action).to.have.class(className);
      expect($action.text().trim()).to.equal(label);
      expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
    });
  });

  it('does not render actions in "view" mode', function () {
    this.set('block', ParallelBlock.create({
      mode: 'view',
    }));

    this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

    expect(this.$('.parallel-block-actions-trigger')).to.not.exist;
  });

  it('allows to remove block', async function () {
    const onRemoveSpy = sinon.spy();
    const block = this.set('block', ParallelBlock.create({
      mode: 'edit',
      onRemove: onRemoveSpy,
    }));
    this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

    await click('.parallel-block-actions-trigger');
    await click($('body .webui-popover.in .remove-block-action-trigger')[0]);

    expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(block);
  });

  it('renders nested elements', function () {
    const task1 = Task.create({ id: 't1', name: 'task1' });
    const task2 = Task.create({ id: 't2', name: 'task2' });
    this.set('block', ParallelBlock.create({
      elements: [
        InterblockSpace.create({ secondBlock: task1 }),
        task1,
        InterblockSpace.create({ firstBlock: task1, secondBlock: task2 }),
        task2,
        InterblockSpace.create({ firstBlock: task2 }),
      ],
    }));

    this.render(hbs `{{workflow-visualiser/lane/parallel-block laneElement=block}}`);

    const $elements =
      this.$('.workflow-visualiser-parallel-block .workflow-visualiser-lane-element');
    const $space1Element = $elements.eq(0);
    const $task1Element = $elements.eq(1);
    const $space2Element = $elements.eq(2);
    const $task2Element = $elements.eq(3);
    const $space3Element = $elements.eq(4);
    expect($elements).to.have.length(5);
    expect($space1Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space1Element).to.not.have.attr('data-first-block-id');
    expect($space1Element).to.have.attr('data-second-block-id', 't1');
    expect($task1Element.text().trim()).to.contain('task1');
    expect($task1Element.is('.workflow-visualiser-task')).to.be.true;
    expect($space2Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space2Element).to.have.attr('data-first-block-id', 't1');
    expect($space2Element).to.have.attr('data-second-block-id', 't2');
    expect($task2Element.text().trim()).to.contain('task2');
    expect($task2Element.is('.workflow-visualiser-task')).to.be.true;
    expect($space3Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space3Element).to.have.attr('data-first-block-id', 't2');
    expect($space3Element).to.not.have.attr('data-second-block-id');
  });
});
