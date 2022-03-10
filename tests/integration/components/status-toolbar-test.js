import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | status toolbar', function () {
  setupRenderingTest();

  it('hides icon if icon `enabled` property is set to false', async function () {
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" enabled=false}}
      {{/status-toolbar}}
    `);
    expect(this.$('.status-toolbar-icon')).to.be.hidden;
  });

  it('adds a class to icon based on status property', async function () {
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" status="some"}}
      {{/status-toolbar}}
    `);
    expect(this.$('.status-toolbar-icon')).to.have.class('some');
  });

  it('adds a subicon to status icon', async function () {
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" subIcon="checkbox" subIconClass="subicon"}}
      {{/status-toolbar}}
    `);
    expect(this.$('.oneicon-checkbox')).to.exist;
    expect(this.$('.oneicon-checkbox')).to.have.class('subicon');
  });

  it('triggers status icon click action', async function () {
    let clickOccurred = false;
    this.set('iconClick', () => clickOccurred = true);
    await render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" clickAction=(action iconClick)}}
      {{/status-toolbar}}
    `);
    click('.status-toolbar-icon').then(() => {
      expect(clickOccurred).to.be.true;
    });
  });
});
