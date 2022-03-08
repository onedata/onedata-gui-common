import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import $ from 'jquery';

describe('Integration | Component | one collapsible list', function () {
  setupRenderingTest();

  it('renders items with headers', async function () {
    await render(hbs `
      {{#one-collapsible-list class="some-list" as |list|}}
        {{#list.item class="some-item" as |listItem|}}
          {{#listItem.header class="some-header"}}
            some header
          {{/listItem.header}}
          {{#listItem.content class="some-content"}}
            some content
          {{/listItem.content}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    expect($('.some-list')).to.exist;
    expect($('.some-item')).to.exist;
    expect($('.some-header')).to.exist;
    expect($('.some-header')).to.contain('some header');
    expect($('.some-content')).to.exist;
    expect($('.some-content')).to.contain('some content');
  });

  it('handles item select', async function () {
    const itemValue = 1;
    this.set('itemValue', itemValue);

    const selectionChangedSpy = sinon.spy();
    this.set('selectionChanged', selectionChangedSpy);

    await render(hbs `
      {{#one-collapsible-list
        hasCheckboxes=true
        selectionChanged=(action selectionChanged)
        as |list|}}
        {{#list.item selectionValue=itemValue as |listItem|}}
          {{#listItem.header class="first-item-header"}}
            <h1>Some header</h1>
          {{/listItem.header}}
          {{#listItem.content}}
            some content
          {{/listItem.content}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    await click('.first-item-header .one-checkbox');

    expect(selectionChangedSpy).to.be.calledOnce;
    expect(
      selectionChangedSpy,
      `selectionChanged args: ${selectionChangedSpy.getCalls()[0].args.join(',')}`
    ).to.be.calledWith(
      sinon.match(args => args.length === 1 && args[0] === itemValue)
    );
  });

  it('handles item deselect', async function () {
    const itemValue = 1;
    this.set('itemValue', itemValue);

    const selectionChangedSpy = sinon.spy();
    this.set('selectionChanged', selectionChangedSpy);

    await render(hbs `
      {{#one-collapsible-list
        hasCheckboxes=true
        selectionChanged=(action selectionChanged)
        as |list|}}
        {{#list.item selectionValue=itemValue as |listItem|}}
          {{#listItem.header class="first-item-header"}}
            <h1>Some header</h1>
          {{/listItem.header}}
          {{#listItem.content}}
            some content
          {{/listItem.content}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    await click('.first-item-header .one-checkbox');
    await click('.first-item-header .one-checkbox');

    expect(selectionChangedSpy).to.be.calledTwice;
    const selection = selectionChangedSpy.args[1][0];
    expect(selection).to.be.an('array').that.is.empty;
  });

  it('ignores item selection if selectionValue is not set', async function () {
    const selectionChangedSpy = sinon.spy();
    this.set('selectionChanged', selectionChangedSpy);

    await render(hbs `
      {{#one-collapsible-list
        hasCheckboxes=true
        selectionChanged=(action selectionChanged)
        as |list|}}
        {{#list.item as |listItem|}}
          {{#listItem.header class="first-item-header"}}
            <h1>Some header</h1>
          {{/listItem.header}}
          {{#listItem.content}}
            some content
          {{/listItem.content}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    await click('.first-item-header input');

    expect(this.$('.first-item-header input')).to.be.disabled;
    expect(selectionChangedSpy).to.be.not.called;
  });

  it('can select all items', async function () {
    const selectionChangedSpy = sinon.spy();
    this.set('selectionChanged', selectionChangedSpy);

    await render(hbs `
      {{#one-collapsible-list
        hasCheckboxes=true
        selectionChanged=(action selectionChanged)
        as |list|}}
        {{list.header}}
        {{#list.item selectionValue=1 as |listItem|}}
          {{#listItem.header}}
            <h1>Some header</h1>
          {{/listItem.header}}
        {{/list.item}}
        {{#list.item selectionValue=2 as |listItem|}}
          {{#listItem.header}}
            <h1>Some header</h1>
          {{/listItem.header}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    await click('.one-collapsible-list-header .one-checkbox');

    expect(selectionChangedSpy).to.be.calledOnce;
    const selection = selectionChangedSpy.args[0][0];
    expect(selection).to.be.an('array').with.length(2);
    expect(selection).to.include.members([1, 2]);
  });

  it('can filter items', async function () {
    await render(hbs `
      {{#one-collapsible-list as |list|}}
        {{list.header}}
        {{#list.item as |listItem|}}
          {{#listItem.header}}
            <h1>item1</h1>
          {{/listItem.header}}
        {{/list.item}}
        {{#list.item as |listItem|}}
          {{#listItem.header}}
            <h1>item2</h1>
          {{/listItem.header}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    await fillIn('.one-collapsible-list-header .search-bar', 'item1');

    expect(this.$('.one-collapsible-list-item.collapse-hidden')).to.exist;
  });

  it('shows filtered out and checked items', async function () {
    await render(hbs `
      {{#one-collapsible-list
        hasCheckboxes=true
        as |list|}}
        {{list.header}}
        {{#list.item class="item1" selectionValue=1 as |listItem|}}
          {{#listItem.header}}
            <h1>item1</h1>
          {{/listItem.header}}
        {{/list.item}}
        {{#list.item selectionValue=2 as |listItem|}}
          {{#listItem.header}}
            <h1>item2</h1>
          {{/listItem.header}}
        {{/list.item}}
      {{/one-collapsible-list}}
    `);

    await click('.item1 .one-checkbox');
    await fillIn('.one-collapsible-list-header .search-bar', 'item2');

    const item1 = this.$('.item1');
    expect(item1).to.have.class('selected');
    expect(item1).not.to.have.class('collapse-hidden');
    expect(item1.find('.header-fixed')).to.exist;
  });
});
