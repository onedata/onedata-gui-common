import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Action from 'onedata-gui-common/utils/action';

const componentClass = 'revisions-table-create-revision-entry';

describe('Integration | Component | revisions-table/create-revision-entry', function () {
  setupRenderingTest();

  beforeEach(function () {
    const createRevisionSpy = sinon.spy();
    this.setProperties({
      createRevisionSpy,
      revisionActionsFactory: {
        createCreateRevisionAction: () => Action.create({
          icon: 'plus',
          title: 'Create revision',
          onExecute: createRevisionSpy,
          ownerSource: this.owner,
        }),
      },
    });
  });

  it(`has class "${componentClass}"`, async function () {
    await renderComponent();

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class(componentClass);
  });

  it('shows correct icon and text', async function () {
    await renderComponent();

    expect(find('.one-icon')).to.have.class('oneicon-plus');
    expect(this.element.textContent.trim()).to.equal('Create revision');
  });

  it('creates new revision on click',
    async function () {
      const createRevisionSpy = this.get('createRevisionSpy');
      await renderComponent();
      expect(createRevisionSpy).to.be.not.called;

      await click(`.${componentClass}`);

      expect(createRevisionSpy).to.be.called;
    });
});

async function renderComponent() {
  await render(hbs `{{revisions-table/create-revision-entry
    revisionActionsFactory=revisionActionsFactory
  }}`);
}
