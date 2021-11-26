import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

const componentClass = 'revisions-table-revision-entry';

describe('Integration | Component | revisions table/revision entry', function () {
  setupComponentTest('revisions-table/revision-entry', {
    integration: true,
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);
    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  it('shows revision number', async function () {
    const revisionNumber = this.set('revisionNumber', 0);

    await render(this);

    expect(this.$('.revision-number').text().trim())
      .to.equal(String(revisionNumber));
  });

  it('shows unknown revision number as "?"', async function () {
    this.set('revisionNumber', null);

    await render(this);

    expect(this.$('.revision-number').text().trim()).to.equal('?');
  });

  it('shows state', async function () {
    const { state } = this.set('revision', { state: 'stable' });

    await render(this);

    expect(this.$('.revisions-table-state-tag'))
      .to.have.class(`state-${state}`);
  });

  it('shows unknown state as "draft"', async function () {
    this.set('revision', null);

    await render(this);

    expect(this.$('.revisions-table-state-tag')).to.have.class('state-draft');
  });

  it('shows custom columns', async function () {
    this.set('revision', { description: 'abc' });

    await render(this);

    expect(this.$('.description').text().trim()).to.equal('abc');
  });

  it('allows to choose from revision actions', async function () {
    this.setProperties({
      revisionNumber: 3,
      revisionActionsFactory: {
        createActionsForRevisionNumber(revisionNumber) {
          return [{
            title: `testAction ${revisionNumber}`,
          }];
        },
      },
    });

    await render(this);

    const $actionsTrigger = this.$('.revision-actions-trigger');
    expect($actionsTrigger).to.exist;

    await click($actionsTrigger[0]);
    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(1);
    expect($actions.text()).to.contain('testAction 3');
  });

  it('triggers "onClick" callback after click', async function () {
    const { onClick } = this.setProperties({
      onClick: sinon.spy(),
      revisionNumber: 2,
    });
    await render(this);
    expect(onClick).not.to.be.called;

    await click(`.${componentClass}`);

    expect(onClick).to.be.calledOnce.and.to.be.calledWith(2);
  });

  it('does not trigger "onClick" callback after actions trigger click',
    async function () {
      const onClick = this.set('onClick', sinon.spy());
      await render(this);

      await click('.revision-actions-trigger');

      expect(onClick).not.to.be.called;
    });

  it('has class "readonly" and hides actions trigger when "isReadOnly" is true',
    async function () {
      this.set('isReadOnly', true);

      await render(this);

      expect(this.$(`.${componentClass}`)).to.have.class('readonly');
      expect(this.$('.revision-actions-trigger')).to.not.exist;
    }
  );
});

async function render(testCase) {
  testCase.render(hbs `{{#revisions-table/revision-entry
    revisionNumber=revisionNumber
    revision=revision
    revisionActionsFactory=revisionActionsFactory
    onClick=onClick
    isReadOnly=isReadOnly
    as |revision revisionNumber|
  }}
    <td class="description">{{revision.description}}</td>
  {{/revisions-table/revision-entry}}`);
  await wait();
}
