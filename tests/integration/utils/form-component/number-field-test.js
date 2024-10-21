import { expect } from 'chai';
import { describe, it } from 'mocha';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';

describe('Integration | Utility | form-component/number-field', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.field.destroy();
  });

  it('defines inputType as "number"', function () {
    this.field = NumberField.create();
    expect(get(this.field, 'inputType')).to.equal('number');
  });

  it('defines fieldComponentName as "form-component/text-like-field"', function () {
    this.field = NumberField.create();
    expect(get(this.field, 'fieldComponentName'))
      .to.equal('form-component/text-like-field');
  });

  [
    'gt',
    'gte',
    'lt',
    'lte',
  ].forEach(boundingName => {
    it(
      `has empty "${boundingName}" field by default`,
      function () {
        this.field = NumberField.create();

        expect(get(this.field, boundingName)).to.be.undefined;
      }
    );
  });

  it(
    'has falsy "integer" field by default',
    function () {
      this.field = NumberField.create();

      expect(get(this.field, 'integer')).to.be.false;
    }
  );

  [{
    bounding: {
      gte: 123,
    },
    value: '123',
  }, {
    bounding: {
      gte: 123,
    },
    value: '124',
  }, {
    bounding: {
      gte: 123,
    },
    value: '122',
    error: 'This field must be greater than or equal to 123',
  }, {
    bounding: {
      lte: 123,
    },
    value: '123',
  }, {
    bounding: {
      lte: 123,
    },
    value: '122',
  }, {
    bounding: {
      lte: 123,
    },
    value: '124',
    error: 'This field must be less than or equal to 123',
  }, {
    bounding: {
      gt: 123,
    },
    value: '123',
    error: 'This field must be greater than 123',
  }, {
    bounding: {
      gt: 123,
    },
    value: '124',
  }, {
    bounding: {
      gt: 123,
    },
    value: '122',
    error: 'This field must be greater than 123',
  }, {
    bounding: {
      lt: 123,
    },
    value: '123',
    error: 'This field must be less than 123',
  }, {
    bounding: {
      lt: 123,
    },
    value: '124',
    error: 'This field must be less than 123',
  }, {
    bounding: {
      lt: 123,
    },
    value: '122',
  }, {
    bounding: {
      lte: 124,
      gte: 122,
    },
    value: '123',
  }, {
    bounding: {
      lte: 124,
      gte: 122,
    },
    value: '121',
    error: 'This field must be greater than or equal to 122',
  }, {
    bounding: {
      lte: 124,
      gte: 122,
    },
    value: '125',
    error: 'This field must be less than or equal to 124',
  }, {
    bounding: {
      lt: 124,
      gt: 122,
    },
    value: '123',
  }, {
    bounding: {
      lt: 124,
      gt: 122,
    },
    value: '122',
    error: 'This field must be greater than 122',
  }, {
    bounding: {
      lt: 124,
      gt: 122,
    },
    value: '124',
    error: 'This field must be less than 124',
  }].forEach(({ bounding, value, error }) => {
    const boundingDescriptionParts = Object.keys(bounding)
      .map(boundingName => `${boundingName} == ${bounding[boundingName]}`);
    const boundingDescription = boundingDescriptionParts.join(' and ');

    if (error) {
      it(
        `has number validation error for value "${value}" and ${boundingDescription}`,
        function () {
          this.field = NumberField.create(Object.assign({
            ownerSource: this.owner,
            name: 'a',
            valuesSource: {
              a: value,
            },
          }), bounding);

          const errors = get(this.field, 'errors');
          expect(errors).to.be.have.length(1);
          expect(errors[0].message).to.equal(error);
        }
      );
    } else {
      it(
        `does not have number validation error for value "${value}" and ${boundingDescription}`,
        function () {
          this.field = NumberField.create(Object.assign({
            ownerSource: this.owner,
            name: 'a',
            valuesSource: {
              a: value,
            },
          }), bounding);

          expect(get(this.field, 'errors')).to.be.have.length(0);
        }
      );
    }
  });

  it(
    'does not have number validation error for value "123.123" and integer == false',
    function () {
      this.field = NumberField.create({
        ownerSource: this.owner,
        integer: false,
        name: 'a',
        valuesSource: {
          a: '123.123',
        },
      });

      expect(get(this.field, 'errors')).to.be.have.length(0);
    }
  );

  it(
    'has number validation error for value "123.123" and integer == true',
    function () {
      this.field = NumberField.create({
        ownerSource: this.owner,
        integer: true,
        name: 'a',
        valuesSource: {
          a: '123.123',
        },
      });

      const errors = get(this.field, 'errors');
      expect(errors).to.be.have.length(1);
      expect(errors[0].message).to.equal('This field must be an integer');
    }
  );

  it(
    'does not have number validation error for value "123" and integer == true',
    function () {
      this.field = NumberField.create({
        ownerSource: this.owner,
        integer: true,
        name: 'a',
        valuesSource: {
          a: '123',
        },
      });

      expect(get(this.field, 'errors')).to.be.have.length(0);
    }
  );
});
