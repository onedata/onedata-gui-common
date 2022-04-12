import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import $ from 'jquery';

const componentClass = 'revisions-table-revision-entries-expander';

describe('Integration | Component | revisions table/revision entries expander',
  function () {
    setupRenderingTest();

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect($(this.element).children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows hidden entries number', async function () {
      this.set('entriesCount', 3);

      await renderComponent();

      expect(find('.expand-button').textContent.trim()).to.equal('3 more');
    });

    it('calls onExpand callback after click on expand button', async function () {
      const onExpand = this.set('onExpand', sinon.spy());
      await renderComponent();
      expect(onExpand).to.not.be.called;

      await click('.expand-button');

      expect(onExpand).to.be.calledOnce;
    });
  }
);

async function renderComponent() {
  await render(hbs `{{revisions-table/revision-entries-expander
    entriesCount=entriesCount
    onExpand=onExpand
  }}`);
}
