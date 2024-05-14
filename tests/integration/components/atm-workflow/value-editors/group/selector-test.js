import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

describe('Integration | Component | atm-workflow/value-editors/group/selector', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      atmDataSpec: {
        type: AtmDataSpecType.Group,
      },
      editorContext: {
        selectGroups: sinon.spy(),
      },
      allowManyGroups: false,
      triggerText: 'trigger text',
    });
  });

  it('renders selector trigger in a form of a link with class "group-value-editor-selector"',
    async function () {
      await renderComponent();

      const trigger = find('a');
      expect(trigger).to.have.class('group-value-editor-selector');
      expect(trigger).to.have.trimmed.text(this.triggerText);
    }
  );

  it('shows "select groups" and "enter group id" actions in popover after trigger click',
    async function () {
      await renderComponent();

      await click('.group-value-editor-selector');

      const actions = findAll('.group-value-editor-selector-actions a');
      expect(actions).to.have.length(2);
      expect(actions[0]).to.have.trimmed.text('Select group');
      expect(actions[0]).to.have.class('select-groups-action-trigger');
      expect(actions[0].parentElement).to.not.have.class('disabled');
      expect(actions[1]).to.have.trimmed.text('Enter group ID');
      expect(actions[1]).to.have.class('provide-group-id-action-trigger');
      expect(actions[1].parentElement).to.not.have.class('disabled');
    }
  );

  it('uses different label for "select groups" action when "allowManyGroups" is true',
    async function () {
      this.set('allowManyGroups', true);
      await renderComponent();

      await click('.group-value-editor-selector');

      expect(find('.select-groups-action-trigger'))
        .to.have.trimmed.text('Select groups');
    }
  );

  it('calls "onIdProvidingStarted" when "enter group id" action has been clicked',
    async function () {
      const actionSpy = this.set('onIdProvidingStarted', sinon.spy());
      await renderComponent();

      await click('.group-value-editor-selector');
      expect(actionSpy).to.be.not.called;
      await click('.provide-group-id-action-trigger');

      expect(actionSpy).to.be.calledOnce;
    }
  );

  it('calls "editorContext.selectGroups" when "select groups" action has been clicked',
    async function () {
      await renderComponent();

      await click('.group-value-editor-selector');
      expect(this.editorContext.selectGroups).to.be.not.called;
      await click('.select-groups-action-trigger');

      expect(this.editorContext.selectGroups).to.be.calledOnce
        .and.to.be.calledWith({
          allowMany: false,
          onSelected: sinon.match.func,
          onCancelled: sinon.match.func,
        });
    }
  );

  it('calls "onGroupsSelected" when "select groups" action has been clicked and groups have been selected',
    async function () {
      const groupsToSelect = [{ groupId: '1' }];
      let onSelectedCallback;
      this.set(
        'editorContext.selectGroups',
        ({ onSelected }) => onSelectedCallback = onSelected
      );
      const onGroupsSelected = this.set('onGroupsSelected', sinon.spy());
      await renderComponent();

      await click('.group-value-editor-selector');
      await click('.select-groups-action-trigger');
      expect(onGroupsSelected).to.be.not.called;
      onSelectedCallback(groupsToSelect);
      await settled();

      expect(onGroupsSelected).to.be.calledOnce.and.to.be.calledWith(groupsToSelect);
    }
  );

  it('does not call "onGroupsSelected" when "select groups" action has been clicked and groups selection has been cancelled',
    async function () {
      this.set('editorContext.selectGroups', ({ onCancelled }) => onCancelled());
      const onGroupsSelected = this.set('onGroupsSelected', sinon.spy());
      await renderComponent();

      await click('.group-value-editor-selector');
      await click('.select-groups-action-trigger');
      await settled();

      expect(onGroupsSelected).to.be.not.called;
    }
  );

  it('passes custom parameters to groups selector', async function () {
    this.set('allowManyGroups', true);
    await renderComponent();

    await click('.group-value-editor-selector');
    await click('.select-groups-action-trigger');

    expect(this.editorContext.selectGroups).to.be.calledOnce
      .and.to.be.calledWith({
        allowMany: true,
        onSelected: sinon.match.func,
        onCancelled: sinon.match.func,
      });
  });

  it('has disabled "select groups" action when "editorContext.selectGroups" is not provided',
    async function () {
      this.set('editorContext.selectGroups', undefined);
      await renderComponent();

      await click('.group-value-editor-selector');

      expect(find('.select-groups-action-trigger').parentElement)
        .to.have.class('disabled');
    }
  );
});

async function renderComponent() {
  await render(hbs`{{#atm-workflow/value-editors/group/selector
    atmDataSpec=atmDataSpec
    editorContext=editorContext
    onGroupsSelected=onGroupsSelected
    onIdProvidingStarted=onIdProvidingStarted
    allowManyGroups=allowManyGroups
  }}
    {{triggerText}}
  {{/atm-workflow/value-editors/group/selector}}`);
}
