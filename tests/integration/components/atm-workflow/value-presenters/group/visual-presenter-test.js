import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import { Promise, reject } from 'rsvp';
import { GroupType } from 'onedata-gui-common/utils/group';

describe('Integration | Component | atm-workflow/value-presenters/group/visual-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      context: {
        getGroupUrlById: async (id) => this.get('groupUrl')(id),
      },
      groupUrl: (id) => `/some/groupurl-${id}`,
    });
  });

  it('has classes "visual-presenter" and "group-visual-presenter"', async function () {
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter />`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('visual-presenter')
      .and.to.have.class('group-visual-presenter');
  });

  it('shows complete information about a group', async function () {
    const group = this.set('group', {
      groupId: 'some_id',
      name: 'group1',
      type: GroupType.Organization,
    });
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.group-icon')).to.have.class('oneicon-organization');
    expect(find('.group-name')).to.have.trimmed.text('group1')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('groupUrl')(group.groupId));
    expect(find('.type-property .property-value'))
      .to.have.trimmed.text('Organization');
  });

  it('handles case when all group properties are missing', async function () {
    this.set('group', null);
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.group-icon')).to.have.class('oneicon-group');
    expect(find('.group-name')).to.have.trimmed.text('Unknown')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.type-property .property-value')).to.have.trimmed.text('—');
  });

  it('handles case when all group properties are missing except ID', async function () {
    const group = this.set('group', {
      groupId: 'some_id',
    });
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.group-icon')).to.have.class('oneicon-group');
    expect(find('.group-name')).to.have.trimmed.text('Unknown')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('groupUrl')(group.groupId));
    expect(find('.type-property .property-value')).to.have.trimmed.text('—');
  });

  it('shows available information about a group when all info callbacks resolve to null',
    async function () {
      this.setProperties({
        group: {
          groupId: 'some_id',
          name: 'group1',
          type: GroupType.Organization,
        },
        groupUrl: () => null,
      });
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
        @context={{context}}
        @value={{group}}
      />`);

      expect(find('.group-icon')).to.have.class('oneicon-organization');
      expect(find('.group-name')).to.have.trimmed.text('group1')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.type-property .property-value'))
        .to.have.trimmed.text('Organization');
    }
  );

  it('shows available information about a group when all info callbacks reject',
    async function () {
      this.setProperties({
        group: {
          groupId: 'some_id',
          name: 'group1',
          type: GroupType.Organization,
        },
        groupUrl: () => reject('someError1'),
      });
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
        @context={{context}}
        @value={{group}}
      />`);

      expect(find('.group-icon')).to.have.class('oneicon-organization');
      expect(find('.group-name')).to.have.trimmed.text('group1')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.type-property .property-value'))
        .to.have.trimmed.text('Organization');
    }
  );

  it('shows available information about a group when info callbacks are pending', async function () {
    this.setProperties({
      group: {
        groupId: 'some_id',
        name: 'group1',
        type: GroupType.Organization,
      },
      groupUrl: () => new Promise(() => {}),
    });
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.group-icon')).to.have.class('oneicon-organization');
    expect(find('.group-name')).to.have.trimmed.text('group1')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.type-property .property-value'))
      .to.have.trimmed.text('Organization');
  });

  it('shows available information about a group when context is not present',
    async function () {
      this.setProperties({
        group: {
          groupId: 'some_id',
          name: 'group1',
          type: GroupType.Organization,
        },
      });
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::VisualPresenter
        @value={{group}}
      />`);

      expect(find('.group-icon')).to.have.class('oneicon-organization');
      expect(find('.group-name')).to.have.trimmed.text('group1')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.type-property .property-value'))
        .to.have.trimmed.text('Organization');
    }
  );
});
