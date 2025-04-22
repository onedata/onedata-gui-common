import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import GroupValueEditorState from 'onedata-gui-common/utils/atm-workflow/value-editors/value-editor-states/group';

describe('Integration | Component | atm-workflow/value-editors/group/array-item-creator', function () {
  setupRenderingTest();

  beforeEach(function () {
    const itemAtmDataSpec = {
      type: AtmDataSpecType.Group,
    };
    const editorContext = {};
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Array,
        itemDataSpec: itemAtmDataSpec,
      }, editorContext),
      editorContext,
      itemAtmDataSpec,
    });
  });

  it('is a link with proper label and "add-item-trigger" class', async function () {
    await renderComponent();

    const link = find('a');
    expect(link).to.exist;
    expect(link).to.have.trimmed.text('Add groups...');
    expect(link).to.have.class('add-item-trigger');
  });

  it('uses correct parameters during groups selection after "select groups" action click',
    async function () {
      const selectGroups = this.set('editorContext.selectGroups', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.select-groups-action-trigger');

      expect(selectGroups).to.be.calledOnce
        .and.to.be.calledWith({
          allowMany: true,
          onSelected: sinon.match.func,
          onCancelled: sinon.match.func,
        });
    }
  );

  it('calls "onItemCreated" with newly created items after "select groups" action click and groups selection',
    async function () {
      const groupsToSelect = [{ groupId: '1' }, { groupId: '2' }];
      this.set(
        'editorContext.selectGroups',
        ({ onSelected }) => onSelected(groupsToSelect)
      );
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();
      expect(onItemsCreated).to.be.not.called;

      await click('.add-item-trigger');
      await click('.select-groups-action-trigger');

      expect(onItemsCreated).to.be.calledOnce
        .and.to.be.calledWith([
          sinon.match.instanceOf(GroupValueEditorState),
          sinon.match.instanceOf(GroupValueEditorState),
        ])
        .and.to.be.calledWith([
          sinon.match.hasNested('value.groupId', groupsToSelect[0].groupId),
          sinon.match.hasNested('value.groupId', groupsToSelect[1].groupId),
        ]);
    }
  );

  it('does not call "onItemCreated" after "select groups" action click and cancelled groups selection',
    async function () {
      this.set(
        'editorContext.selectGroups',
        ({ onCancelled }) => onCancelled()
      );
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.select-groups-action-trigger');

      expect(onItemsCreated).to.be.not.called;
    }
  );

  it('calls "onItemCreated" with newly created item after "provide group id" action click and form submission',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();
      expect(onItemsCreated).to.be.not.called;

      await click('.add-item-trigger');
      await click('.provide-group-id-action-trigger');
      await fillIn('.groupId-field input', 'id1');
      await click('.accept-btn');

      expect(onItemsCreated).to.be.calledOnce
        .and.to.be.calledWith([
          sinon.match.instanceOf(GroupValueEditorState),
        ])
        .and.to.be.calledWith([
          sinon.match.hasNested('value.groupId', 'id1'),
        ]);
      // creator came back to it's default look
      expect(find('.add-item-trigger')).to.exist;
    }
  );

  it('comes back to default look from id form when user cancels id providing',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.provide-group-id-action-trigger');
      await click('.cancel-btn');

      expect(onItemsCreated).to.be.not.called;
      expect(find('.add-item-trigger')).to.exist;
    }
  );

  it('comes back to default look from id form when user tries to remove id form editor',
    async function () {
      const onItemsCreated = this.set('onItemsCreated', sinon.spy());
      await renderComponent();

      await click('.add-item-trigger');
      await click('.provide-group-id-action-trigger');
      await click('.remove-icon');

      expect(onItemsCreated).to.be.not.called;
      expect(find('.add-item-trigger')).to.exist;
    }
  );
});

async function renderComponent() {
  await render(hbs`<AtmWorkflow::ValueEditors::Group::ArrayItemCreator
    @stateManager={{stateManager}}
    @itemAtmDataSpec={{itemAtmDataSpec}}
    @onItemsCreated={{onItemsCreated}}
  />`);
}
