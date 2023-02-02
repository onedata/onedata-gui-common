import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  render,
  click,
  settled,
  findAll,
  find,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { registerService } from '../../helpers/stub-service';

import EventsBusStub from 'dummy/tests/helpers/events-bus-stub';

describe('Integration | Component | one tree', function () {
  setupRenderingTest();

  beforeEach(function () {
    const eventsBus = this.set('eventsBus', registerService(this, 'events-bus', EventsBusStub));
    eventsBus.set('callbacks', []);
  });

  it('renders content in a tree', async function () {
    await render(hbs `
      {{#one-tree as |tree|}}
        {{#tree.item class="item" as |item|}}
          {{#item.content}}item1{{/item.content}}
        {{/tree.item}}
        {{#tree.item class="item" as |item|}}
          {{#item.content}}item2{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item class="subitem" as |subitem|}}
              {{#subitem.content}}item2.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const treeDirectItems = findAll('.item');
    const subtreeDirectItems = findAll('.subitem');
    expect(treeDirectItems).to.have.length(2);
    expect(subtreeDirectItems).to.have.length(1);
    expect(treeDirectItems[0].textContent).to.contain('item1');
    expect(treeDirectItems[1].textContent).to.contain('item2');
    expect(subtreeDirectItems[0].textContent).to.contain('item2.1');
  });

  it('collapses/expands subtrees', async function () {
    await render(hbs `
      {{#one-tree as |tree|}}
        {{#tree.item as |item|}}
          {{#item.content class="item-content"}}item1{{/item.content}}
          {{#item.subtree class="subtree" as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const subtree = find('.subtree');
    expect(subtree).to.have.class('collapse-hidden');

    await click('.item-content');
    expect(subtree).to.not.have.class('collapse-hidden');
  });

  it('collapses children recursively when collapseRecursively==true', async function () {
    await render(hbs `
      {{#one-tree collapseRecursively=true as |tree|}}
        {{#tree.item as |item|}}
          {{#item.content class="first-level-item-content"}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content class="second-level-item-content"}}item1.1{{/subitem.content}}
              {{#subitem.subtree class="second-level-subtree" as |subsubtree|}}
                {{#subsubtree.item as |subsubitem|}}
                  {{#subsubitem.content}}item1.1.1{{/subsubitem.content}}
                {{/subsubtree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const firstLevelItemContent = find('.first-level-item-content');
    const secondLevelItemContent = find('.second-level-item-content');
    const secondLevelSubtree = find('.second-level-subtree');

    await click(firstLevelItemContent);
    await click(secondLevelItemContent);
    expect(secondLevelSubtree).to.not.have.class('collapse-hidden');

    await click(firstLevelItemContent);
    await click(firstLevelItemContent);
    expect(secondLevelSubtree).to.have.class('collapse-hidden');
  });

  it('does not collapse children recursively', async function () {
    await render(hbs `
      {{#one-tree as |tree|}}
        {{#tree.item as |item|}}
          {{#item.content class="first-level-item-content"}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content class="second-level-item-content"}}item1.1{{/subitem.content}}
              {{#subitem.subtree class="second-level-subtree" as |subsubtree|}}
                {{#subsubtree.item as |subsubitem|}}
                  {{#subsubitem.content}}item1.1.1{{/subsubitem.content}}
                {{/subsubtree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const firstLevelItemContent = find('.first-level-item-content');
    const secondLevelItemContent = find('.second-level-item-content');
    const secondLevelSubtree = find('.second-level-subtree');

    await click(firstLevelItemContent);
    await click(secondLevelItemContent);
    expect(secondLevelSubtree).to.not.have.class('collapse-hidden');

    await click(firstLevelItemContent);
    await click(firstLevelItemContent);
    expect(secondLevelSubtree).to.not.have.class('collapse-hidden');
  });

  it('expands/collapses subtree after eventsBus trigger', async function () {
    const eventsBus = this.get('eventsBus');

    await render(hbs `
      {{#one-tree key="root" as |tree|}}
        {{#tree.item key="item1" class="item1" as |item|}}
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree class="item1-tree" as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const itemTree = find('.item1-tree');
    expect(itemTree).to.have.class('collapse-hidden');

    eventsBus.trigger('one-tree:show', 'root', 'item1', true);
    await settled();
    expect(itemTree).to.not.have.class('collapse-hidden');
  });

  it('toggles subtree after eventsBus trigger', async function () {
    const eventsBus = this.get('eventsBus');

    await render(hbs `
      {{#one-tree key="root" as |tree|}}
        {{#tree.item key="item1" as |item|}}
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree class="subtree" as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const subtree = find('.subtree');
    expect(subtree).to.have.class('collapse-hidden');

    eventsBus.trigger('one-tree:show', 'root', 'item1');
    await settled();
    expect(subtree).to.not.have.class('collapse-hidden');

    eventsBus.trigger('one-tree:show', 'root', 'item1');
    await settled();
    expect(subtree).to.have.class('collapse-hidden');
  });

  it('expands deeply nested subtree after eventsBus trigger', async function () {
    const eventsBus = this.get('eventsBus');

    await render(hbs `
      {{#one-tree key="root" as |tree|}}
        {{#tree.item as |item|}}
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree class="item1-tree" as |subtree|}}
            {{#subtree.item key="item11" as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
              {{#subitem.subtree class="item11-tree" as |subsubtree|}}
                {{#subsubtree.item as |subsubitem|}}
                  {{#subsubitem.content}}item1.1.1{{/subsubitem.content}}
                {{/subsubtree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    const parentItemTree = find('.item1-tree');
    const childItemTree = find('.item11-tree');
    expect(parentItemTree).to.have.class('collapse-hidden');
    expect(childItemTree).to.have.class('collapse-hidden');

    eventsBus.trigger('one-tree:show', 'root', 'item11', true);
    await settled();
    expect(parentItemTree).to.not.have.class('collapse-hidden');
    expect(childItemTree).to.not.have.class('collapse-hidden');
  });

  it('filters items', async function () {
    await render(hbs `
      {{#one-tree searchQuery="item2" as |tree|}}
        {{#tree.item class="item1" as |item|}}
          {{#item.content}}item1aaa{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item class="item11" as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
        {{#tree.item class="item2" as |item|}}
          {{#item.content}}item2{{/item.content}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    expect(find('.item1')).to.have.class('collapse-hidden');
  });

  it('does not filter nested items in items, that match', async function () {
    await render(hbs `
      {{#one-tree searchQuery="item1" as |tree|}}
        {{#tree.item class="item1" as |item|}}
          {{#item.content}}item1aaa{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item class="item11" as |subitem|}}
              {{#subitem.content}}abc{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    expect(find('.item11')).to.not.have.class('collapse-hidden');
  });

  it('highlights parents of items matched by filter', async function () {
    await render(hbs `
      {{#one-tree searchQuery="item1" as |tree|}}
        {{#tree.item as |item|}}
          {{#item.content class="item1-content"}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content class="item11-content"}}item1a{{/subitem.content}}
              {{#subitem.subtree as |sub2tree|}}
                {{#sub2tree.item as |sub2item|}}
                  {{#sub2item.content class="item111-content"}}abc{{/sub2item.content}}
                {{/sub2tree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}}
      {{/one-tree}}
    `);

    expect(find('.item1-content')).to.have.class('semibold');
    expect(find('.item11-content')).to.not.have.class('semibold');
    expect(find('.item111-content')).to.not.have.class('semibold');
  });
});
