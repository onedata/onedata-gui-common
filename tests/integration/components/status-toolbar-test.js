import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | status toolbar', function() {
  setupComponentTest('status-toolbar', {
    integration: true
  });

  it('hides icon if icon `enabled` property is set to false', function () {
    this.render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" enabled=false}}
      {{/status-toolbar}}
    `);
    expect(this.$('.status-toolbar-icon')).to.be.hidden;
  });

  it('adds a class to icon based on status property', function () {
    this.render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" status="some"}}
      {{/status-toolbar}}
    `);
    expect(this.$('.status-toolbar-icon')).to.have.class('some');
  });

  it('adds a subicon to status icon', function () {
    this.render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" subIcon="checkbox" subIconClass="subicon"}}
      {{/status-toolbar}}
    `);
    expect(this.$('.oneicon-checkbox')).to.exist;
    expect(this.$('.oneicon-checkbox')).to.have.class('subicon');
  });

  it('triggers status icon click action', function () {
    let clickOccurred = false;
    this.on('iconClick', () => clickOccurred = true);
    this.render(hbs `
      {{#status-toolbar as |toolbar|}}
        {{toolbar.icon icon="space" clickAction=(action "iconClick")}}
      {{/status-toolbar}}
    `);
    click('.status-toolbar-icon').then(() => {
      expect(clickOccurred).to.be.true;
    });
  });
});
