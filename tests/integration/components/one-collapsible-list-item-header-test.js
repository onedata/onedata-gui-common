import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | one collapsible list item header', function () {
  setupComponentTest('one-collapsible-list-item-header', {
    integration: true,
  });

  it('propagates click events to btn-toolbar children', function () {
    let buttonClicked = false;
    this.on('actionOne', function () {
      buttonClicked = true;
    });

    this.render(hbs `
    {{#one-collapsible-list as |list|}}
      {{#list.item as |listItem|}}
        {{#listItem.header}}
          <h1>Some header</h1>
          <div class="btn-toolbar">
            <button class="btn btn-default btn-one" {{action "actionOne"}}>
              One
            </button>
          </div>
        {{/listItem.header}}
        {{#listItem.content}}
          hidden content
        {{/listItem.content}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    this.$('.btn-one').click();
    wait().then(() => {
      expect(buttonClicked).to.be.true;
    });
  });

  it('doesn\'t propagate click events outside btn-toolbar', function () {
    let actionOneInvoked = false;
    this.on('actionOne', function () {
      actionOneInvoked = true;
    });

    this.render(hbs `
    {{#one-collapsible-list as |list|}}
      {{#list.item toggle=(action "actionOne") as |listItem|}}
        {{#listItem.header}}
          <h1>Some header</h1>
          <button class="btn btn-default btn-one">
            One
          </button>
        {{/listItem.header}}
        {{#listItem.content}}
          hidden content
        {{/listItem.content}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    this.$('.btn-one').click();
    wait().then(() => {
      expect(actionOneInvoked).to.be.false;
    });
  });
});
