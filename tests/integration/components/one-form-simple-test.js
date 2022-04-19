import EmberObject, { setProperties } from '@ember/object';
import { reject } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, blur, fillIn, focus, settled, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const errorMsg = 'error!';

describe('Integration | Component | one form simple', function () {
  setupRenderingTest();

  beforeEach(function () {
    const FIELDS = [{
        name: 'first',
        type: 'text',
      },
      {
        name: 'second',
        type: 'text',
      },
    ];

    const VALIDATIONS = EmberObject.create({
      errors: [
        EmberObject.create({
          attribute: 'allFieldsValues.main.first',
          message: errorMsg,
        }),
      ],
    });

    this.set('fields', FIELDS);
    this.set('fakeValidations', VALIDATIONS);
  });

  it('renders injected fields', async function () {
    await render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    expect(find('.field-main-first'), 'field first').to.exist;
    expect(find('.field-main-second'), 'field second').to.exist;
  });

  it('renders errors after field change', async function () {
    await render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    const firstField = find('.field-main-first');
    const firstFieldMsg =
      firstField.closest('.form-group').querySelector('.form-message');
    expect(firstFieldMsg.textContent.trim(), 'field has no error before value change')
      .to.be.empty;

    await fillIn(firstField, '');
    expect(firstFieldMsg.textContent.trim(), 'field has error after change')
      .to.equal(errorMsg);
  });

  it('renders errors after field loses its focus', async function () {
    await render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    const firstField = find('.field-main-first');
    const firstFieldMsg =
      firstField.closest('.form-group').querySelector('.form-message');
    expect(firstFieldMsg.textContent, 'field has no error before value change')
      .to.be.empty;

    await focus(firstField);
    await blur(firstField);
    expect(firstFieldMsg.textContent, 'field has error after lost focus')
      .to.equal(errorMsg);
  });

  it('reacts when field error changes', async function () {
    await render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    const newErrorMsg = 'error2!';
    const firstField = find('.field-main-first');
    const firstFieldMsg =
      firstField.closest('.form-group').querySelector('.form-message');

    this.get('fakeValidations.errors')[0].set('message', newErrorMsg);
    await focus(firstField);
    await blur(firstField);
    expect(firstFieldMsg.textContent, 'field has its another error')
      .to.equal(newErrorMsg);
  });

  it('changes submit button "disable" attribute', async function () {
    let submitOccurred = false;
    this.set('submitAction', () => {
      submitOccurred = true;
      return reject();
    });

    await render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submit=(action submitAction)
    }}
      `);

    let submitBtn = find('button[type=submit]');
    expect(
      submitBtn.disabled,
      'submit button is disabled if form is not valid'
    ).to.be.true;

    setProperties(this.get('fakeValidations'), {
      errors: [],
      isValid: true,
    });
    await settled();
    expect(
      submitBtn.disabled,
      'submit button is enabled if form is valid'
    ).to.equal(false);

    await click(submitBtn);
    expect(submitOccurred, 'submitAction was invoked').to.be.true;
  });
});
