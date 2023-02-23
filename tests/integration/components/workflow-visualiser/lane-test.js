import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  fillIn,
  find,
  findAll,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import ParallelBox from 'onedata-gui-common/utils/workflow-visualiser/lane/parallel-box';
import InterblockSpace from 'onedata-gui-common/utils/workflow-visualiser/lane/interblock-space';
import { Promise } from 'rsvp';
import { get, set, setProperties } from '@ember/object';
import sinon from 'sinon';
import { getModalBody, getModalFooter } from '../../../helpers/modal';

const editLaneActionsSpec = [{
  className: 'modify-lane-action-trigger',
  label: 'Modify',
  icon: 'rename',
}, {
  className: 'modify-lane-charts-dashboard-action-trigger',
  label: 'Configure charts',
  icon: 'overview',
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
  icon: 'checkbox-filled-x',
}, {
  className: 'remove-lane-action-trigger',
  label: 'Remove',
  icon: 'remove',
}];

const viewLaneActionsSpec = [{
  className: 'view-lane-action-trigger',
  label: 'View details',
  icon: 'browser-info',
}];

describe('Integration | Component | workflow-visualiser/lane', function () {
  setupRenderingTest();

  beforeEach(function () {
    const actionsFactory = ActionsFactory.create({ ownerSource: this.owner });
    actionsFactory.setWorkflowDataProvider({
      definedStores: [
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
      maxRetries: 0,
      storeIteratorSpec: {
        storeSchemaId: 's1',
        maxBatchSize: 100,
      },
    }));
  });

  it('has class "workflow-visualiser-lane"', async function () {
    await render(hbs `{{workflow-visualiser/lane}}`);
    expect(find('.workflow-visualiser-lane')).to.exist;
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('lane.mode', 'view');
    });

    itShowsName();
    itRendersLaneElements();
    itRendersActions(viewLaneActionsSpec);

    it('does not allow to modify lane name', async function (done) {
      await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

      // .one-label is a trigger for one-inline-editor
      expect(find('.lane-name .one-label')).to.not.exist;
      done();
    });

    it('allows to show lane details', async function (done) {
      await render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click(document.querySelector('.webui-popover.in .view-lane-action-trigger'));

      expect(
        getModalBody().querySelector('.name-field .field-component').textContent.trim()
      ).to.equal('lane1');
      done();
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('lane.mode', 'edit');
    });

    itShowsName();
    itRendersLaneElements();
    itRendersActions(editLaneActionsSpec);

    it('allows to modify lane name', async function (done) {
      setProperties(this.get('lane'), {
        name: 'my-lane',
        onModify(lane, { name }) {
          return new Promise(resolve => {
            set(lane, 'name', name);
            resolve();
          });
        },
      });

      await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);
      await click('.lane-name .one-label');
      await fillIn('.lane-name input', 'new-name');
      await click('.lane-name .save-icon');

      expect(find('.lane-name').textContent.trim()).to.equal('new-name');
      done();
    });

    it('allows to modify lane details', async function (done) {
      const onModifySpy = sinon.stub().resolves();
      this.set('lane.onModify', onModifySpy);
      await render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click(
        document.querySelector('.webui-popover.in .modify-lane-action-trigger')
      );
      await fillIn(
        getModalBody().querySelector('.name-field .form-control'),
        'othername'
      );
      await click(getModalFooter().querySelector('.btn-submit'));

      expect(onModifySpy).to.be.calledOnce
        .and.to.be.calledWith(this.get('lane'), { name: 'othername' });
      done();
    });

    [
      ['left', -1, 'isFirst'],
      ['right', 1, 'isLast'],
    ].forEach(([direction, moveStep, disablingProp]) => {
      it(`allows to move ${direction} the lane`, async function (done) {
        const onMoveSpy = sinon.stub().resolves();
        this.set('lane.onMove', onMoveSpy);

        await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

        await click('.lane-actions-trigger');
        await click(document.querySelector(
          `.webui-popover.in .move-${direction}-lane-action-trigger`
        ));

        expect(onMoveSpy).to.be.calledOnce
          .and.to.be.calledWith(this.get('lane'), moveStep);
        done();
      });

      it(`disables moving ${direction} the lane when "${disablingProp}" is true`, async function (done) {
        this.set(`lane.${disablingProp}`, true);
        await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

        await click('.lane-actions-trigger');

        const actionParent = document.querySelector(
          `.webui-popover.in .move-${direction}-lane-action-trigger`
        ).parentElement;
        expect(actionParent).to.have.class('disabled');
        done();
      });
    });

    it('allows to clear lane, when it is not empty', async function (done) {
      const onClearSpy = sinon.stub().resolves();
      const block = ParallelBox.create({ id: 'b1' });
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
      await render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click(document.querySelector('.webui-popover.in .clear-lane-action-trigger'));
      await click(getModalFooter().querySelector('.question-yes'));

      expect(onClearSpy).to.be.calledOnce.and.to.be.calledWith(lane);
      done();
    });

    it('does not allow to clear lane, when it is empty', async function (done) {
      const actionsFactory = this.get('lane.actionsFactory');
      this.set('lane.elements', [InterblockSpace.create({ actionsFactory })]);
      await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

      await click('.lane-actions-trigger');

      const actionParent = document.querySelector(
        '.webui-popover.in .clear-lane-action-trigger'
      ).parentElement;
      expect(actionParent).to.have.class('disabled');
      done();
    });

    it('allows to remove lane', async function (done) {
      const onRemoveSpy = sinon.stub().resolves();
      this.set('lane.onRemove', onRemoveSpy);
      await render(hbs `
        {{global-modal-mounter}}
        {{workflow-visualiser/lane elementModel=lane}}
      `);

      await click('.lane-actions-trigger');
      await click(
        document.querySelector('.webui-popover.in .remove-lane-action-trigger')
      );
      await click(getModalFooter().querySelector('.question-yes'));

      expect(onRemoveSpy).to.be.calledOnce.and.to.be.calledWith(this.get('lane'));
      done();
    });
  });
});

function itShowsName() {
  it('shows lane name', async function (done) {
    const laneName = 'my-lane';
    this.set('lane.name', laneName);

    await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

    expect(find('.lane-name').textContent.trim()).to.equal(laneName);
    done();
  });
}

function itRendersLaneElements() {
  it('renders lane elements', async function (done) {
    const actionsFactory = this.get('lane.actionsFactory');
    const block1 = ParallelBox.create({ id: 'b1', name: 'block1' });
    const block2 = ParallelBox.create({ id: 'b2', name: 'block2' });
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

    await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

    const elements = findAll('.workflow-visualiser-lane .workflow-visualiser-element');
    const space1Element = elements[0];
    const block1Element = elements[1];
    const space2Element = elements[2];
    const block2Element = elements[3];
    const space3Element = elements[4];
    expect(elements).to.have.length(5);
    expect(space1Element.matches('.workflow-visualiser-interblock-space')).to.be.true;
    expect(space1Element).to.not.have.attr('data-element-before-id');
    expect(space1Element).to.have.attr('data-element-after-id', 'b1');
    expect(block1Element.textContent.trim()).to.contain('block1');
    expect(block1Element.matches('.workflow-visualiser-parallel-box')).to.be.true;
    expect(space2Element.matches('.workflow-visualiser-interblock-space')).to.be.true;
    expect(space2Element).to.have.attr('data-element-before-id', 'b1');
    expect(space2Element).to.have.attr('data-element-after-id', 'b2');
    expect(block2Element.textContent.trim()).to.contain('block2');
    expect(block2Element.matches('.workflow-visualiser-parallel-box')).to.be.true;
    expect(space3Element.matches('.workflow-visualiser-interblock-space')).to.be.true;
    expect(space3Element).to.have.attr('data-element-before-id', 'b2');
    expect(space3Element).to.not.have.attr('data-element-after-id');
    done();
  });
}

function itRendersActions(actionsSpec) {
  it('renders actions', async function (done) {
    await render(hbs `{{workflow-visualiser/lane elementModel=lane}}`);

    await click('.lane-actions-trigger');

    const actions = document.querySelectorAll('body .webui-popover.in .actions-popover-content a');
    expect(actions).to.have.length(actionsSpec.length);
    actionsSpec.forEach(({ className, label, icon }, index) => {
      const action = actions[index];
      expect(action).to.have.class(className);
      expect(action.textContent.trim()).to.equal(label);
      expect(action.querySelector('.one-icon')).to.have.class(`oneicon-${icon}`);
    });
    done();
  });
}
