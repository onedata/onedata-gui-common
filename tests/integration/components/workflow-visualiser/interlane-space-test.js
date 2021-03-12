import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/actions-factory';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { setProperties } from '@ember/object';

describe('Integration | Component | workflow visualiser/interlane space', function () {
  setupComponentTest('workflow-visualiser/interlane-space', {
    integration: true,
  });

  beforeEach(function () {
    this.set('interlaneSpace', InterlaneSpace.create({
      actionsFactory: ActionsFactory.create({ ownerSource: this }),
    }));
  });

  it(
    'has classes "workflow-visualiser-interlane-space", "workflow-visualiser-space" and "workflow-visualiser-element"',
    function () {
      this.render(hbs `{{workflow-visualiser/interlane-space}}`);

      expect(this.$().children()).to.have.length(1);
      expect(this.$().children().eq(0))
        .to.have.class('workflow-visualiser-interlane-space')
        .and.to.have.class('workflow-visualiser-space')
        .and.to.have.class('workflow-visualiser-element');
    }
  );

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
      this.render(hbs `{{workflow-visualiser/interlane-space
        elementModel=interlaneSpace
      }}`);

      await click('.create-lane-action-trigger');

      expect(onAddElement).to.be.calledOnce.and.to.be.calledWith(
        null,
        elementBefore,
        sinon.match({ name: 'Untitled lane' })
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

      this.render(hbs `{{workflow-visualiser/interlane-space
        elementModel=interlaneSpace
      }}`);

      expect(this.$('.create-lane-action-trigger')).to.not.exist;
    });
  });
});
