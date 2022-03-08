import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one form field static', function () {
  setupRenderingTest();

  it('renders with value', async function () {
    this.set('field', {
      name: 'one',
      type: 'static',
    });
    this.set('value', 'hello');
    await render(hbs `
      {{one-form-field-static field=field value=value}}
    `);

    let $field = this.$('.form-control-static');
    expect($field).to.have.length(1);
    expect($field.text()).to.match(new RegExp('hello'));
  });

  it('has a class with field name', async function () {
    this.set('field', {
      name: 'one',
      type: 'static',
    });
    await render(hbs `
      {{one-form-field-static field=field}}
    `);

    let $field = this.$('.form-control-static');
    expect($field).to.have.class('field-one');
  });
});
