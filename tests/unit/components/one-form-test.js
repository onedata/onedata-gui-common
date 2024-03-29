import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import _object from 'lodash/object';

const ERROR_MSG = 'error!';

describe('Unit | Component | one-form', function () {
  setupTest();

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

    const subject =
      this.set('subject', this.owner.factoryFor('component:one-form').create());
    subject.setProperties({
      allFields: ALL_FIELDS,
      allFieldsValues: ALL_FIELDS_VALUES,
      currentFieldsPrefix: ['main'],
      validations: VALIDATIONS,
    });
    subject.prepareFields();
  });

  it('detects errors while validation', function () {
    const subject = this.get('subject');
    expect(subject.get('isValid'), 'form is invalid').to.be.false;

    // simulates text input to show an error message
    subject.changeFormValue('main.first', 'sth');
    expect(
      subject.get('currentFields')[0].get('message'),
      'field has error (after edition)'
    ).to.equal(ERROR_MSG);
  });

  it('ignores errors in another fields group', function () {
    const subject = this.get('subject');
    subject.set('currentFieldsPrefix', ['another']);
    expect(subject.get('isValid'), 'form is valid').to.be.true;
    expect(subject.get('currentFields')[0].get('message'), 'field has no error')
      .to.be.empty;
  });

  it('ignores errors if field was not edited', function () {
    const subject = this.get('subject');
    expect(subject.get('isValid'), 'form is invalid').to.be.false;
    expect(subject.get('currentFields')[0].get('message'), 'field has no error')
      .to.be.empty;
  });

  it('detects that new errors have occurred', function () {
    const subject = this.get('subject');
    const error = subject.get('validations.errors')[0];
    subject.set('validations.errors', []);
    expect(subject.get('isValid'), 'form is valid when errors disappear')
      .to.be.true;
    subject.set('validations.errors', [error]);
    expect(subject.get('isValid'), 'form is again invalid when errors occurred')
      .to.be.false;
  });

  it('can reset fields state and value', function () {
    const subject = this.get('subject');
    subject.changeFormValue('main.first', 'sth');
    subject.resetFormValues();
    expect(subject.get('isValid'), 'form is still invalid after reset')
      .to.be.false;
    expect(subject.get('fieldValues.main.first'), 'field is empty after reset')
      .to.be.undefined;
    expect(
      subject.get('currentFields')[0].get('message'),
      'field has no error after reset'
    ).to.be.a('string').that.is.empty;
  });

  it('allows to change field value', function () {
    const subject = this.get('subject');
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
