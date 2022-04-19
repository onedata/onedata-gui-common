import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one form fields', function () {
  setupRenderingTest();

  it('puts an "optional" label in optional inputs', async function () {
    let fields = [
      { name: 'one', type: 'text', label: 'One field', optional: true },
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({}));

    await render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields}}
    {{/bs-form}}
    `);

    let formId = find('form').id;
    let inputId = formId + '-one';

    expect(find(`label[for='${inputId}']`).textContent).to.match(/optional/);
  });

  it('renders label tip if field should have one', async function () {
    let fields = [
      { name: 'one', type: 'text', label: 'One field', tip: 'Field tip' },
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({}));

    await render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields}}
    {{/bs-form}}
    `);

    let formId = find('form').id;
    let inputId = formId + '-one';

    expect(findAll(`label[for='${inputId}'] .one-icon`).length).to.eq(1);
  });

  it('can render a text type input with given value', async function () {
    const VALUE = 'some value';

    let fields = [
      { name: 'one', type: 'text' },
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({
      one: VALUE,
    }));

    await render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields formValues=formValues}}
    {{/bs-form}}
    `);

    expect(find('input')).to.exist;
    expect(find('input').value).to.equal(VALUE);
  });

  it('can render form-control-static for type static', async function () {
    const VALUE = 'some value';

    let fields = [
      { name: 'one', type: 'static', optional: true },
    ];

    this.set('fields', fields);
    this.set('formValues', EmberObject.create({
      one: VALUE,
    }));

    await render(hbs `
    {{#bs-form as |form|}}
      {{one-form-fields bsForm=form fields=fields formValues=formValues}}
    {{/bs-form}}
    `);

    expect(find('.form-control-static'), 'render form-control-static').to.exist;
    expect(find('.form-control-static').textContent).to.contain(VALUE);
  });
});
