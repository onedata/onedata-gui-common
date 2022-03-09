import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Json from 'onedata-gui-common/validators/json';

describe('Integration | Validators | Json', function () {
  setupTest();

  it('treats "" as a valid value', function () {
    const validator = createValidator(this);

    return expect(validator.validate('')).to.be.true;
  });

  it('treats undefined as a valid value', function () {
    const validator = createValidator(this);

    return expect(validator.validate(undefined)).to.be.true;
  });

  it('treats null as a valid value', function () {
    const validator = createValidator(this);

    return expect(validator.validate(null)).to.be.true;
  });

  it('treats string "{}" as a valid value', function () {
    const validator = createValidator(this);

    return expect(validator.validate('{}')).to.be.true;
  });

  it('treats string "{}x" as an invalid value', function () {
    const validator = createValidator(this);

    return expect(validator.validate('{}x')).to.equal('JSON is not valid');
  });
});

function createValidator(testCase) {
  return Json.create(testCase.owner.ownerInjection());
}
