import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Action from 'onedata-gui-common/utils/action';
import $ from 'jquery';
import sinon from 'sinon';
import { ResourceListItem } from 'onedata-gui-common/components/resources-list';

describe('Integration | Component | resources list', function () {
  setupRenderingTest();

  it('has class "resources-list', async function () {
    await render(hbs `{{resources-list}}`);

    expect(this.$('.resources-list')).to.exist;
  });

  it(
    'shows list of items with specified labels and icons (sorted by labels)',
    async function () {
      this.set('items', [ResourceListItem.create({
        icon: 'space',
        label: 'def',
      }), ResourceListItem.create({
        icon: 'group',
        label: 'abc',
      })]);

      await render(hbs `{{resources-list items=items}}`);

      const $items = this.$('.resource-item');
      expect($items).to.have.length(2);
      expect($items.eq(0).text().trim()).to.equal('abc');
      expect($items.eq(0).find('.oneicon-group')).to.exist;
      expect($items.eq(1).text().trim()).to.equal('def');
      expect($items.eq(1).find('.oneicon-space')).to.exist;
    }
  );

  it(
    'shows conflicting labels when conflictingLabelSourcePath is set for item',
    async function () {
      this.set('items', [ResourceListItem.create({
        conflictingLabelSource: {
          name: 'abc',
          conflictLabel: 'def',
        },
        // label to test if it will be ignored
        label: 'label',
      })]);

      await render(hbs `{{resources-list items=items}}`);

      const $items = this.$('.resource-item');
      expect($items).to.have.length(1);
      const $itemText = $items.text();
      expect($itemText).to.contain('abc');
      expect($itemText).to.contain('def');
      expect($itemText).to.not.contain('label');
    }
  );

  it(
    'does not show actions trigger when no actions were defined',
    async function () {
      this.set('items', [ResourceListItem.create({
        icon: 'group',
        label: 'abc',
      })]);

      await render(hbs `{{resources-list items=items}}`);

      expect(this.$('.resource-item .btn-menu-toggle')).to.not.exist;
    }
  );

  it(
    'shows actions trigger when actions were defined',
    async function () {
      this.set('items', [ResourceListItem.create({
        icon: 'group',
        label: 'abc',
        actions: [Action.create({
          title: 'sth',
        })],
      })]);

      await render(hbs `{{resources-list items=items}}`);

      expect(this.$('.resource-item .btn-menu-toggle')).to.exist;
      return click('.btn-menu-toggle')
        .then(() => expect($('.dropdown-menu').text()).to.contain('sth'));
    }
  );

  it(
    'calls passed action on action click',
    async function () {
      const action = Action.create({
        execute: () => {},
        title: 'sth',
      });
      const executeSpy = sinon.spy(action, 'execute');
      this.set('items', [ResourceListItem.create({
        icon: 'group',
        label: 'abc',
        actions: [action],
      })]);

      await render(hbs `{{resources-list items=items}}`);

      return click('.btn-menu-toggle')
        .then(() => click($('.dropdown-menu .one-collapsible-toolbar-item a')[0]))
        .then(() => expect(executeSpy).to.be.calledOnce);
    }
  );
});
