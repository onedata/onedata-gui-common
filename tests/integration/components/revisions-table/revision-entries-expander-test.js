import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

const componentClass = 'revisions-table-revision-entries-expander';

describe('Integration | Component | revisions table/revision entries expander',
  function () {
    setupComponentTest('revisions-table/revision-entries-expander', {
      integration: true,
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows hidden entries number', async function () {
      this.set('entriesCount', 3);

      await render(this);

      expect(this.$('.expand-button').text().trim()).to.equal('3 more');
    });

    it('calls onExpand callback after click on expand button', async function () {
      const onExpand = this.set('onExpand', sinon.spy());
      await render(this);
      expect(onExpand).to.not.be.called;

      await click('.expand-button');

      expect(onExpand).to.be.calledOnce;
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{revisions-table/revision-entries-expander
    entriesCount=entriesCount
    onExpand=onExpand
  }}`);
  await wait();
}
