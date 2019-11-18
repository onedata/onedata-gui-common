import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | checkbox list', function () {
  setupComponentTest('checkbox-list', {
    integration: true
  });

  beforeEach(function () {
    this.set('items', [{
      name: 'a',
    }, {
      name: 'b',
    }]);
  });

  it('has class "checkbox-list"', function () {
    this.render(hbs `{{checkbox-list}}`);

    expect(this.$('.checkbox-list')).to.exist;
  });

  it('lists passed items by yielding each one', function () {
    this.render(hbs `
      {{#checkbox-list items=items as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const $renderedItems = this.$('.checkbox-list-item');
    expect($renderedItems).to.have.length(2);
    expect($renderedItems.eq(0).text().trim()).to.equal('a');
    expect($renderedItems.eq(1).text().trim()).to.equal('b');
  });

  it('shows initial selection state', function () {
    this.set('selectedItems', [this.get('items')[0]]);

    this.render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const $renderedItems = this.$('.checkbox-list-item');
    expect($renderedItems.eq(0).find('.one-checkbox')).to.have.class('checked');
    expect($renderedItems.eq(1).find('.one-checkbox')).to.not.have.class('checked');
  });

  it('notifies about selection change', function () {
    this.set('selectedItems', []);
    const changeSpy = sinon.spy(nextSelectedItems => {
      this.set('selectedItems', nextSelectedItems);
    });
    this.on('change', changeSpy);

    this.render(hbs `
      {{#checkbox-list
        items=items
        selectedItems=selectedItems
        onChange=(action "change")
        as |listItem|
      }}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const firstItemCheckboxSelector =
      '.checkbox-list-item:first-child .one-checkbox';
    return click(firstItemCheckboxSelector)
      .then(() => {
        expect(changeSpy).to.be.calledOnce;
        expect(changeSpy).to.be.calledWith([this.get('items')[0]]);
        expect(this.$(firstItemCheckboxSelector)).to.have.class('checked');
      });
  });

  it(
    'notifies about selection change without items, that no longer are in items array',
    function () {
      const items = this.get('items');
      this.set('selectedItems', []);
      const changeSpy = sinon.spy(nextSelectedItems => {
        this.set('selectedItems', nextSelectedItems);
      });
      this.on('change', changeSpy);

      this.render(hbs `
        {{#checkbox-list
          items=items
          selectedItems=selectedItems
          onChange=(action "change")
          as |listItem|
        }}
          {{listItem.model.name}}
        {{/checkbox-list}}
      `);

      const firstItemCheckboxSelector =
        '.checkbox-list-item:first-child .one-checkbox';
      const lastItemCheckboxSelector =
        '.checkbox-list-item:last-child .one-checkbox';
      return click(firstItemCheckboxSelector)
        .then(() => click(lastItemCheckboxSelector))
        .then(() => this.set('items', [items[1]]))
        .then(() => {
          expect(changeSpy).to.be.calledThrice;
          expect(changeSpy.lastCall).to.be.calledWith([items[1]]);
          expect(this.$(firstItemCheckboxSelector)).to.have.class('checked');
        });
    }
  );

  it('shows total selection state via header', function () {
    this.set('selectedItems', this.get('items'));

    this.render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .one-checkbox')).to.have.class('checked');
  });

  it('shows mixed selection state via header', function () {
    this.set('selectedItems', [this.get('items')[0]]);

    this.render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .one-checkbox')).to.have.class('maybe');
  });

  it('shows empty selection state via header', function () {
    this.render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const $headerCheckbox = this.$('.checkbox-list-header .one-checkbox');
    expect($headerCheckbox).to.not.have.class('checked');
    expect($headerCheckbox).to.not.have.class('maybe');
  });

  it('allows to change selection via header checkbox', function () {
    const items = this.get('items');
    this.set('selectedItems', []);
    const changeSpy = sinon.spy(nextSelectedItems => {
      this.set('selectedItems', nextSelectedItems);
    });
    this.on('change', changeSpy);

    this.render(hbs `
      {{#checkbox-list
        items=items
        selectedItems=selectedItems
        onChange=(action "change")
        as |listItem|
      }}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const headerCheckboxSelector = '.checkbox-list-header .one-checkbox';
    const firstItemCheckboxSelector =
      '.checkbox-list-item:first-child .one-checkbox';
    return click(firstItemCheckboxSelector)
      .then(() => click(headerCheckboxSelector))
      .then(() => expect(changeSpy.lastCall).to.be.calledWith(items))
      .then(() => click(headerCheckboxSelector))
      .then(() => expect(changeSpy.lastCall).to.be.calledWith([]))
      .then(() => click(headerCheckboxSelector))
      .then(() => expect(changeSpy.lastCall).to.be.calledWith(items))
  });

  it('shows passed headerText', function () {
    this.render(hbs `
      {{#checkbox-list items=items headerText="listHeader" as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header').text().trim()).to.equal('listHeader');
  });

  it('shows expanded list by default', function () {
    this.render(hbs `
      {{#checkbox-list items=items as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-collapse')).to.have.class('in');
  });

  it('shows collapsed list when isExpanded is false', function () {
    this.render(hbs `
      {{#checkbox-list items=items isExpanded=false as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-collapse')).to.not.have.class('in');
  });

  it('collapses and expands list via header click', function () {
    this.render(hbs `
      {{#checkbox-list items=items as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    return click('.checkbox-list-header')
      .then(() => expect(this.$('.checkbox-list-collapse')).to.not.have.class('in'))
      .then(() => click('.checkbox-list-header'))
      .then(() => expect(this.$('.checkbox-list-collapse')).to.have.class('in'));
  });

  it('shows arrow-down icon when list is collapsed', function () {
    this.render(hbs `
      {{#checkbox-list items=items isExpanded=false as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .arrow-icon'))
      .to.have.class('oneicon-arrow-down');
  });

  it('shows arrow-up icon when list is expanded', function () {
    this.render(hbs `
      {{#checkbox-list items=items isExpanded=true as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .arrow-icon'))
      .to.have.class('oneicon-arrow-up');
  });

  it('does not collapse list on header checkbox click', function () {
    this.render(hbs `
      {{#checkbox-list items=items isExpanded=true as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    return click('.checkbox-list-header .one-checkbox')
      .then(() => expect(this.$('.checkbox-list-collapse')).to.have.class('in'));
  });

  it(
    'allows to change item checkbox value using label and yielded checkboxId',
    function () {
      this.set('selectedItems', []);
      const changeSpy = sinon.spy(nextSelectedItems => {
        this.set('selectedItems', nextSelectedItems);
      });
      this.on('change', changeSpy);

      this.render(hbs `
        {{#checkbox-list
          items=items
          selectedItems=selectedItems
          onChange=(action "change")
          as |listItem|
        }}
          {{listItem.checkbox}}
          <label for={{listItem.checkboxId}}>{{listItem.model.name}}</label>
        {{/checkbox-list}}
      `);

      return click('.checkbox-list-item:first-child label')
        .then(() => expect(changeSpy).to.be.calledWith([this.get('items')[0]]));
    }
  );
});
