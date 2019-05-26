import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one form fields', function () {
  setupComponentTest('one-form-fields', {
    integration: true
  });

  it('puts an "optional" label in optional inputs', function () {
    let fields = [
      { name: 'one', type: 'text', label: 'One field', optional: true }
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({}));

    this.render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields}}
    {{/bs-form}}
    `);

    let formId = this.$('form').attr('id');
    let inputId = formId + '-one';

    expect(this.$(`label[for='${inputId}']`).text()).to.match(/optional/);
  });

  it('renders label tip if field should have one', function () {
    let fields = [
      { name: 'one', type: 'text', label: 'One field', tip: 'Field tip' }
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({}));

    this.render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields}}
    {{/bs-form}}
    `);

    let formId = this.$('form').attr('id');
    let inputId = formId + '-one';

    expect(this.$(`label[for='${inputId}'] .one-icon`).length).to.eq(1);
  });

  it('can render a text type input with given value', function () {
    const VALUE = 'some value';

    let fields = [
      { name: 'one', type: 'text' }
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({
      one: VALUE,
    }));

    this.render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields formValues=formValues}}
    {{/bs-form}}
    `);

    expect(this.$('input')).to.exist;
    expect(this.$('input')).to.have.value(VALUE);
  });

  it('can render form-control-static for type static', function () {
    const VALUE = 'some value';

    let fields = [
      { name: 'one', type: 'static', optional: true }
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({
      one: VALUE
    }));

    this.render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields formValues=formValues}}
    {{/bs-form}}
    `);

    expect(this.$('.form-control-static'), 'render form-control-static').to.exist;
    expect(this.$('.form-control-static')).to.contain(VALUE);
  });
});
