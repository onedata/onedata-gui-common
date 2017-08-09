import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

// FIXME uncomment after tests enable
// const {
//   RSVP: {
//     Promise,
//   },
// } = Ember;

const ERROR_MSG = 'error!';

describe('Integration | Component | one form simple', function () {
  setupComponentTest('one-form-simple', {
    integration: true
  });

  beforeEach(function () {
    const FIELDS = [{
      name: 'first',
      type: 'text',
    },
    {
      name: 'second',
      type: 'text',
    }
    ];

    const VALIDATIONS = Ember.Object.create({
      errors: [
        Ember.Object.create({
          attribute: 'allFieldsValues.main.first',
          message: ERROR_MSG
        })
      ]
    });

    this.set('fields', FIELDS);
    this.set('fakeValidations', VALIDATIONS);
  });

  it('renders injected fields', function () {
    this.render(hbs`
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);

    expect(this.$('.field-main-first'), 'field first').to.exist;
    expect(this.$('.field-main-second'), 'field second').to.exist;
  });

  it('renders errors after field change', function (done) {
    this.render(hbs`
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);

    let firstField = this.$('.field-main-first');
    let firstFieldMsg = firstField.next('.form-message');
    expect(firstFieldMsg.text(), 'field has no error before value change')
      .to.be.empty;
    firstField.trigger('change');
    wait().then(() => {
      expect(firstFieldMsg.text(), 'field has error after change')
        .to.equal(ERROR_MSG);
      done();
    });
  });

  it('renders errors after field looses its focus', function (done) {
    this.render(hbs`
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);

    let firstField = this.$('.field-main-first');
    let firstFieldMsg = firstField.next('.form-message');
    expect(firstFieldMsg.text(), 'field has no error before value change')
      .to.be.empty;
    firstField.blur();
    wait().then(() => {
      expect(firstFieldMsg.text(), 'field has error after change')
        .to.equal(ERROR_MSG);
      done();
    });
  });

  it('reacts when field error changes', function (done) {
    this.render(hbs`
    {{one-form-simple
      validations=fakeValidations
      fields=fields
      submitButton=false
    }}
      `);

    const NEW_ERROR_MSG = 'error2!';
    let firstField = this.$('.field-main-first');
    let firstFieldMsg = firstField.next('.form-message');
    firstField.blur();
    this.get('fakeValidations.errors')[0].set('message', NEW_ERROR_MSG);
    wait().then(() => {
      expect(firstFieldMsg.text(), 'field has its another error')
        .to.equal(NEW_ERROR_MSG);
      done();
    });
  });

  // FIXME
  // FIXME this test is causing other tests to timeout
  // FIXME

  // it('changes submit button "disable" attribute', function (done) {
  //   let submitOccurred = false;
  //   this.on('submitAction', () => {
  //     submitOccurred = true;
  //     return new Promise((resolve, reject) => reject());
  //   });

  //   this.render(hbs`
  //   {{one-form-simple
  //     validations=fakeValidations
  //     fields=fields
  //     submit=(action "submitAction")
  //   }}
  //     `);

  //   let submitBtn = this.$('button[type=submit]');
  //   expect(
  //     submitBtn.prop('disabled'),
  //     'submit button is disabled if form is not valid'
  //   ).to.be.true;

  //   this.get('fakeValidations').set('errors', []);
  //   this.get('fakeValidations').set('isValid', true);
  //   wait().then(() => {
  //     expect(
  //       submitBtn.prop('disabled'),
  //       'submit button is enabled if form is valid'
  //     ).to.equal(false);
  //     done();
  //     submitBtn.click();
  //     wait().then(() => {
  //       expect(submitOccurred, 'submitAction was invoked').to.be.true;
  //       done();
  //     });
  //   });
  // });
});
