import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import Action from 'onedata-gui-common/utils/action';
import wait from 'ember-test-helpers/wait';

const componentClass = 'revisions-table-create-revision-entry';

describe('Integration | Component | revisions table/create revision entry', function () {
  setupComponentTest('revisions-table/create-revision-entry', {
    integration: true,
  });

  beforeEach(function () {
    const createRevisionSpy = sinon.spy();
    this.setProperties({
      createRevisionSpy,
      revisionActionsFactory: {
        createCreateRevisionAction: () => Action.create({
          icon: 'plus',
          title: 'Create revision',
          onExecute: createRevisionSpy,
          ownerSource: this,
        }),
      },
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);

    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  it('shows correct icon text', async function () {
    await render(this);

    expect(this.$('.one-icon')).to.have.class('oneicon-plus');
    expect(this.$().text().trim()).to.equal('Create revision');
  });

  it('creates new revision on click',
    async function () {
      const createRevisionSpy = this.get('createRevisionSpy');
      await render(this);
      expect(createRevisionSpy).to.be.not.called;

      await click(`.${componentClass}`);

      expect(createRevisionSpy).to.be.called;
    });
});

async function render(testCase) {
  testCase.render(hbs `{{revisions-table/create-revision-entry
    revisionActionsFactory=revisionActionsFactory
  }}`);
  await wait();
}
