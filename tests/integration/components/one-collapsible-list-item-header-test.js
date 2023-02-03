import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one collapsible list item header', function () {
  setupRenderingTest();

  it('propagates click events to btn-toolbar children', async function () {
    let buttonClicked = false;
    this.set('actionOne', function () {
      buttonClicked = true;
    });

    await render(hbs `
      {{#one-collapsible-list as |list|}}
        {{#list.item as |listItem|}}
          {{#listItem.header}}
            <h1>Some header</h1>
            <div class="btn-toolbar">
              <button class="btn btn-default btn-one" {{action actionOne}}>
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

    await click('.btn-one');

    expect(buttonClicked).to.be.true;
  });

  it('doesn\'t propagate click events outside btn-toolbar', async function () {
    let actionOneInvoked = false;
    this.set('actionOne', function () {
      actionOneInvoked = true;
    });

    await render(hbs `
      {{#one-collapsible-list as |list|}}
        {{#list.item toggle=(action actionOne) as |listItem|}}
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

    await click('.btn-one');

    expect(actionOneInvoked).to.be.false;
  });
});
