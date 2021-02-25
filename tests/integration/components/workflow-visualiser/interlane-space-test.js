import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import InterlaneSpace from 'onedata-gui-common/utils/workflow-visualiser/interlane-space';
import Lane from 'onedata-gui-common/utils/workflow-visualiser/lane';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | workflow visualiser/interlane space', function () {
  setupComponentTest('workflow-visualiser/interlane-space', {
    integration: true,
  });

  it('has classes "workflow-visualiser-interlane-space" and "workflow-visualiser-element"', function () {
    this.render(hbs `{{workflow-visualiser/interlane-space}}`);

    expect(this.$().children()).to.have.length(1);
    expect(this.$().children().eq(0))
      .to.have.class('workflow-visualiser-interlane-space')
      .and.to.have.class('workflow-visualiser-element');
  });

  ['first', 'second'].forEach(lanePrefix => {
    const laneName = `${lanePrefix}Lane`;
    const htmlAttrForLane = `data-${lanePrefix}-lane-id`;

    it(`has not specified "${htmlAttrForLane}" attribute when "${laneName}" is undefined`, function () {
      this.set('interlaneSpace', InterlaneSpace.create({
        [laneName]: undefined,
      }));

      this.render(hbs `{{workflow-visualiser/interlane-space
        visualiserElement=interlaneSpace
      }}`);

      expect(this.$('.workflow-visualiser-interlane-space'))
        .to.not.have.attr(htmlAttrForLane);
    });

    it(`has specified "${htmlAttrForLane}" attribute when "${laneName}" is specified`, function () {
      const laneId = '1234';
      this.set('interlaneSpace', InterlaneSpace.create({
        [laneName]: Lane.create({
          id: laneId,
        }),
      }));

      this.render(hbs `{{workflow-visualiser/interlane-space
        visualiserElement=interlaneSpace
      }}`);

      expect(this.$('.workflow-visualiser-interlane-space'))
        .to.have.attr(htmlAttrForLane, laneId);
    });
  });

  it('notifies about triggered "add lane" action', async function () {
    const onAddLane = sinon.spy();
    const firstLane = Lane.create();
    this.set('interlaneSpace', InterlaneSpace.create({
      firstLane,
      secondLane: Lane.create(),
      onAddLane,
    }));
    this.render(hbs `{{workflow-visualiser/interlane-space
      visualiserElement=interlaneSpace
    }}`);

    await click('.add-lane-action-trigger');

    expect(onAddLane).to.be.calledOnce.and.to.be.calledWith(firstLane);
  });
});
