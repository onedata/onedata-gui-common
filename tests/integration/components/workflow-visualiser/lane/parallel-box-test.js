import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import Task from 'onedata-gui-common/utils/workflow-visualiser/lane/task';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { Promise } from 'rsvp';
import { set, setProperties } from '@ember/object';
import sinon from 'sinon';
import $ from 'jquery';
import { getModalFooter } from '../../../../helpers/modal';

const blockActionsSpec = [{
  className: 'move-up-parallel-box-action-trigger',
  label: 'Move up',
  icon: 'move-up',
}, {
  className: 'move-down-parallel-box-action-trigger',
  label: 'Move down',
  icon: 'move-down',
}, {
  className: 'remove-parallel-box-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | workflow visualiser/lane/parallel box', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('block', ParallelBox.create({
      actionsFactory: ActionsFactory.create({ ownerSource: this.owner }),
    }));
  });

  it('has classes "workflow-visualiser-parallel-box" and "workflow-visualiser-element"', async function () {
    await render(hbs `{{workflow-visualiser/lane/parallel-box}}`);

    expect(this.element.children).to.have.length(1);
    expect($(this.element.children[0])).to.have.class('workflow-visualiser-parallel-box')
      .and.to.have.class('workflow-visualiser-element');
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('block.mode', 'view');
    });

    itShowsName();
    itRendersNestedElements();

    it('does not allow to modify block name', async function (done) {
      this.set('block.name', 'my-block');

      await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

      // .one-label is a trigger for one-inline-editor
      expect(find('.parallel-box-name .one-label')).to.not.exist;
      done();
    });

    it('does not render actions in "view" mode', async function (done) {
      await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

      expect(find('.parallel-box-actions-trigger')).to.not.exist;
      done();
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('block.mode', 'edit');
    });

    itShowsName();
    itRendersNestedElements();

    it('allows to modify block name', async function (done) {
      setProperties(this.get('block'), {
        name: 'my-block',
        onModify(block, { name }) {
          return new Promise(resolve => {
            set(block, 'name', name);
            resolve();
          });
        },
      });
      await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

      await click('.parallel-box-name .one-label');
      await fillIn('.parallel-box-name input', 'new-name');
      await click('.parallel-box-name .save-icon');

      expect(find('.parallel-box-name').textContent.trim()).to.equal('new-name');
      done();
    });

    it('renders actions', async function (done) {
      await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

      const actionsTrigger = find('.parallel-box-actions-trigger');
      expect(actionsTrigger).to.exist;

      await click(actionsTrigger);

      const $actions = $('body .webui-popover.in .actions-popover-content a');
      expect($actions).to.have.length(blockActionsSpec.length);
      blockActionsSpec.forEach(({ className, label, icon }, index) => {
        const $action = $actions.eq(index);
        expect($action).to.have.class(className);
        expect($action.text().trim()).to.equal(label);
        expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
      });
      done();
    });

    [
      ['up', -1, 'isFirst'],
      ['down', 1, 'isLast'],
    ].forEach(([direction, moveStep, disablingProp]) => {
      it(`allows to move ${direction} the block`, async function (done) {
        const onMoveSpy = sinon.stub().resolves();
        this.set('block.onMove', onMoveSpy);
        await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

        await click('.parallel-box-actions-trigger');
        await click($(`body .webui-popover.in .move-${direction}-parallel-box-action-trigger`)[0]);

        expect(onMoveSpy).to.be.calledOnce
          .and.to.be.calledWith(this.get('block'), moveStep);
        done();
      });

      it(`disables moving ${direction} the block when "${disablingProp}" is true`, async function (done) {
        this.set(`block.${disablingProp}`, true);
        await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

        await click('.parallel-box-actions-trigger');
        const $actionParent =
          $(`body .webui-popover.in .move-${direction}-parallel-box-action-trigger`).parent();

        expect($actionParent).to.have.class('disabled');
        done();
      });
    });

    it('allows to remove block', async function (done) {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('block.onRemove', onRemoveSpy);
      await render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane/parallel-box elementModel=block}}
      `);

      await click('.parallel-box-actions-trigger');
      await click($('body .webui-popover.in .remove-parallel-box-action-trigger')[0]);
      await click(getModalFooter().find('.question-yes')[0]);

      expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(this.get('block'));
      done();
    });
  });
});

function itShowsName() {
  it('shows parallel box name', async function (done) {
    const name = 'block1';
    this.set('block.name', name);

    await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

    expect(find('.parallel-box-name').textContent.trim()).to.equal(name);
    done();
  });
}

function itRendersNestedElements() {
  it('renders nested elements', async function (done) {
    const actionsFactory = this.get('block.actionsFactory');
    const task1 = Task.create({ id: 't1', name: 'task1' });
    const task2 = Task.create({ id: 't2', name: 'task2' });
    this.set('block.elements', [
      InterblockSpace.create({ elementAfter: task1, actionsFactory }),
      task1,
      InterblockSpace.create({
        elementBefore: task1,
        elementAfter: task2,
        actionsFactory,
      }),
      task2,
      InterblockSpace.create({ elementBefore: task2, actionsFactory }),
    ]);

    await render(hbs `{{workflow-visualiser/lane/parallel-box elementModel=block}}`);

    const elements =
      findAll('.workflow-visualiser-parallel-box .workflow-visualiser-element');
    const space1Element = elements[0];
    const task1Element = elements[1];
    const space2Element = elements[2];
    const task2Element = elements[3];
    const space3Element = elements[4];
    expect(elements).to.have.length(5);
    expect(space1Element.matches('.workflow-visualiser-interblock-space')).to.be.true;
    expect(space1Element.getAttribute('data-element-before-id')).to.be.null;
    expect(space1Element.getAttribute('data-element-after-id')).to.equal('t1');
    expect(task1Element.textContent).to.contain('task1');
    expect(task1Element.matches('.workflow-visualiser-task')).to.be.true;
    expect(space2Element.matches('.workflow-visualiser-interblock-space')).to.be.true;
    expect(space2Element.getAttribute('data-element-before-id')).to.equal('t1');
    expect(space2Element.getAttribute('data-element-after-id')).to.equal('t2');
    expect(task2Element.textContent).to.contain('task2');
    expect(task2Element.matches('.workflow-visualiser-task')).to.be.true;
    expect(space3Element.matches('.workflow-visualiser-interblock-space')).to.be.true;
    expect(space3Element.getAttribute('data-element-before-id')).to.equal('t2');
    expect(space3Element.getAttribute('data-element-after-id')).to.be.null;
    done();
  });
}
