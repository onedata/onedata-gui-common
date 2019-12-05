import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('JsonValidator', function () {
  setupTest('validator:json', {
    // Specify the other units that are required for this test.
    needs: ['validator:messages']
  });

  it('treats "" as a valid value', function () {
    const validator = this.subject();

    return expect(validator.validate('')).to.be.true;
  });

  it('treats undefined as a valid value', function () {
    const validator = this.subject();

    return expect(validator.validate(undefined)).to.be.true;
  });

  it('treats null as a valid value', function () {
    const validator = this.subject();

    return expect(validator.validate(null)).to.be.true;
  });

  it('treats string "{}" as a valid value', function () {
    const validator = this.subject();

    return expect(validator.validate('{}')).to.be.true;
  });

  it('treats string "{}x" as an invalid value', function () {
    const validator = this.subject();

    return expect(validator.validate('{}x')).to.equal('JSON is not valid');
  });
});
