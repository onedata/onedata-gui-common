import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, findAll } from '@ember/test-helpers';
import { Promise, reject } from 'rsvp';
import { GroupType } from 'onedata-gui-common/utils/group';

describe('Integration | Component | atm-workflow/value-presenters/group/table-body-row-presenter', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      context: {
        getGroupUrlById: async (id) => this.get('groupUrl')(id),
      },
      groupUrl: (id) => `/some/groupurl-${id}`,
    });
  });

  it('has classes "table-body-row-presenter" and "group-table-body-row-presenter"', async function () {
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter />`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('table-body-row-presenter')
      .and.to.have.class('group-table-body-row-presenter');
  });

  it('shows two columns - name and type', async function () {
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter />`);

    const tds = findAll('.table-body-row-presenter td');
    expect(tds).to.have.length(2);
    expect(tds[0]).to.have.class('column-name');
    expect(tds[1]).to.have.class('column-type');
  });

  it('shows complete information about a group', async function () {
    const group = this.set('group', {
      groupId: 'some_id',
      name: 'group1',
      type: GroupType.Organization,
    });
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.column-name .group-icon')).to.have.class('oneicon-organization');
    expect(find('.column-name .group-name')).to.have.trimmed.text('group1')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('groupUrl')(group.groupId));
    expect(find('.column-type')).to.have.trimmed.text('Organization');
  });

  it('handles case when all group properties are missing', async function () {
    this.set('group', null);
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.column-name .group-icon')).to.have.class('oneicon-group');
    expect(find('.column-name .group-name')).to.have.trimmed.text('Unknown')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.column-type')).to.have.trimmed.text('—');
  });

  it('handles case when all group properties are missing except ID', async function () {
    const group = this.set('group', {
      groupId: 'some_id',
    });
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.column-name .group-icon')).to.have.class('oneicon-group');
    expect(find('.column-name .group-name')).to.have.trimmed.text('Unknown')
      .and.to.match('a')
      .and.to.have.attr('href', this.get('groupUrl')(group.groupId));
    expect(find('.column-type')).to.have.trimmed.text('—');
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
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
        @context={{context}}
        @value={{group}}
      />`);

      expect(find('.column-name .group-icon')).to.have.class('oneicon-organization');
      expect(find('.column-name .group-name')).to.have.trimmed.text('group1')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-type')).to.have.trimmed.text('Organization');
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
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
        @context={{context}}
        @value={{group}}
      />`);

      expect(find('.column-name .group-icon')).to.have.class('oneicon-organization');
      expect(find('.column-name .group-name')).to.have.trimmed.text('group1')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-type')).to.have.trimmed.text('Organization');
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
    await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
      @context={{context}}
      @value={{group}}
    />`);

    expect(find('.column-name .group-icon')).to.have.class('oneicon-organization');
    expect(find('.column-name .group-name')).to.have.trimmed.text('group1')
      .and.to.match('span')
      .and.to.not.have.attr('href');
    expect(find('.column-type')).to.have.trimmed.text('Organization');
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
      await render(hbs`<AtmWorkflow::ValuePresenters::Group::TableBodyRowPresenter
        @value={{group}}
      />`);

      expect(find('.column-name .group-icon')).to.have.class('oneicon-organization');
      expect(find('.column-name .group-name')).to.have.trimmed.text('group1')
        .and.to.match('span')
        .and.to.not.have.attr('href');
      expect(find('.column-type')).to.have.trimmed.text('Organization');
    }
  );
});
