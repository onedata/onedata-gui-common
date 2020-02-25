import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import Json from 'onedata-gui-common/validators/json';
import { getOwner } from '@ember/application';

describe('Integration | Validators | Json', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('treats "" as a valid value', function () {
    const validator = Json.create();

    return expect(validator.validate('')).to.be.true;
  });

  it('treats undefined as a valid value', function () {
    const validator = Json.create();

    return expect(validator.validate(undefined)).to.be.true;
  });

  it('treats null as a valid value', function () {
    const validator = Json.create();

    return expect(validator.validate(null)).to.be.true;
  });

  it('treats string "{}" as a valid value', function () {
    const validator = Json.create();

    return expect(validator.validate('{}')).to.be.true;
  });

  it('treats string "{}x" as an invalid value', function () {
    const validator = Json.create(getOwner(this).ownerInjection());

    return expect(validator.validate('{}x')).to.equal('JSON is not valid');
  });
});
