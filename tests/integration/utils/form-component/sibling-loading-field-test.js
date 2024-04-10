import { expect } from 'chai';
import { describe, it } from 'mocha';
import SiblingLoadingField from 'onedata-gui-common/utils/form-component/sibling-loading-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/sibling-loading-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  [
    true,
    false,
  ].forEach(value => {
    it(`has isVisible equal ${!value} when isFulfilled is ${value}`, function () {
      this.field = SiblingLoadingField.create({
        isFulfilled: value,
      });

      expect(get(this.field, 'isVisible')).to.equal(!value);
    });
  });

  it('has isValid equal true when isFulfilled is true', function () {
    this.field = SiblingLoadingField.create({
      isFulfilled: true,
    });

    expect(get(this.field, 'isValid')).to.equal(true);
  });

  it('has label equal to sibling\'s label', function () {
    this.field = SiblingLoadingField.create({
      siblingName: 'sibling1',
      parent: {
        fields: [{
          name: 'sibling1',
          label: 'test1',
        }],
      },
    });

    expect(get(this.field, 'label')).to.equal('test1');
  });

  it('has tip equal to sibling\'s label', function () {
    this.field = SiblingLoadingField.create({
      siblingName: 'sibling1',
      parent: {
        fields: [{
          name: 'sibling1',
          tip: 'test1',
        }],
      },
    });

    expect(get(this.field, 'tip')).to.equal('test1');
  });
});
