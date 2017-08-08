import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one way toggle', function () {
  setupComponentTest('one-way-toggle', {
    integration: true
  });

  it('renders checked toggle when passed checked value true', function () {
    this.render(hbs `{{one-way-toggle checked=true}}`);

    let $toggle = this.$('.one-way-toggle');

    expect($toggle.find('input[type=checkbox]')).to.have.prop('checked', true);
  });

  it('renders unchecked toggle when passed checked value false', function () {
    this.render(hbs `{{one-way-toggle checked=false}}`);

    let $toggle = this.$('.one-way-toggle');

    expect($toggle.find('input[type=checkbox]')).to.have.prop('checked', false);
  });
});
