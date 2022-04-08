import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one form field static', function () {
  setupComponentTest('one-form-field-static', {
    integration: true,
  });

  it('renders with value', function () {
    this.set('field', {
      name: 'one',
      type: 'static',
    });
    this.set('value', 'hello');
    this.render(hbs `
      {{one-form-field-static field=field value=value}}
    `);

    const $field = this.$('.form-control-static');
    expect($field).to.have.length(1);
    expect($field.text()).to.match(new RegExp('hello'));
  });

  it('has a class with field name', function () {
    this.set('field', {
      name: 'one',
      type: 'static',
    });
    this.render(hbs `
      {{one-form-field-static field=field}}
    `);

    const $field = this.$('.form-control-static');
    expect($field).to.have.class('field-one');
  });
});
