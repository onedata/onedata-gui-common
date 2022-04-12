import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import sinon from 'sinon';
import { setProperties } from '@ember/object';
import { getModalBody, getModalFooter } from '../../../helpers/modal';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import $ from 'jquery';

describe('Integration | Component | workflow visualiser/interlane space', function () {
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
    this.set('interlaneSpace', InterlaneSpace.create({ actionsFactory }));
  });

  it(
    'has classes "workflow-visualiser-interlane-space", "workflow-visualiser-space" and "workflow-visualiser-element"',
    async function () {
      await renderComponent();

      expect($(this.element).children()).to.have.length(1);
      expect($(this.element).children().eq(0))
        .to.have.class('workflow-visualiser-interlane-space')
        .and.to.have.class('workflow-visualiser-space')
        .and.to.have.class('workflow-visualiser-element');
    }
  );

  it('has class "full-view-space", when it does not have any sibling elements',
    async function () {
      await renderComponent();

      expect($(find('.workflow-visualiser-interlane-space')))
        .to.have.class('full-view-space');
    });

  it('does not have class "full-view-space", when it has an after element',
    async function () {
      await renderComponent();
      this.set('interlaneSpace.elementAfter', Lane.create());

      expect($(find('.workflow-visualiser-interlane-space')))
        .to.not.have.class('full-view-space');
    });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('interlaneSpace.mode', 'edit');
    });

    it('notifies about triggered "add lane" action', async function (done) {
      const onAddElement = sinon.stub().resolves();
      const elementBefore = Lane.create();
      setProperties(this.get('interlaneSpace'), {
        elementBefore,
        elementAfter: Lane.create(),
        onAddElement,
      });
      await renderComponent();

      await click('.create-lane-action-trigger');
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'lane1');
      await click(getModalFooter().find('.btn-submit')[0]);

      expect(onAddElement).to.be.calledOnce.and.to.be.calledWith(
        null,
        elementBefore,
        sinon.match({ name: 'lane1' })
      );
      done();
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('interlaneSpace.mode', 'view');
    });

    it('does not allow to trigger "add lane" action', async function (done) {
      setProperties(this.get('interlaneSpace'), {
        elementBefore: Lane.create(),
        elementAfter: Lane.create(),
      });

      await renderComponent();

      expect(find('.create-lane-action-trigger')).to.not.exist;
      done();
    });
  });
});

async function renderComponent() {
  await render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/interlane-space elementModel=interlaneSpace}}
  `);
}
