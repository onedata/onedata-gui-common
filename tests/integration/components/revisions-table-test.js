import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, findAll, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Action from 'onedata-gui-common/utils/action';
import globals from 'onedata-gui-common/utils/globals';

const componentClass = 'revisions-table';

describe('Integration | Component | revisions-table', function () {
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

  it('shows header row', async function () {
    await renderComponent();

    const thCells = findAll('th');

    const headerTexts = ['Rev.', 'State', 'Description', ''];
    expect(thCells).to.have.length(headerTexts.length);
    headerTexts.forEach((text, idx) =>
      expect(thCells[idx].textContent.trim()).to.equal(text)
    );
  });

  it('shows revisions content', async function () {
    const revisionsSpec = [{
      revisionNumber: 1,
      state: 'stable',
      description: 'myrev 1',
    }, {
      revisionNumber: 2,
      state: 'draft',
      description: 'myrev 2',
    }];
    this.set('revisionRegistry', generateRevisionRegistry(revisionsSpec));
    this.set(
      'revisionActionsFactory.createActionsForRevisionNumber',
      (revisionNumber) => {
        return [{
          title: `testAction ${revisionNumber}`,
        }];
      }
    );
    await renderComponent();

    const revisionEntries = findAll('.revisions-table-revision-entry');
    expect(revisionEntries).to.have.length(2);
    const sortedRevisionsSpec = [...revisionsSpec].reverse();
    for (let i = 0; i < sortedRevisionsSpec.length; i++) {
      const { revisionNumber, state, description } = sortedRevisionsSpec[i];
      const revisionEntry = revisionEntries[i];
      expect(revisionEntry.querySelector('.revision-number').textContent.trim())
        .to.equal(String(revisionNumber));
      expect(revisionEntry.querySelector('.revisions-table-state-tag'))
        .to.have.class(`state-${state}`);
      expect(revisionEntry.querySelector('.description').textContent.trim())
        .to.equal(description);

      const actionsTrigger = revisionEntry.querySelector('.revision-actions-trigger');
      await click(actionsTrigger);
      const actions =
        globals.document.querySelector('.webui-popover.in .actions-popover-content a');
      expect(actions).to.have.length(1);
      expect(actions.textContent).to.contain(`testAction ${revisionNumber}`);
    }
  });

  it('shows only latest and latest stable revision in case of many mixed-state revisions',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'draft' },
        { revisionNumber: 2, state: 'deprecated' },
        { revisionNumber: 3, state: 'stable' },
        { revisionNumber: 4, state: 'draft' },
        { revisionNumber: 5, state: 'draft' },
      ]));
      await renderComponent();

      expectRevisionEntriesLayout([
        { type: 'revision', revisionNumber: 5 },
        { type: 'expander', revisionsCount: 1 },
        { type: 'revision', revisionNumber: 3 },
        { type: 'expander', revisionsCount: 2 },
      ]);
    }
  );

  it('shows only the latest stable revision, if the latest is also the latest stable and there are many older revisions',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'draft' },
        { revisionNumber: 2, state: 'deprecated' },
        { revisionNumber: 3, state: 'stable' },
        { revisionNumber: 4, state: 'draft' },
        { revisionNumber: 5, state: 'stable' },
      ]));
      await renderComponent();

      expectRevisionEntriesLayout([
        { type: 'revision', revisionNumber: 5 },
        { type: 'expander', revisionsCount: 4 },
      ]);
    }
  );

  it('shows only the latest revision if there is no latest stable revision and there are many older revisions',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'draft' },
        { revisionNumber: 2, state: 'deprecated' },
        { revisionNumber: 3, state: 'draft' },
        { revisionNumber: 4, state: 'draft' },
        { revisionNumber: 5, state: 'draft' },
      ]));
      await renderComponent();

      expectRevisionEntriesLayout([
        { type: 'revision', revisionNumber: 5 },
        { type: 'expander', revisionsCount: 4 },
      ]);
    }
  );

  it('allows to see revisions between the latest and the latest stable',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'draft' },
        { revisionNumber: 2, state: 'deprecated' },
        { revisionNumber: 3, state: 'stable' },
        { revisionNumber: 4, state: 'draft' },
        { revisionNumber: 5, state: 'draft' },
      ]));
      await renderComponent();

      await click('.between-revisions-expander .expand-button');

      expectRevisionEntriesLayout([
        { type: 'revision', revisionNumber: 5 },
        { type: 'revision', revisionNumber: 4 },
        { type: 'revision', revisionNumber: 3 },
        { type: 'expander', revisionsCount: 2 },
      ]);
    }
  );

  it('allows to see revisions older than the latest stable', async function () {
    this.set('revisionRegistry', generateRevisionRegistry([
      { revisionNumber: 1, state: 'draft' },
      { revisionNumber: 2, state: 'deprecated' },
      { revisionNumber: 3, state: 'stable' },
      { revisionNumber: 4, state: 'draft' },
      { revisionNumber: 5, state: 'draft' },
    ]));
    await renderComponent();

    await click('.older-revisions-expander .expand-button');

    expectRevisionEntriesLayout([
      { type: 'revision', revisionNumber: 5 },
      { type: 'expander', revisionsCount: 1 },
      { type: 'revision', revisionNumber: 3 },
      { type: 'revision', revisionNumber: 2 },
      { type: 'revision', revisionNumber: 1 },
    ]);
  });

  it('does not allow to expand revisions between the latest and the latest stable if these are not present',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'draft' },
        { revisionNumber: 2, state: 'deprecated' },
        { revisionNumber: 3, state: 'stable' },
        { revisionNumber: 4, state: 'stable' },
        { revisionNumber: 5, state: 'draft' },
      ]));
      await renderComponent();

      expectRevisionEntriesLayout([
        { type: 'revision', revisionNumber: 5 },
        { type: 'revision', revisionNumber: 4 },
        { type: 'expander', revisionsCount: 3 },
      ]);
    }
  );

  it('does not allow to expand revisions older than latest stable if these are not present',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'stable' },
        { revisionNumber: 2, state: 'deprecated' },
        { revisionNumber: 3, state: 'draft' },
        { revisionNumber: 4, state: 'draft' },
        { revisionNumber: 5, state: 'draft' },
      ]));
      await renderComponent();

      expectRevisionEntriesLayout([
        { type: 'revision', revisionNumber: 5 },
        { type: 'expander', revisionsCount: 3 },
        { type: 'revision', revisionNumber: 1 },
      ]);
    }
  );

  it('does not mark entries as clickable if onRevisionClick callback is not provided',
    async function () {
      this.set('revisionRegistry', generateRevisionRegistry([
        { revisionNumber: 1, state: 'stable' },
        { revisionNumber: 2, state: 'draft' },
      ]));
      await renderComponent();

      expect(find('.revisions-table-revision-entry'))
        .to.not.have.class('clickable');
    });

  it('marks entries as clickable if onRevisionClick callback is provided and notifies about click',
    async function () {
      const { onRevisionClick } = this.setProperties({
        revisionRegistry: generateRevisionRegistry([
          { revisionNumber: 1, state: 'stable' },
          { revisionNumber: 2, state: 'draft' },
        ]),
        onRevisionClick: sinon.spy(),
      });
      await renderComponent();

      await click('.revisions-table-revision-entry');

      expect(onRevisionClick).to.be.calledOnce.and.to.be.calledWith(2);
      expect(find('.revisions-table-revision-entry'))
        .to.have.class('clickable');
    });

  it('creates new revision', async function () {
    const createRevisionSpy = this.get('createRevisionSpy');
    await renderComponent();
    expect(createRevisionSpy).to.be.not.called;

    await click('.revisions-table-create-revision-entry');

    expect(createRevisionSpy).to.be.calledOnce;
  });

  it('has class "readonly" and hides all actions when "isReadOnly" is true',
    async function () {
      this.setProperties({
        isReadOnly: true,
        revisionRegistry: generateRevisionRegistry([
          { revisionNumber: 1, state: 'stable' },
          { revisionNumber: 2, state: 'draft' },
        ]),
      });
      await renderComponent();

      expect(find(`.${componentClass}`)).to.have.class('readonly');
      expect(find('.revisions-table-create-revision-entry')).to.not.exist;
      expect(find('.revision-actions-trigger')).to.not.exist;
    });

  it('shows "no revisions" row when there are no revisions to show', async function () {
    this.set('revisionRegistry', {});
    await renderComponent();

    expect(find('.revisions-table-revision-entry')).to.not.exist;
    const emptyEntry = find('.revisions-table-empty-entry');
    expect(emptyEntry).to.exist;
    expect(emptyEntry.textContent.trim()).to.equal('No revisions');
  });
});

async function renderComponent() {
  await render(hbs `{{#revisions-table
    revisionRegistry=revisionRegistry
    revisionActionsFactory=revisionActionsFactory
    onRevisionClick=onRevisionClick
    isReadOnly=isReadOnly
    as |section data|
  }}
    {{#if (eq section "header")}}
      <th class="description-column">Description</th>
    {{else}}
      <td class="description">{{data.revision.description}}</td>
    {{/if}}
  {{/revisions-table}}`);
}

function generateRevisionRegistry(revisionsSpec) {
  const revisionRegistry = {};
  revisionsSpec.forEach(({ revisionNumber, state, description }) =>
    revisionRegistry[revisionNumber] = {
      state,
      description,
    }
  );
  return revisionRegistry;
}

function expectRevisionEntriesLayout(layoutSpec) {
  const rows = findAll(`.${componentClass} tbody tr`);
  expect(rows).to.have.length(layoutSpec.length + 1);
  expect(rows[0]).to.have.class('revisions-table-create-revision-entry');
  layoutSpec.forEach(({ type, revisionsCount, revisionNumber }, idx) => {
    const row = rows[idx + 1];
    if (type === 'revision') {
      expect(row).to.have.class('revisions-table-revision-entry');
      expect(row.querySelector('.revision-number').textContent.trim())
        .to.equal(String(revisionNumber));
    } else if (type === 'expander') {
      expect(row).to.have.class('revisions-table-revision-entries-expander');
      expect(row.querySelector('.expand-button').textContent)
        .to.contain(String(revisionsCount));
    }
  });
}
