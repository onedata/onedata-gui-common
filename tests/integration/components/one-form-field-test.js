import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one form field', function () {
  setupComponentTest('one-form-field', {
    integration: true,
  });

  it('can render text input with provided value', function () {
    this.set('field', {
      name: 'one',
      type: 'text',
    });
    this.set('value', 'hello');
    this.render(hbs `
      {{one-form-field field=field value=value}}
    `);
    expect(this.$('input[type=text]')).to.have.length(1);
    expect(this.$('input').val()).to.be.equal('hello');
  });

  it('renders an input with a class with field name', function () {
    this.set('field', {
      name: 'one',
      type: 'text',
    });
    this.render(hbs `
      {{one-form-field field=field}}
    `);
    let $field = this.$('input');
    expect($field).to.have.class('field-one');
  });
});
