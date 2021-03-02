import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { click, fillIn } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { set } from '@ember/object';
import $ from 'jquery';
import sinon from 'sinon';

const laneActionsSpec = [{
  className: 'move-left-lane-action-trigger',
  label: 'Move left',
  icon: 'move-left',
}, {
  className: 'move-right-lane-action-trigger',
  label: 'Move right',
  icon: 'move-right',
}, {
  className: 'remove-lane-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

describe('Integration | Component | workflow visualiser/lane', function () {
  setupComponentTest('workflow-visualiser/lane', {
    integration: true,
  });

  it('has class "workflow-visualiser-lane"', function () {
    this.render(hbs `{{workflow-visualiser/lane}}`);
    expect(this.$('.workflow-visualiser-lane')).to.exist;
  });

  ['view', 'edit'].forEach(mode => {
    const modeClass = `mode-${mode}`;
    it(`has "${modeClass}" class when in "lane.mode" is "${mode}"`, function () {
      this.set('lane', Lane.create({
        mode,
      }));

      this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

      expect(this.$('.workflow-visualiser-lane')).to.have.class(modeClass);
    });

    it(`shows lane name in "${mode}" mode`, function () {
      const laneName = 'my-lane';
      this.set('lane', Lane.create({
        name: laneName,
        mode,
      }));

      this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

      expect(this.$('.lane-name').text().trim()).to.equal(laneName);
    });
  });

  it('allows to modify lane name in "edit" mode', async function () {
    this.set('lane', Lane.create({
      name: 'my-lane',
      mode: 'edit',
      onModify(lane, { name }) {
        return new Promise(resolve => {
          set(lane, 'name', name);
          resolve();
        });
      },
    }));

    this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);
    await click('.lane-name .one-label');
    await fillIn('.lane-name input', 'new-name');
    await click('.lane-name .save-icon');

    expect(this.$('.lane-name').text().trim()).to.equal('new-name');
  });

  it('does not allow to modify lane name in "view" mode', async function () {
    this.set('lane', Lane.create({
      name: 'my-lane',
      mode: 'view',
    }));

    this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

    // .one-label is a trigger for one-inline-editor
    expect(this.$('.lane-name .one-label')).to.not.exist;
  });

  it('renders actions in "edit" mode', async function () {
    this.set('lane', Lane.create({
      mode: 'edit',
    }));

    this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

    const $actionsTrigger = this.$('.lane-actions-trigger');
    expect($actionsTrigger).to.exist;

    await click($actionsTrigger[0]);

    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(laneActionsSpec.length);
    laneActionsSpec.forEach(({ className, label, icon }, index) => {
      const $action = $actions.eq(index);
      expect($action).to.have.class(className);
      expect($action.text().trim()).to.equal(label);
      expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
    });
  });

  it('does not render actions in "view" mode', function () {
    this.set('lane', Lane.create({
      mode: 'view',
    }));

    this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

    expect(this.$('.lane-actions-trigger')).to.not.exist;
  });

  it('allows to remove lane', async function () {
    const onRemoveSpy = sinon.spy();
    const lane = this.set('lane', Lane.create({
      mode: 'edit',
      onRemove: onRemoveSpy,
    }));
    this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

    await click('.lane-actions-trigger');
    await click($('body .webui-popover.in .remove-lane-action-trigger')[0]);

    expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(lane);
  });

  [
    ['left', -1, 'isFirst'],
    ['right', 1, 'isLast'],
  ].forEach(([direction, moveStep, disablingProp]) => {
    it(`allows to move ${direction} the lane`, async function () {
      const onMoveSpy = sinon.spy();
      const lane = this.set('lane', Lane.create({
        mode: 'edit',
        onMove: onMoveSpy,
      }));
      this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

      await click('.lane-actions-trigger');
      await click($(`body .webui-popover.in .move-${direction}-lane-action-trigger`)[0]);

      expect(onMoveSpy).to.be.calledOnce.and.to.be.calledWith(lane, moveStep);
    });

    it(`disables moving ${direction} the lane when "${disablingProp}" is true`, async function () {
      this.set('lane', Lane.create({
        mode: 'edit',
        [disablingProp]: true,
      }));
      this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

      await click('.lane-actions-trigger');
      const $actionParent =
        $(`body .webui-popover.in .move-${direction}-lane-action-trigger`).parent();

      expect($actionParent).to.have.class('disabled');
    });
  });

  it('renders lane elements', function () {
    const block1 = ParallelBlock.create({ id: 'b1', name: 'block1' });
    const block2 = ParallelBlock.create({ id: 'b2', name: 'block2' });
    this.set('lane', Lane.create({
      elements: [
        InterblockSpace.create({ secondBlock: block1 }),
        block1,
        InterblockSpace.create({ firstBlock: block1, secondBlock: block2 }),
        block2,
        InterblockSpace.create({ firstBlock: block2 }),
      ],
    }));

    this.render(hbs `{{workflow-visualiser/lane visualiserElement=lane}}`);

    const $elements = this.$('.workflow-visualiser-lane-element');
    const $space1Element = $elements.eq(0);
    const $block1Element = $elements.eq(1);
    const $space2Element = $elements.eq(2);
    const $block2Element = $elements.eq(3);
    const $space3Element = $elements.eq(4);
    expect($elements).to.have.length(5);
    expect($space1Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space1Element).to.not.have.attr('data-first-block-id');
    expect($space1Element).to.have.attr('data-second-block-id', 'b1');
    expect($block1Element.text().trim()).to.contain('block1');
    expect($block1Element.is('.workflow-visualiser-parallel-block')).to.be.true;
    expect($space2Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space2Element).to.have.attr('data-first-block-id', 'b1');
    expect($space2Element).to.have.attr('data-second-block-id', 'b2');
    expect($block2Element.text().trim()).to.contain('block2');
    expect($block2Element.is('.workflow-visualiser-parallel-block')).to.be.true;
    expect($space3Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space3Element).to.have.attr('data-first-block-id', 'b2');
    expect($space3Element).to.not.have.attr('data-second-block-id');
  });
});
