import EmberObject, { setProperties } from '@ember/object';
import { reject } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

const errorMsg = 'error!';

describe('Integration | Component | one form simple', function () {
  setupComponentTest('one-form-simple', {
    integration: true,
  });

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

  it('renders injected fields', function () {
    this.render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    expect(this.$('.field-main-first'), 'field first').to.exist;
    expect(this.$('.field-main-second'), 'field second').to.exist;
  });

  it('renders errors after field change', function () {
    this.render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    const $firstField = this.$('.field-main-first');

    const firstFieldMsg = $firstField.parents('.form-group').find('.form-message');
    expect(firstFieldMsg.text(), 'field has no error before value change')
      .to.be.empty;
    $firstField.trigger('change');
    return wait().then(() => {
      expect(firstFieldMsg.text(), 'field has error after change')
        .to.equal(errorMsg);
    });
  });

  it('renders errors after field loses its focus', function () {
    this.render(hbs `
      {{one-form-simple
        validations=fakeValidations
        fields=fields
        submitButton=false
      }}
    `);

    const firstField = this.$('.field-main-first');
    const firstFieldMsg = firstField.parents('.form-group').find('.form-message');
    expect(firstFieldMsg.text(), 'field has no error before value change').to.be.empty;
    firstField.blur();
    return wait().then(() => {
      expect(firstFieldMsg.text(), 'field has error after change')
        .to.equal(errorMsg);
    });
  });

  it('reacts when field error changes', function () {
    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);

    const newErrorMsg = 'error2!';
    const firstField = this.$('.field-main-first');
    const firstFieldMsg = firstField.parents('.form-group').find('.form-message');
    firstField.blur();
    this.get('fakeValidations.errors')[0].set('message', newErrorMsg);
    return wait().then(() => {
      expect(firstFieldMsg.text(), 'field has its another error')
        .to.equal(newErrorMsg);
    });
  });

  it('changes submit button "disable" attribute', function () {
    let submitOccurred = false;
    this.on('submitAction', () => {
      submitOccurred = true;
      return reject();
    });

    this.render(hbs `
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submit=(action "submitAction")
    }}
      `);

    let submitBtn = this.$('button[type=submit]');
    expect(
      submitBtn.prop('disabled'),
      'submit button is disabled if form is not valid'
    ).to.be.true;

    setProperties(this.get('fakeValidations'), {
      errors: [],
      isValid: true,
    });

    return wait().then(() => {
      expect(
        submitBtn.prop('disabled'),
        'submit button is enabled if form is valid'
      ).to.equal(false);
      submitBtn.click();
      return wait({ waitForTimers: false });
    }).then(() => {
      expect(submitOccurred, 'submitAction was invoked').to.be.true;
    });
  });
});
