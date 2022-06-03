import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import {
  clickTrigger,
  selectChoose,
  typeInSearch,
} from 'ember-power-select/test-support/helpers';
import setDefaultQueryValuesBuilder from '../../../../helpers/set-default-query-values-builder';
import {
  render,
  click,
  fillIn,
  findAll,
  find,
} from '@ember/test-helpers';

const numberComparators = [{
  operator: 'eq',
  symbol: '=',
}, {
  operator: 'lt',
  symbol: '<',
}, {
  operator: 'lte',
  symbol: '≤',
}, {
  operator: 'gt',
  symbol: '>',
}, {
  operator: 'gte',
  symbol: '≥',
}];

const comparatorTranslations = {
  'string.eq': '=',
};
numberComparators.forEach(({ operator, symbol }) => {
  comparatorTranslations[`number.${operator}`] = symbol;
});

describe('Integration | Component | query builder/block selector/condition selector', function () {
  setupRenderingTest();

  setDefaultQueryValuesBuilder();

  beforeEach(function () {
    const numberOptionsProp = {
      key: 'numberOptionsProp',
      displayedKey: 'numberOptionsProp',
      type: 'numberOptions',
      numberValues: [1, 2, 3],
    };
    this.setProperties({
      numberOptionsProp,
      queryProperties: [{
          key: 'stringProp',
          displayedKey: 'stringProp',
          type: 'string',
        }, {
          key: 'numberProp',
          displayedKey: 'numberProp',
          type: 'number',
        },
        numberOptionsProp,
      ],
    });
  });

  it('lists query properties in dropdown', async function () {
    await render(hbs `{{query-builder/block-selector/condition-selector
      queryProperties=queryProperties
      valuesBuilder=valuesBuilder
    }}`);

    await clickTrigger('.property-selector-container');

    const queryProperties = this.get('queryProperties');
    const options = findAll('.ember-power-select-option');
    expect(options).to.have.length(queryProperties.length);
    queryProperties.mapBy('key').sort().forEach((key, index) =>
      expect(options[index].textContent.trim()).to.equal(key)
    );
  });

  it('filters query properties in dropdown', async function () {
    await render(hbs `{{query-builder/block-selector/condition-selector
      queryProperties=queryProperties
      valuesBuilder=valuesBuilder
    }}`);

    await clickTrigger('.property-selector-container');
    await typeInSearch('string');

    const options = findAll('.ember-power-select-option');
    expect(options).to.have.length(1);
    expect(options[0].textContent.trim()).to.equal('stringProp');
  });

  it('blocks "Add" button when no property is selected', async function () {
    await render(hbs `{{query-builder/block-selector/condition-selector
      queryProperties=queryProperties
      valuesBuilder=valuesBuilder
    }}`);

    expect(find('.accept-condition').disabled).to.be.true;
  });

  it('does not block "Add" button when property and number values are selected from dropdown', async function () {
    await render(hbs `{{query-builder/block-selector/condition-selector
      queryProperties=queryProperties
      selectedConditionProperty=numberOptionsProp
      selectedConditionComparator="numberOptions.lt"
      valuesBuilder=valuesBuilder
    }}`);

    await selectChoose('.comparator-value-editor', '1');

    expect(find('.accept-condition').disabled).to.be.false;
  });

  it('does not show comparator selector on init', async function () {
    await render(hbs `{{query-builder/block-selector/condition-selector
      queryProperties=queryProperties
      valuesBuilder=valuesBuilder
    }}`);

    expect(find('.comparator-selector')).to.not.exist;
  });

  it('shows comparator selector when multi-comparator property is selected', async function () {
    await render(hbs `{{query-builder/block-selector/condition-selector
      queryProperties=queryProperties
      valuesBuilder=valuesBuilder
    }}`);

    await selectChoose('.property-selector-container', 'numberProp');

    expect(find('.comparator-selector-container .ember-basic-dropdown')).to.exist;
  });

  [{
    propertyName: 'stringProp',
    propertyType: 'string',
    comparators: [{
      comparator: 'string.eq',
      inputValueCallback: async function () {
        await fillIn('.comparator-value', 'hello');
      },
      notifiedInputValue: 'hello',
    }],
    defaultComparator: 'string.eq',
  }, {
    propertyName: 'numberProp',
    propertyType: 'number',
    comparators: numberComparators.map(({ operator }) => ({
      comparator: `number.${operator}`,
      inputValueCallback: async function () {
        await fillIn('.comparator-value', '2');
      },
      notifiedInputValue: '2',
    })),
    defaultComparator: 'number.eq',
  }].forEach(({
    propertyName,
    propertyType,
    comparators,
    defaultComparator,
  }) => {
    it(`shows comparators for ${propertyType} property`, async function () {
      await render(hbs `{{query-builder/block-selector/condition-selector
        queryProperties=queryProperties
        valuesBuilder=valuesBuilder
      }}`);

      await selectChoose('.property-selector-container', propertyName);

      if (comparators.length > 1) {
        await clickTrigger('.comparator-selector-container');
        const options = findAll('.ember-power-select-option');

        expect(options).to.have.length(comparators.length);
        comparators.forEach(({ comparator }, index) =>
          expect(options[index].textContent.trim())
          .to.equal(comparatorTranslations[comparator])
        );
        expect(
          find('.comparator-selector-container .ember-power-select-selected-item')
          .textContent.trim()
        ).to.equal(comparatorTranslations[defaultComparator]);
      } else {
        expect(find('.comparator-selector').textContent.trim())
          .to.equal(comparatorTranslations[comparators[0].comparator]);
      }
    });

    comparators.forEach(({
      comparator,
      inputValueCallback,
      notifiedInputValue,
    }) => {
      const [propertyType, comparatorName] = comparator.split('.');

      it(
        `calls "onConditionSelected" callback, when ${propertyType} property "${comparatorName}" condition has been accepted`,
        async function () {
          const selectedSpy = this.set('selectedSpy', sinon.spy());
          await render(hbs `{{query-builder/block-selector/condition-selector
            queryProperties=queryProperties
            onConditionSelected=selectedSpy
            valuesBuilder=valuesBuilder
          }}`);
          await selectChoose('.property-selector-container', propertyName);
          if (comparators.length > 1) {
            await selectChoose(
              '.comparator-selector-container',
              comparatorTranslations[comparator]
            );
          }
          await inputValueCallback();
          await click('.accept-condition');

          expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
            sinon.match.has('key', propertyName),
            comparator,
            notifiedInputValue
          );
        }
      );

      it(
        `sets default comparator value for "${comparatorName}" comparator for ${propertyType} property`,
        async function () {
          await render(hbs `{{query-builder/block-selector/condition-selector
            queryProperties=queryProperties
            valuesBuilder=valuesBuilder
          }}`);
          await selectChoose('.property-selector-container', propertyName);

          const comparatorValueNode = find('.comparator-value');
          const comparatorValue = comparatorValueNode.value !== undefined ?
            comparatorValueNode.value : comparatorValueNode.textContent.trim();
          expect(comparatorValue).to.equal('');
        }
      );

      it(
        `blocks "Add" button when ${propertyType} property "${comparatorName}" condition has default comparator value`,
        async function () {
          await render(hbs `{{query-builder/block-selector/condition-selector
            queryProperties=queryProperties
            valuesBuilder=valuesBuilder
          }}`);
          await selectChoose('.property-selector-container', propertyName);

          const addBtn = find('.accept-condition');
          expect(addBtn.disabled).to.be.true;
        }
      );
    });
  });

  numberComparators.forEach(({ operator, symbol }) => {
    it(
      `blocks "Add" button when number property "${operator}" condition has a non-number condition value`,
      async function () {
        await render(hbs `{{query-builder/block-selector/condition-selector
          queryProperties=queryProperties
          valuesBuilder=valuesBuilder
        }}`);
        await selectChoose('.property-selector-container', 'numberProp');
        await selectChoose('.comparator-selector-container', symbol);
        await fillIn('.comparator-value', 'xyz');

        expect(find('.accept-condition').disabled).to.be.true;
      }
    );
  });
});
