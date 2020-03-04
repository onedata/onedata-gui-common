import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import _object from 'lodash/object';

const ERROR_MSG = 'error!';

describe('Unit | Component | one form', function () {
  setupComponentTest('one-form', {
    unit: true,
  });

  beforeEach(function () {
    const FIELDS = {
      main: [EmberObject.create({
        name: 'main.first',
        type: 'text',
      })],
      another: [EmberObject.create({
        name: 'another.second',
        type: 'text',
      })],
    };
    const ALL_FIELDS = _object.values(FIELDS).reduce((a, b) => a.concat(b));
    const ALL_FIELDS_VALUES = EmberObject.create({
      main: EmberObject.create({ first: null }),
      another: EmberObject.create({ second: null }),
    });
    const VALIDATIONS = EmberObject.create({
      errors: [
        EmberObject.create({
          attribute: 'allFieldsValues.main.first',
          message: ERROR_MSG,
        }),
      ],
    });

    let subject = this.subject();
    subject.setProperties({
      allFields: ALL_FIELDS,
      allFieldsValues: ALL_FIELDS_VALUES,
      currentFieldsPrefix: ['main'],
      validations: VALIDATIONS,
    });
    subject.prepareFields();
  });

  it('detects errors while validation', function () {
    let subject = this.subject();
    expect(subject.get('isValid'), 'form is invalid').to.be.false;

    // simulates text input to show an error message
    subject.changeFormValue('main.first', 'sth');
    expect(
      subject.get('currentFields')[0].get('message'),
      'field has error (after edition)'
    ).to.equal(ERROR_MSG);
  });

  it('ignores errors in another fields group', function () {
    let subject = this.subject();
    subject.set('currentFieldsPrefix', ['another']);
    expect(subject.get('isValid'), 'form is valid').to.be.true;
    expect(subject.get('currentFields')[0].get('message'), 'field has no error')
      .to.be.empty;
  });

  it('ignores errors if field was not edited', function () {
    let subject = this.subject();
    expect(subject.get('isValid'), 'form is invalid').to.be.false;
    expect(subject.get('currentFields')[0].get('message'), 'field has no error')
      .to.be.empty;
  });

  it('detects that new errors have occurred', function () {
    let subject = this.subject();
    const error = subject.get('validations.errors')[0];
    subject.set('validations.errors', []);
    expect(subject.get('isValid'), 'form is valid when errors disappear')
      .to.be.true;
    subject.set('validations.errors', [error]);
    expect(subject.get('isValid'), 'form is again invalid when errors occurred')
      .to.be.false;
  });

  it('can reset fields state and value', function () {
    let subject = this.subject();
    subject.changeFormValue('main.first', 'sth');
    subject.resetFormValues();
    expect(subject.get('isValid'), 'form is still invalid after reset')
      .to.be.false;
    expect(subject.get('fieldValues.main.first'), 'field is empty after reset')
      .to.be.empty;
    expect(
      subject.get('currentFields')[0].get('message'),
      'field has no error after reset'
    ).to.be.empty;
  });

  it('allows to change field value', function () {
    let subject = this.subject();
    expect(subject.get('formValues.main.first'), 'initial field value == null')
      .to.be.null;
    const NEW_VALUE = 'sth';
    subject.changeFormValue('main.first', NEW_VALUE);
    expect(
      subject.get('formValues.main.first'),
      'field value changed after changeFormValue method call'
    ).to.equal(NEW_VALUE);
  });
});
