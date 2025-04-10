import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click, findAll, fillIn, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { GroupType } from 'onedata-gui-common/utils/group';

const exampleGroup = { groupId: 'g1id' };

describe('Integration | Component | atm-workflow/value-editors/group/editor', function () {
  setupRenderingTest();

  beforeEach(function () {
    const editorContext = {
      getGroupUrlById: async (groupId) => {
        return `#/${groupId}`;
      },
      getGroupDetailsById: async (groupId) => {
        return {
          groupId: groupId,
          name: `${groupId}Name`,
          type: GroupType.Organization,
        };
      },
      selectGroups: sinon.spy(async (...args) => this.selectGroups(...args)),
    };
    this.setProperties({
      stateManager: new ValueEditorStateManager({
        type: AtmDataSpecType.Group,
      }, editorContext),
      editorContext,
      selectGroups: ({ onSelected }) => onSelected([exampleGroup]),
    });
  });

  it('has class "group-editor"', async function () {
    await renderComponent();

    expect(find('.editor-box')).to.have.class('group-editor');
  });

  it('has only "Group" text in the header', async function () {
    await renderComponent();

    expect(find('.editor-box-header')).to.have.trimmed.text('Group');
    expect(find('.editor-box-toolbar')).to.be.empty;
  });

  it('has working "remove" button when "onRemove" callback is provided', async function () {
    const onRemove = this.set('onRemove', sinon.spy());
    await renderComponent();
    expect(onRemove).to.be.not.called;

    await click('.editor-box-toolbar .remove-icon');

    expect(onRemove).to.be.calledOnce;
  });

  it('shows selector when value is empty', async function () {
    await renderComponent();

    const selectorTrigger = find('.editor-box-content .group-value-editor-selector');
    expect(selectorTrigger).to.exist;
    expect(selectorTrigger).to.have.trimmed.text('Select group...');
    expect(find('form')).to.not.exist;
  });

  it('allows to select a group from selector view', async function () {
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.select-groups-action-trigger');

    expect(this.editorContext.selectGroups).to.be.calledOnce
      .and.to.be.calledWith({
        allowMany: false,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
    expect(this.stateManager.value).to.deep.equal(exampleGroup);
    expect(this.stateManager.isValid).to.be.true;
    expect(find('.editor-box-content .group-value-editor-selector')).to.not.exist;
    expect(find('.group-visual-presenter')).to.exist;
  });

  it('allows to cancel selecting a group from selector view', async function () {
    this.set('selectGroups', ({ onCancelled }) => onCancelled());
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.select-groups-action-trigger');

    expect(this.stateManager.value).to.deep.equal({ groupId: '' });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.editor-box-content .group-value-editor-selector')).to.exist;
    expect(find('.group-visual-presenter')).to.not.exist;
  });

  it('shows a form when trying to provide group ID from selector view', async function () {
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');

    expect(find('.editor-box-content .group-value-editor-selector')).to.not.exist;
    expect(find('form')).to.exist;
    const groupIdField = find('.groupId-field');
    expect(groupIdField).to.have.trimmed.text('Group ID:');
    expect(groupIdField).to.contain('input');
    expect(findAll('input')).to.have.length(1);
    const cancelBtn = find('.cancel-btn');
    expect(cancelBtn).to.have.class('btn-default');
    expect(cancelBtn).to.have.trimmed.text('Cancel');
    expect(cancelBtn).to.not.have.attr('disabled');
    const acceptBtn = find('.accept-btn');
    expect(acceptBtn).to.have.class('btn-primary');
    expect(acceptBtn).to.have.trimmed.text('OK');
    expect(acceptBtn).to.have.attr('disabled');
  });

  it('allows to provide group ID from selector view', async function () {
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');
    await fillIn('.groupId-field input', exampleGroup.groupId);
    await click('.accept-btn');

    expect(this.stateManager.value).to.deep.equal(exampleGroup);
    expect(this.stateManager.isValid).to.be.true;
    expect(find('form')).to.not.exist;
    expect(find('.group-visual-presenter')).to.exist;
  });

  it('blocks confirmation button when provided group ID is empty', async function () {
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');
    await fillIn('.groupId-field input', exampleGroup.groupId);
    await fillIn('.groupId-field input', '');

    expect(find('.accept-btn')).to.have.attr('disabled');
  });

  it('allows to cancel group ID providing and come back to empty view', async function () {
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');
    await click('.cancel-btn');

    expect(this.stateManager.value).to.deep.equal({ groupId: '' });
    expect(this.stateManager.isValid).to.be.false;
    expect(find('.editor-box-content .group-value-editor-selector')).to.exist;
    expect(find('form')).to.not.exist;
  });

  it('shows selected group', async function () {
    this.stateManager.value = exampleGroup;

    await renderComponent();

    expect(find('.group-visual-presenter')).to.exist;
    expect(find('.details-icon')).to.have.class('oneicon-organization');
    expect(find('.group-name')).to.have.trimmed.text('g1idName');
    expect(find('.type-property .property-value')).to.have.trimmed.text(
      'Organization'
    );
  });

  it('shows change action when there is a selected group', async function () {
    this.stateManager.value = exampleGroup;

    await renderComponent();

    const changeAction = find('.editor-box-header .group-value-editor-selector');
    expect(changeAction).to.exist;
    expect(changeAction).to.have.trimmed.text('Change');
  });

  it('allows to change selected group by selecting another one', async function () {
    this.stateManager.value = { groupId: 'g0Id' };
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.select-groups-action-trigger');

    expect(this.editorContext.selectGroups).to.be.calledOnce
      .and.to.be.calledWith({
        allowMany: false,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
    await expectShowingExampleGroup(this);
  });

  it('allows to cancel another group selection when group is already selected', async function () {
    this.stateManager.value = exampleGroup;
    this.set('selectGroups', ({ onCancelled }) => onCancelled());
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.select-groups-action-trigger');

    await expectShowingExampleGroup(this);
  });

  it('allows to change selected group by providing ID of another one', async function () {
    this.stateManager.value = { groupId: 'g0Id' };
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');
    await fillIn('.groupId-field input', exampleGroup.groupId);
    await click('.accept-btn');

    await expectShowingExampleGroup(this);
  });

  it('allows to cancel another group ID providing when group is already selected', async function () {
    this.stateManager.value = exampleGroup;
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');
    await click('.cancel-btn');

    await expectShowingExampleGroup(this);
  });

  it('can be disabled when empty', async function () {
    this.stateManager.isDisabled = true;
    await renderComponent();

    expect(find('.group-value-editor-selector')).to.have.class('disabled');
  });

  it('can be disabled when showing a selected group', async function () {
    this.stateManager.isDisabled = true;
    this.stateManager.value = exampleGroup;
    await renderComponent();

    expect(find('.group-value-editor-selector')).to.not.exist;
  });

  it('can be disabled when providing group ID', async function () {
    await renderComponent();
    await click('.group-value-editor-selector');
    await click('.provide-group-id-action-trigger');

    this.stateManager.isDisabled = true;
    await settled();

    expect(find('button:not([disabled]')).to.not.exist;
    expect(find('input:not([disabled]')).to.not.exist;
  });
});

async function renderComponent() {
  await render(hbs`<AtmWorkflow::ValueEditors::Group::Editor
    @stateManager={{stateManager}}
    @editorId={{stateManager.rootValueEditorStateId}}
    @onRemove={{onRemove}}
  />`);
}

async function expectShowingExampleGroup(testCase) {
  expect(testCase.stateManager.value).to.deep.equal(exampleGroup);
  expect(testCase.stateManager.isValid).to.be.true;
  expect(find('.group-visual-presenter')).to.exist;
  expect(find('.type-property .property-value')).to.have.trimmed.text(
    'Organization'
  );
}
