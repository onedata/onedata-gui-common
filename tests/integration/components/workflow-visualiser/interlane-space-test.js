import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { setProperties } from '@ember/object';
import { getModalBody, getModalFooter } from '../../../helpers/modal';
import Store from 'onedata-gui-common/utils/workflow-visualiser/store';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | workflow visualiser/interlane space', function () {
  setupComponentTest('workflow-visualiser/interlane-space', {
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
    this.set('interlaneSpace', InterlaneSpace.create({ actionsFactory }));
  });

  it(
    'has classes "workflow-visualiser-interlane-space", "workflow-visualiser-space" and "workflow-visualiser-element"',
    async function () {
      await render(this);

      expect(this.$().children()).to.have.length(1);
      expect(this.$().children().eq(0))
        .to.have.class('workflow-visualiser-interlane-space')
        .and.to.have.class('workflow-visualiser-space')
        .and.to.have.class('workflow-visualiser-element');
    }
  );

  it('has class "full-view-space", when it does not have any sibling elements',
    async function () {
      await render(this);

      expect(this.$('.workflow-visualiser-interlane-space'))
        .to.have.class('full-view-space');
    });

  it('does not have class "full-view-space", when it has an after element',
    async function () {
      await render(this);
      this.set('interlaneSpace.elementAfter', Lane.create());

      expect(this.$('.workflow-visualiser-interlane-space'))
        .to.not.have.class('full-view-space');
    });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('interlaneSpace.mode', 'edit');
    });

    it('notifies about triggered "add lane" action', async function () {
      const onAddElement = sinon.stub().resolves();
      const elementBefore = Lane.create();
      setProperties(this.get('interlaneSpace'), {
        elementBefore,
        elementAfter: Lane.create(),
        onAddElement,
      });
      await render(this);

      await click('.create-lane-action-trigger');
      await fillIn(getModalBody().find('.name-field .form-control')[0], 'lane1');
      await click(getModalFooter().find('.btn-submit')[0]);

      expect(onAddElement).to.be.calledOnce.and.to.be.calledWith(
        null,
        elementBefore,
        sinon.match({ name: 'lane1' })
      );
    });
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('interlaneSpace.mode', 'view');
    });

    it('does not allow to trigger "add lane" action', async function () {
      setProperties(this.get('interlaneSpace'), {
        elementBefore: Lane.create(),
        elementAfter: Lane.create(),
      });

      await render(this);

      expect(this.$('.create-lane-action-trigger')).to.not.exist;
    });
  });
});

async function render(testCase) {
  testCase.render(hbs `
    {{global-modal-mounter}}
    {{workflow-visualiser/interlane-space elementModel=interlaneSpace}}
  `);
  await wait();
}
