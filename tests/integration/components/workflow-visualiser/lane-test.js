import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import ParallelBlock from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-block';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { click, fillIn } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { get, set, setProperties } from '@ember/object';
import $ from 'jquery';
import sinon from 'sinon';
import { getModalBody, getModalFooter } from '../../../helpers/modal';

const editLaneActionsSpec = [{
  className: 'modify-lane-action-trigger',
  label: 'Modify',
  icon: 'rename',
}, {
  className: 'move-left-lane-action-trigger',
  label: 'Move left',
  icon: 'move-left',
}, {
  className: 'move-right-lane-action-trigger',
  label: 'Move right',
  icon: 'move-right',
}, {
  className: 'clear-lane-action-trigger',
  label: 'Clear',
  icon: 'remove',
}, {
  className: 'remove-lane-action-trigger',
  label: 'Remove',
  icon: 'x',
}];

const viewLaneActionsSpec = [{
  className: 'view-lane-action-trigger',
  label: 'View details',
  icon: 'browser-info',
}];

describe('Integration | Component | workflow visualiser/lane', function () {
  setupComponentTest('workflow-visualiser/lane', {
    integration: true,
  });

  beforeEach(function () {
    const actionsFactory = ActionsFactory.create({ ownerSource: this });
    actionsFactory.registerWorkflowDataProvider({
      stores: [
        Store.create({
          id: 's1',
          name: 'store1',
        }),
        Store.create({
          id: 's2',
          name: 'store2',
        }),
      ],
    });
    this.set('lane', Lane.create({
      actionsFactory,
      name: 'lane1',
      iteratorSpec: {
        strategy: {
          type: 'serial',
        },
        storeSchemaId: 's1',
      },
    }));
  });

  it('has class "workflow-visualiser-lane"', function () {
    this.render(hbs `{{workflow-visualiser/lane}}`);
    expect(this.$('.workflow-visualiser-lane')).to.exist;
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('lane.mode', 'view');
    });

    itShowsName();
    itRendersLaneElements();
    itRendersActions(viewLaneActionsSpec);

    it('does not allow to modify lane name', async function () {
      this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

      // .one-label is a trigger for one-inline-editor
      expect(this.$('.lane-name .one-label')).to.not.exist;
    });

    it('allows to show lane details', async function () {
      this.render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click($('body .webui-popover.in .view-lane-action-trigger')[0]);

      expect(getModalBody().find('.name-field .field-component').text().trim())
        .to.equal('lane1');
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('lane.mode', 'edit');
    });

    itShowsName();
    itRendersLaneElements();
    itRendersActions(editLaneActionsSpec);

    it('allows to modify lane name', async function () {
      setProperties(this.get('lane'), {
        name: 'my-lane',
        onModify(lane, { name }) {
          return new Promise(resolve => {
            set(lane, 'name', name);
            resolve();
          });
        },
      });

      this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);
      await click('.lane-name .one-label');
      await fillIn('.lane-name input', 'new-name');
      await click('.lane-name .save-icon');

      expect(this.$('.lane-name').text().trim()).to.equal('new-name');
    });

    it('allows to modify lane details', async function () {
      const onModifySpy = sinon.stub().resolves();
      this.set('lane.onModify', onModifySpy);
      this.render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click($('body .webui-popover.in .modify-lane-action-trigger')[0]);
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'othername');
      await click(getModalFooter().find('.btn-submit')[0]);

      expect(onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('lane'), { name: 'othername' });
    });

    [
      ['left', -1, 'isFirst'],
      ['right', 1, 'isLast'],
    ].forEach(([direction, moveStep, disablingProp]) => {
      it(`allows to move ${direction} the lane`, async function () {
        const onMoveSpy = sinon.stub().resolves();
        this.set('lane.onMove', onMoveSpy);

        this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

        await click('.lane-actions-trigger');
        await click($(`body .webui-popover.in .move-${direction}-lane-action-trigger`)[0]);

        expect(onMoveSpy).to.be.calledOnce
          .and.to.be.calledWith(this.get('lane'), moveStep);
      });

      it(`disables moving ${direction} the lane when "${disablingProp}" is true`, async function () {
        this.set(`lane.${disablingProp}`, true);
        this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

        await click('.lane-actions-trigger');

        const $actionParent =
          $(`body .webui-popover.in .move-${direction}-lane-action-trigger`).parent();
        expect($actionParent).to.have.class('disabled');
      });
    });

    it('allows to clear lane, when it is not empty', async function () {
      const onClearSpy = sinon.stub().resolves();
      const block = ParallelBlock.create({ id: 'b1' });
      const lane = this.get('lane');
      const actionsFactory = get(lane, 'actionsFactory');
      setProperties(lane, {
        onClear: onClearSpy,
        elements: [
          InterblockSpace.create({ elementAfter: block, actionsFactory }),
          block,
          InterblockSpace.create({ elementBefore: block, actionsFactory }),
        ],
      });
      this.render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click($('body .webui-popover.in .clear-lane-action-trigger')[0]);
      await click(getModalFooter().find('.question-yes')[0]);

      expect(onClearSpy).to.be.calledOnce.and.to.be.calledWith(lane);
    });

    it('does not allow to clear lane, when it is empty', async function () {
      const actionsFactory = this.get('lane.actionsFactory');
      this.set('lane.elements', [InterblockSpace.create({ actionsFactory })]);
      this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

      await click('.lane-actions-trigger');

      const $actionParent =
        $('body .webui-popover.in .clear-lane-action-trigger').parent();
      expect($actionParent).to.have.class('disabled');
    });

    it('allows to remove lane', async function () {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('lane.onRemove', onRemoveSpy);
      this.render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click($('body .webui-popover.in .remove-lane-action-trigger')[0]);
      await click(getModalFooter().find('.question-yes')[0]);

      expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(this.get('lane'));
    });
  });
});

function itShowsName() {
  it('shows lane name', function () {
    const laneName = 'my-lane';
    this.set('lane.name', laneName);

    this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

    expect(this.$('.lane-name').text().trim()).to.equal(laneName);
  });
}

function itRendersLaneElements() {
  it('renders lane elements', function () {
    const actionsFactory = this.get('lane.actionsFactory');
    const block1 = ParallelBlock.create({ id: 'b1', name: 'block1' });
    const block2 = ParallelBlock.create({ id: 'b2', name: 'block2' });
    this.set('lane.elements', [
      InterblockSpace.create({ elementAfter: block1, actionsFactory }),
      block1,
      InterblockSpace.create({
        elementBefore: block1,
        elementAfter: block2,
        actionsFactory,
      }),
      block2,
      InterblockSpace.create({ elementBefore: block2, actionsFactory }),
    ]);

    this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

    const $elements = this.$('.workflow-visualiser-lane .workflow-visualiser-element');
    const $space1Element = $elements.eq(0);
    const $block1Element = $elements.eq(1);
    const $space2Element = $elements.eq(2);
    const $block2Element = $elements.eq(3);
    const $space3Element = $elements.eq(4);
    expect($elements).to.have.length(5);
    expect($space1Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space1Element).to.not.have.attr('data-element-before-id');
    expect($space1Element).to.have.attr('data-element-after-id', 'b1');
    expect($block1Element.text().trim()).to.contain('block1');
    expect($block1Element.is('.workflow-visualiser-parallel-block')).to.be.true;
    expect($space2Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space2Element).to.have.attr('data-element-before-id', 'b1');
    expect($space2Element).to.have.attr('data-element-after-id', 'b2');
    expect($block2Element.text().trim()).to.contain('block2');
    expect($block2Element.is('.workflow-visualiser-parallel-block')).to.be.true;
    expect($space3Element.is('.workflow-visualiser-interblock-space')).to.be.true;
    expect($space3Element).to.have.attr('data-element-before-id', 'b2');
    expect($space3Element).to.not.have.attr('data-element-after-id');
  });
}

function itRendersActions(actionsSpec) {
  it('renders actions', async function () {
    this.render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

    await click(this.$('.lane-actions-trigger')[0]);

    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(actionsSpec.length);
    actionsSpec.forEach(({ className, label, icon }, index) => {
      const $action = $actions.eq(index);
      expect($action).to.have.class(className);
      expect($action.text().trim()).to.equal(label);
      expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
    });
  });
}
