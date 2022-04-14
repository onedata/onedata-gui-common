import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createValuesContainer, isValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import { typeOf } from '@ember/utils';
import EmberObject from '@ember/object';

describe('Unit | Utility | form component/values container', function () {
  describe('createValuesContainer', function () {
    it('creates an empty Ember object', function () {
      const container = createValuesContainer();

      expect(typeOf(container)).to.equal('instance');
      const propertyKeys = Object.keys(container);
      expect(propertyKeys).to.have.length(0);
    });
  });

  describe('isValuesContainer', function () {
    it('returns true for values container', function () {
      const container = createValuesContainer();

      expect(isValuesContainer(container)).to.be.true;
    });

    it('returns false for normal ember object', function () {
      const obj = EmberObject.create();

      expect(isValuesContainer(obj)).to.be.false;
    });
  });
});
