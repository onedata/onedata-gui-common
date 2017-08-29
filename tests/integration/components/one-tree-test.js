import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

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
        {{#tree.item as |item|}}
          {{#item.content}}item1{{/item.content}}
        {{/tree.item}}
        {{#tree.item as |item|}}
          {{#item.content}}item2{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item2.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);
    let tree = this.$('.one-tree-root');
    let treeDirectItems = tree.find('> .one-tree-list > .one-tree-item');
    let subtreeDirectItems =
      this.$(treeDirectItems[1]).find(
        '> .one-tree > .one-tree-list > .one-tree-item');
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
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);
    let tree = this.$('.one-tree-root');
    let subtree = tree.find('.one-tree');
    expect(subtree).to.have.class('collapse-hidden');
    wait().then(() => {
      tree.find('> .one-tree-list > .one-tree-item > .one-tree-item-content')
        .click();
      wait().then(() => {
        console.log(subtree);
        expect(subtree).to.not.have.class('collapse-hidden');
        done();
      });
    })
  });

  it('collapses children recursively when collapseRecursively==true', function (done) {
    this.render(hbs `
      {{#one-tree collapseRecursively=true as |tree|}}
        {{#tree.item as |item|}}
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
              {{#subitem.subtree as |subsubtree|}}
                {{#subsubtree.item as |subsubitem|}}
                  {{#subsubitem.content}}item1.1.1{{/subsubitem.content}}
                {{/subsubtree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);
    let tree = this.$('.one-tree-root');
    let firstLevelItem = tree.find('> .one-tree-list > .one-tree-item');
    let secondLevelItem =
      firstLevelItem.find('> .one-tree > .one-tree-list > .one-tree-item');
    let secondLevelSubtree = secondLevelItem.find('> .one-tree');

    wait().then(() => {
      firstLevelItem.find('> .one-tree-item-content').click();
      secondLevelItem.find('> .one-tree-item-content').click();
      wait().then(() => {
        expect(secondLevelSubtree).to.not.have.class('collapse-hidden');
        firstLevelItem.find('> .one-tree-item-content').click();
        wait().then(() => {
          firstLevelItem.find('> .one-tree-item-content').click();
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
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
              {{#subitem.subtree as |subsubtree|}}
                {{#subsubtree.item as |subsubitem|}}
                  {{#subsubitem.content}}item1.1.1{{/subsubitem.content}}
                {{/subsubtree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);
    let tree = this.$('.one-tree-root');
    let firstLevelItem = tree.find('> .one-tree-item');
    let secondLevelItem =
      firstLevelItem.find('> .one-tree > .one-tree-list > .one-tree-item');
    let secondLevelSubtree = secondLevelItem.find('> .one-tree');

    firstLevelItem.find('> .one-tree-item-content').click();
    secondLevelItem.find('> .one-tree-item-content').click();
    wait().then(() => {
      expect(secondLevelSubtree).to.not.have.class('collapse-hidden');
      firstLevelItem.find('> .one-tree-item-content').click();
      wait().then(() => {
        firstLevelItem.find('> .one-tree-item-content').click();
        wait().then(() => {
          expect(secondLevelSubtree).to.not.have.class(
            'collapse-hidden');
          done();
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
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);

    let item = this.$('.item1');
    expect(item.find('> .one-tree')).to.have.class('collapse-hidden');
    eventsBus.trigger('one-tree:show', 'root', 'item1', true);
    wait().then(() => {
      expect(item.find('> .one-tree')).to.not.have.class('collapse-hidden');
      done();
    });
  });

  it('toggles subtree after eventsBus trigger', function (done) {
    let eventsBus = this.container.lookup('service:events-bus');

    this.render(hbs `
      {{#one-tree key="root" as |tree|}}
        {{#tree.item key="item1" class="item1" as |item|}}
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);

    let item = this.$('.item1');
    expect(item.find('> .one-tree')).to.have.class('collapse-hidden');
    eventsBus.trigger('one-tree:show', 'root', 'item1');
    wait().then(() => {
      expect(item.find('> .one-tree')).to.not.have.class('collapse-hidden');
      eventsBus.trigger('one-tree:show', 'root', 'item1');
      wait().then(() => {
        expect(item.find('> .one-tree')).to.have.class('collapse-hidden');
        done();
      });
    });
  });

  it('expands deeply nested subtree after eventsBus trigger', function (done) {
    let eventsBus = this.container.lookup('service:events-bus');

    this.render(hbs `
      {{#one-tree key="root" as |tree|}}
        {{#tree.item class="item1" as |item|}}
          {{#item.content}}item1{{/item.content}}
          {{#item.subtree as |subtree|}}
            {{#subtree.item class="item11" key="item11" as |subitem|}}
              {{#subitem.content}}item1.1{{/subitem.content}}
              {{#subitem.subtree as |subsubtree|}}
                {{#subsubtree.item as |subsubitem|}}
                  {{#subsubitem.content}}item1.1.1{{/subsubitem.content}}
                {{/subsubtree.item}}
              {{/subitem.subtree}}
            {{/subtree.item}}
          {{/item.subtree}}
        {{/tree.item}} 
      {{/one-tree}}
    `);

    let parentItem = this.$('.item1');
    let childItem = this.$('.item11');
    expect(parentItem.find('> .one-tree')).to.have.class('collapse-hidden');
    expect(childItem.find('> .one-tree')).to.have.class('collapse-hidden');
    eventsBus.trigger('one-tree:show', 'root', 'item11', true);
    wait().then(() => {
      expect(parentItem.find('> .one-tree')).to.not.have.class(
        'collapse-hidden');
      expect(childItem.find('> .one-tree')).to.not.have.class('collapse-hidden');
      done();
    });
  });
});
