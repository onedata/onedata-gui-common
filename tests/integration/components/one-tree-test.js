import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';

import EventsBusStub from 'dummy/tests/helpers/events-bus-stub';

describe('Integration | Component | one tree', function () {
  setupComponentTest('one-tree', {
    integration: true
  });

  beforeEach(function () {
    this.register('service:events-bus', EventsBusStub);
    this.inject.service('events-bus', { as: 'eventsBus' });
    let eventsBus = this.container.lookup('service:events-bus');
    eventsBus.set('callbacks', []);
  });

  it('renders content in a tree', function () {
    this.render(hbs `
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

    let treeDirectItems = this.$('.item');
    let subtreeDirectItems = this.$('.subitem');
    expect(treeDirectItems).to.have.length(2);
    expect(subtreeDirectItems).to.have.length(1);
    expect($(treeDirectItems[0]).text()).to.contain('item1');
    expect($(treeDirectItems[1]).text()).to.contain('item2');
    expect($(subtreeDirectItems[0]).text()).to.contain('item2.1');
  });

  it('collapses/expands subtrees', function (done) {
    this.render(hbs `
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
    let subtree = this.$('.subtree');
    expect(subtree).to.have.class('collapse-hidden');
    wait().then(() => {
      this.$('.item-content').click();
      wait().then(() => {
        expect(subtree).to.not.have.class('collapse-hidden');
        done();
      });
    })
  });

  it('collapses children recursively when collapseRecursively==true', function (done) {
    this.render(hbs `
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

    let firstLevelItemContent = this.$('.first-level-item-content');
    let secondLevelItemContent = this.$('.second-level-item-content');
    let secondLevelSubtree = this.$('.second-level-subtree');

    wait().then(() => {
      firstLevelItemContent.click();
      secondLevelItemContent.click();
      wait().then(() => {
        expect(secondLevelSubtree).to.not.have.class('collapse-hidden');
        firstLevelItemContent.click();
        wait().then(() => {
          firstLevelItemContent.click();
          wait().then(() => {
            expect(secondLevelSubtree)
              .to.have.class('collapse-hidden');
            done();
          });
        });
      });
    });
  });

  it('does not collapse children recursively', function (done) {
    this.render(hbs `
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

    let firstLevelItemContent = this.$('.first-level-item-content');
    let secondLevelItemContent = this.$('.second-level-item-content');
    let secondLevelSubtree = this.$('.second-level-subtree');
    wait().then(() => {
      firstLevelItemContent.click();
      secondLevelItemContent.click();
      wait().then(() => {
        expect(secondLevelSubtree).to.not.have.class('collapse-hidden');
        firstLevelItemContent.click();
        wait().then(() => {
          firstLevelItemContent.click();
          wait().then(() => {
            expect(secondLevelSubtree)
              .to.not.have.class('collapse-hidden');
            done();
          });
        });
      });
    });
  });

  it('expands/collapses subtree after eventsBus trigger', function (done) {
    let eventsBus = this.container.lookup('service:events-bus');

    this.render(hbs `
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

    let itemTree = this.$('.item1-tree');
    expect(itemTree).to.have.class('collapse-hidden');
    eventsBus.trigger('one-tree:show', 'root', 'item1', true);
    wait().then(() => {
      expect(itemTree).to.not.have.class('collapse-hidden');
      done();
    });
  });

  it('toggles subtree after eventsBus trigger', function (done) {
    let eventsBus = this.container.lookup('service:events-bus');

    this.render(hbs `
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

    let subtree = this.$('.subtree');
    expect(subtree).to.have.class('collapse-hidden');
    eventsBus.trigger('one-tree:show', 'root', 'item1');
    wait().then(() => {
      expect(subtree).to.not.have.class('collapse-hidden');
      eventsBus.trigger('one-tree:show', 'root', 'item1');
      wait().then(() => {
        expect(subtree).to.have.class('collapse-hidden');
        done();
      });
    });
  });

  it('expands deeply nested subtree after eventsBus trigger', function (done) {
    let eventsBus = this.container.lookup('service:events-bus');

    this.render(hbs `
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

    let parentItemTree = this.$('.item1-tree');
    let childItemTree = this.$('.item11-tree');
    expect(parentItemTree).to.have.class('collapse-hidden');
    expect(childItemTree).to.have.class('collapse-hidden');
    eventsBus.trigger('one-tree:show', 'root', 'item11', true);
    wait().then(() => {
      expect(parentItemTree).to.not.have.class('collapse-hidden');
      expect(childItemTree).to.not.have.class('collapse-hidden');
      done();
    });
  });

  it('filters items', function (done) {
    this.render(hbs `
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

    wait().then(() => {
      expect(this.$('.item1')).to.have.class('collapse-hidden');
      done();
    });
  });

  it('does not filter nested items in items, that match', function (done) {
    this.render(hbs `
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

    wait().then(() => {
      expect(this.$('.item11')).to.not.have.class('collapse-hidden');
      done();
    });
  });

  it('highlights parents of items matched by filter', function (done) {
    this.render(hbs `
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

    wait().then(() => {
      expect(this.$('.item1-content')).to.have.class('semibold');
      expect(this.$('.item11-content')).to.not.have.class('semibold');
      expect(this.$('.item111-content')).to.not.have.class('semibold');
      done();
    });
  });
});
