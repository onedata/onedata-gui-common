import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | one list wrapper', function () {
  setupComponentTest('one-list-wrapper', {
    integration: true
  });

  beforeEach(function () {
    this.set('items', [{
      name: 'item1',
    }, {
      name: 'item2',
    }]);
  });

  it('yields items', function () {
    this.render(hbs `
      {{#one-list-wrapper items=items as |item|}}
        <li class="list-item">{{item.name}}</li>  
      {{/one-list-wrapper}}
    `);

    const $listItems = this.$('.list-item');
    expect($listItems).to.have.length(2);
    expect($listItems).to.contain('item1');
    expect($listItems).to.contain('item2');
  })

  it('filter items', function () {
    this.render(hbs `
      {{#one-list-wrapper items=items as |item|}}
        <li class="list-item">{{item.name}}</li>  
      {{/one-list-wrapper}}
    `);

    return fillIn('.search-bar', '1')
      .then(() => {
        const $listItems = this.$('.list-item');
        expect($listItems).to.have.length(1);
        expect($listItems).to.contain('item1');
      })
  });
});
