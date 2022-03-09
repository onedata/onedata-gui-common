import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | checkbox list', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('items', [{
      name: 'a',
    }, {
      name: 'b',
    }]);
  });

  it('has class "checkbox-list"', async function () {
    await render(hbs `{{checkbox-list}}`);

    expect(this.$('.checkbox-list')).to.exist;
  });

  it('lists passed items by yielding each one', async function () {
    await render(hbs `
      {{#checkbox-list items=items as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const $renderedItems = this.$('.checkbox-list-item');
    expect($renderedItems).to.have.length(2);
    expect($renderedItems.eq(0).text().trim()).to.equal('a');
    expect($renderedItems.eq(1).text().trim()).to.equal('b');
  });

  it('shows initial selection state', async function () {
    this.set('selectedItems', [this.get('items')[0]]);

    await render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const $renderedItems = this.$('.checkbox-list-item');
    expect($renderedItems.eq(0).find('.one-checkbox')).to.have.class('checked');
    expect($renderedItems.eq(1).find('.one-checkbox')).to.not.have.class('checked');
  });

  it('notifies about selection change', async function () {
    this.set('selectedItems', []);
    const changeSpy = sinon.spy(nextSelectedItems => {
      this.set('selectedItems', nextSelectedItems);
    });
    this.set('change', changeSpy);

    await render(hbs `
      {{#checkbox-list
        items=items
        selectedItems=selectedItems
        onChange=(action change)
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
    'notifies about selection change when items array changed and some selected items disappeared',
    async function () {
      const items = this.get('items');
      this.set('selectedItems', []);
      const changeSpy = sinon.spy(nextSelectedItems => {
        this.set('selectedItems', nextSelectedItems);
      });
      this.set('change', changeSpy);

      await render(hbs `
        {{#checkbox-list
          items=items
          selectedItems=selectedItems
          onChange=(action change)
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

  it('shows selection state counter via header', async function () {
    this.set('selectedItems', [this.get('items')[0]]);

    await render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.selected-counter').text().trim()).to.equal('(1/2)');
  });

  it('shows total selection state via header', async function () {
    this.set('selectedItems', this.get('items'));

    await render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .one-checkbox')).to.have.class('checked');
  });

  it('shows mixed selection state via header', async function () {
    this.set('selectedItems', [this.get('items')[0]]);

    await render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .one-checkbox')).to.have.class('maybe');
  });

  it('shows empty selection state via header', async function () {
    await render(hbs `
      {{#checkbox-list items=items selectedItems=selectedItems as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const $headerCheckbox = this.$('.checkbox-list-header .one-checkbox');
    expect($headerCheckbox).to.not.have.class('checked');
    expect($headerCheckbox).to.not.have.class('maybe');
  });

  it('allows to change selection via header checkbox', async function () {
    const items = this.get('items');
    this.set('selectedItems', []);
    const changeSpy = sinon.spy(nextSelectedItems => {
      this.set('selectedItems', nextSelectedItems);
    });
    this.set('change', changeSpy);

    await render(hbs `
      {{#checkbox-list
        items=items
        selectedItems=selectedItems
        onChange=(action change)
        as |listItem|
      }}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    const headerCheckboxSelector = '.checkbox-list-header .one-checkbox';
    const firstItemCheckboxSelector =
      '.checkbox-list-item:first-child .one-checkbox';
    const $selectedCounter = this.$('.selected-counter');
    // At first select the first item to start from 'maybe' header checkbox state
    return click(firstItemCheckboxSelector)
      .then(() => click(headerCheckboxSelector))
      .then(() => {
        expect(changeSpy.lastCall).to.be.calledWith(items);
        expect($selectedCounter.text().trim()).to.equal('(2/2)');
      })
      .then(() => click(headerCheckboxSelector))
      .then(() => {
        expect(changeSpy.lastCall).to.be.calledWith([]);
        expect($selectedCounter.text().trim()).to.equal('(0/2)');
      })
      .then(() => click(headerCheckboxSelector))
      .then(() => {
        expect(changeSpy.lastCall).to.be.calledWith(items);
        expect($selectedCounter.text().trim()).to.equal('(2/2)');
      });
  });

  it('shows passed headerText', async function () {
    await render(hbs `
      {{#checkbox-list items=items headerText="listHeader" as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.header-text').text().trim()).to.equal('listHeader');
  });

  it('shows expanded list by default', async function () {
    await render(hbs `
      {{#checkbox-list items=items as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-collapse')).to.have.class('in');
  });

  it('shows collapsed list when isInitiallyExpanded is false', async function () {
    await render(hbs `
      {{#checkbox-list items=items isInitiallyExpanded=false as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-collapse')).to.not.have.class('in');
  });

  it('collapses and expands list via header click', async function () {
    await render(hbs `
      {{#checkbox-list items=items as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    return click('.checkbox-list-header')
      .then(() => expect(this.$('.checkbox-list-collapse')).to.not.have.class('in'))
      .then(() => click('.checkbox-list-header'))
      .then(() => expect(this.$('.checkbox-list-collapse')).to.have.class('in'));
  });

  it('shows arrow-down icon when list is collapsed', async function () {
    await render(hbs `
      {{#checkbox-list items=items isInitiallyExpanded=false as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .arrow-icon'))
      .to.have.class('oneicon-arrow-down');
  });

  it('shows arrow-up icon when list is expanded', async function () {
    await render(hbs `
      {{#checkbox-list items=items isInitiallyExpanded=true as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    expect(this.$('.checkbox-list-header .arrow-icon'))
      .to.have.class('oneicon-arrow-up');
  });

  it('does not collapse list on header checkbox click', async function () {
    await render(hbs `
      {{#checkbox-list items=items isInitiallyExpanded=true as |listItem|}}
        {{listItem.model.name}}
      {{/checkbox-list}}
    `);

    return click('.checkbox-list-header .one-checkbox')
      .then(() => expect(this.$('.checkbox-list-collapse')).to.have.class('in'));
  });

  it(
    'allows to change item checkbox value using label and yielded checkboxId',
    async function () {
      this.set('selectedItems', []);
      const changeSpy = sinon.spy(nextSelectedItems => {
        this.set('selectedItems', nextSelectedItems);
      });
      this.set('change', changeSpy);

      await render(hbs `
        {{#checkbox-list
          items=items
          selectedItems=selectedItems
          onChange=(action change)
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

  it(
    'renders <label> tag with model.name as a content for each item when component is not block',
    async function () {
      await render(hbs `{{checkbox-list items=items}}`);

      const $itemLabels = this.$('.checkbox-list-item label');
      expect($itemLabels).to.have.length(2);
      expect($itemLabels.eq(0).text().trim()).to.equal('a');
      expect($itemLabels.eq(1).text().trim()).to.equal('b');
      expect(this.$(`#${$itemLabels.attr('for')}`).attr('type')).to.equal('checkbox');
    }
  );

  it(
    'disables and unchecks total selection state checkbox when there are no items',
    async function () {
      await render(hbs `{{checkbox-list}}`);

      const $headerCheckbox = this.$('.checkbox-list-header .one-checkbox');
      expect($headerCheckbox).to.not.have.class('checked');
      expect($headerCheckbox).to.not.have.class('maybe');
      expect($headerCheckbox).to.have.class('disabled');
    }
  );

  it('does not allow to expand a list when there are no items', async function () {
    await render(hbs `{{checkbox-list isInitiallyExpanded=true}}`);

    const $collapse = this.$('.checkbox-list-collapse');
    expect($collapse).to.not.have.class('in');
    return click('.checkbox-list-header')
      .then(() => expect($collapse).to.not.have.class('in'));
  });

  it('does not change selection when onChange is not defined', async function () {
    await render(hbs `{{checkbox-list items=items}}`);

    return click('.checkbox-list-header .one-checkbox')
      .then(() =>
        expect(this.$('.one-checkbox.checked, .one-checkbox.maybe')).to.not.exist
      )
      .then(() => click('.checkbox-list-item:first-child .one-checkbox'))
      .then(() =>
        expect(this.$('.one-checkbox.checked, .one-checkbox.maybe')).to.not.exist
      );
  });

  it('does not collapse on selection change', async function () {
    this.set('change', nextSelectedItems => {
      this.set('selectedItems', nextSelectedItems);
    });

    await render(hbs `
      {{checkbox-list items=items onChange=(action change) isInitiallyExpanded=false}}
    `);

    return click('.checkbox-list-header')
      .then(() => click('.checkbox-list-header .one-checkbox'))
      .then(() => expect(this.$('.checkbox-list-collapse')).to.have.class('in'));
  });
});
