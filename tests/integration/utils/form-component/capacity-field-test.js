import { expect } from 'chai';
import { describe, it } from 'mocha';
import CapacityField from 'onedata-gui-common/utils/form-component/capacity-field';
import { get } from '@ember/object';
import { setupComponentTest } from 'ember-mocha';

const defaultUnits = ['MiB', 'GiB', 'TiB', 'PiB'];

describe('Integration | Utility | form component/capacity field', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

  it('defines fieldComponentName as "form-component/capacity-field"', function () {
    const field = CapacityField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/capacity-field');
  });

  it(`has "allowedUnits" set to ${JSON.stringify(defaultUnits)} by default`, function () {
    const field = CapacityField.create();

    expect(get(field, 'allowedUnits')).to.deep.equal(defaultUnits);
  });

  [
    'gt',
    'lt',
    'lte',
  ].forEach(boundingName => {
    it(
      `has empty "${boundingName}" field by default`,
      function () {
        const field = CapacityField.create();

        expect(get(field, boundingName)).to.be.undefined;
      }
    );
  });

  it('has "gte" field equal to 0 by default', function () {
    const field = CapacityField.create();

    expect(get(field, 'gte')).to.equal(0);
  });

  [{
    bounding: {
      gte: 1048576,
    },
    value: '1048576',
  }, {
    bounding: {
      gte: 1048576,
    },
    value: '1048577',
  }, {
    bounding: {
      gte: 1048576,
    },
    value: '1048575',
    error: 'This field must be greater than or equal to 1 MiB',
  }, {
    bounding: {
      lte: 1048576,
    },
    value: '1048576',
  }, {
    bounding: {
      lte: 1048576,
    },
    value: '1048575',
  }, {
    bounding: {
      lte: 1048576,
    },
    value: '1048577',
    error: 'This field must be less than or equal to 1 MiB',
  }, {
    bounding: {
      gt: 1048576,
    },
    value: '1048576',
    error: 'This field must be greater than 1 MiB',
  }, {
    bounding: {
      gt: 1048576,
    },
    value: '1048577',
  }, {
    bounding: {
      gt: 1048576,
    },
    value: '1048575',
    error: 'This field must be greater than 1 MiB',
  }, {
    bounding: {
      lt: 1048576,
    },
    value: '1048576',
    error: 'This field must be less than 1 MiB',
  }, {
    bounding: {
      lt: 1048576,
    },
    value: '1048577',
    error: 'This field must be less than 1 MiB',
  }, {
    bounding: {
      lt: 1048576,
    },
    value: '1048575',
  }, {
    bounding: {
      lte: 1048577,
      gte: 1048575,
    },
    value: '1048576',
  }, {
    bounding: {
      lte: 1048578,
      gte: 1048576,
    },
    value: '1048575',
    error: 'This field must be greater than or equal to 1 MiB',
  }, {
    bounding: {
      lte: 1048576,
      gte: 1048574,
    },
    value: '1048577',
    error: 'This field must be less than or equal to 1 MiB',
  }, {
    bounding: {
      lt: 1048577,
      gt: 1048575,
    },
    value: '1048576',
  }, {
    bounding: {
      lt: 1048578,
      gt: 1048576,
    },
    value: '1048575',
    error: 'This field must be greater than 1 MiB',
  }, {
    bounding: {
      lt: 1048576,
      gt: 1048574,
    },
    value: '1048576',
    error: 'This field must be less than 1 MiB',
  }].forEach(({ bounding, value, error }) => {
    const boundingDescriptionParts = Object.keys(bounding)
      .map(boundingName => `${boundingName} == ${bounding[boundingName]}`);
    const boundingDescription = boundingDescriptionParts.join(' and ');

    if (error) {
      it(
        `has capacity validation error for value "${value}" and ${boundingDescription}`,
        function () {
          const field = CapacityField.create(Object.assign({
            ownerSource: this,
            name: 'a',
            valuesSource: {
              a: value,
            },
          }), bounding);

          const errors = get(field, 'errors');
          expect(errors).to.be.have.length(1);
          expect(errors[0].message).to.equal(error);
        }
      );
    } else {
      it(
        `does not have capacity validation error for value "${value}" and ${boundingDescription}`,
        function () {
          const field = CapacityField.create(Object.assign({
            ownerSource: this,
            name: 'a',
            valuesSource: {
              a: value,
            },
          }), bounding);

          expect(get(field, 'errors')).to.be.have.length(0);
        }
      );
    }
  });
});
