import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import EmberPowerSelectHelper from '../../../../helpers/ember-power-select-helper';
import { clickTrigger } from '../../../../helpers/ember-power-select';

class PropertySelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.property-selector-container');
  }
}

class ComparatorSelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.comparator-selector-container');
  }
}

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

describe(
  'Integration | Component | query builder/block selector/condition selector',
  function () {
    setupComponentTest('query-builder/block-selector/condition-selector', {
      integration: true,
    });

    beforeEach(function () {
      // FIXME: refactor to use ember-power-select test helpers
      this.set('propertySelectHelper', new PropertySelectHelper());
      this.set('comparatorSelectHelper', new ComparatorSelectHelper());
      this.setProperties({
        queryProperties: [{
          key: 'stringProp',
          type: 'string',
        }, {
          key: 'numberProp',
          type: 'number',
        }],
      });
    });

    it('lists query properties in dropdown', async function () {
      this.render(hbs `{{query-builder/block-selector/condition-selector
        queryProperties=queryProperties
      }}`);

      await clickTrigger('.property-selector-container');

      const queryProperties = this.get('queryProperties');
      const options = this.$('.ember-power-select-option');
      expect(options).to.have.length(queryProperties.length);
      queryProperties.mapBy('key').forEach((key, index) =>
        expect(options[index].textContent.trim()).to.equal(key)
      );
    });

    it('filters query properties in dropdown', async function () {
      this.render(hbs `{{query-builder/block-selector/condition-selector
        queryProperties=queryProperties
      }}`);

      const propertySelectHelper = this.get('propertySelectHelper');

      await propertySelectHelper.open();
      await propertySelectHelper.typeInSearch('string');

      const options = this.$('.ember-power-select-option');
      expect(options).to.have.length(1);
      expect(options[0].textContent.trim()).to.equal('stringProp');
    });

    it('blocks "Add" button when no property is selected', async function () {
      this.render(hbs `{{query-builder/block-selector/condition-selector
        queryProperties=queryProperties
      }}`);

      expect(this.$('.accept-condition')).to.have.attr('disabled');
    });

    it('does not show comparator selector on init', async function () {
      this.render(hbs `{{query-builder/block-selector/condition-selector
        queryProperties=queryProperties
      }}`);

      expect(this.$('.comparator-selector')).to.not.exist;
    });

    it('shows comparator selector when property is selected', async function () {
      this.render(hbs `{{query-builder/block-selector/condition-selector
        queryProperties=queryProperties
      }}`);

      const propertySelectHelper = this.get('propertySelectHelper');

      await propertySelectHelper.open();
      await propertySelectHelper.selectChoose('stringProp');

      console.log(this.$().html());

      expect(this.$('.comparator-selector-container .ember-basic-dropdown')).to.exist;
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
      defaultComparatorVisibleValue: '',
      isAddEnabledForDefaults: false,
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
      defaultComparatorVisibleValue: '',
      isAddEnabledForDefaults: false,
    }].forEach(({
      propertyName,
      propertyType,
      comparators,
      defaultComparator,
      defaultComparatorVisibleValue,
      isAddEnabledForDefaults,
    }) => {
      it(`shows comparators for ${propertyType} property`, async function () {
        this.render(hbs `{{query-builder/block-selector/condition-selector
          queryProperties=queryProperties
        }}`);

        const propertySelectHelper = this.get('propertySelectHelper');
        const comparatorSelectHelper = this.get('comparatorSelectHelper');

        await propertySelectHelper.open();
        await propertySelectHelper.selectChoose(propertyName);

        await comparatorSelectHelper.open();
        const options = comparatorSelectHelper.getOptions();
        expect(options).to.have.length(comparators.length);
        comparators.forEach(({ comparator }, index) =>
          expect(options[index].textContent.trim())
          .to.equal(comparatorTranslations[comparator])
        );
        expect(
          this.$('.comparator-selector-container .ember-power-select-selected-item')
          .text().trim()
        ).to.equal(comparatorTranslations[defaultComparator]);
      });

      comparators.forEach(({
        comparator,
        inputValueCallback,
        notifiedInputValue,
        extraNotifiedInputCheck,
      }) => {
        const [propertyType, comparatorName] = comparator.split('.');

        it(
          `calls "onConditionSelected" callback, when ${propertyType} property "${comparatorName}" condition has been accepted`,
          async function () {
            const selectedSpy = this.set('selectedSpy', sinon.spy());

            this.render(hbs `{{query-builder/block-selector/condition-selector
              queryProperties=queryProperties
              onConditionSelected=selectedSpy
            }}`);

            const propertySelectHelper = this.get('propertySelectHelper');
            const comparatorSelectHelper = this.get('comparatorSelectHelper');

            await propertySelectHelper.open();
            await propertySelectHelper.selectChoose(propertyName);
            await comparatorSelectHelper.open();
            await comparatorSelectHelper.selectChoose(comparatorTranslations[comparator]);
            await inputValueCallback();
            await click('.accept-condition');

            expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith(
              sinon.match.has('key', propertyName),
              comparator,
              notifiedInputValue
            );

            if (extraNotifiedInputCheck) {
              extraNotifiedInputCheck(selectedSpy);
            }
          }
        );

        it(
          `sets default comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            this.render(hbs `{{query-builder/block-selector/condition-selector
              queryProperties=queryProperties
            }}`);

            const propertySelectHelper = this.get('propertySelectHelper');

            await propertySelectHelper.open();
            await propertySelectHelper.selectChoose(propertyName);

            const comparatorValueNode = this.$('.comparator-value')[0];
            const comparatorValue = comparatorValueNode.value !== undefined ?
              comparatorValueNode.value : comparatorValueNode.textContent.trim();
            expect(comparatorValue).to.equal(defaultComparatorVisibleValue);
          }
        );

        it(
          `${isAddEnabledForDefaults ? 'does not block' : 'blocks'} "Add" button when ${propertyType} property "${comparatorName}" condition has default comparator value`,
          async function () {
            this.render(hbs `{{query-builder/block-selector/condition-selector
              queryProperties=queryProperties
            }}`);

            const propertySelectHelper = this.get('propertySelectHelper');

            await propertySelectHelper.open();
            await propertySelectHelper.selectChoose(propertyName);

            const addBtn = this.$('.accept-condition');
            if (isAddEnabledForDefaults) {
              expect(addBtn).to.not.have.attr('disabled');
            } else {
              expect(addBtn).to.have.attr('disabled');
            }
          }
        );
      });
    });

    numberComparators.forEach(({ operator, symbol }) => {
      it(
        `blocks "Add" button when number property "${operator}" condition has a non-number condition value`,
        async function () {

          this.render(hbs `{{query-builder/block-selector/condition-selector
              queryProperties=queryProperties
            }}`);

          const propertySelectHelper = this.get('propertySelectHelper');
          await propertySelectHelper.open();
          await propertySelectHelper.selectChoose('numberProp');

          const comparatorSelectHelper = this.get('comparatorSelectHelper');
          await comparatorSelectHelper.open();
          await comparatorSelectHelper.selectChoose(symbol);

          await fillIn('.comparator-value', 'xyz');

          expect(this.$('.accept-condition')).to.have.attr('disabled');
        }
      );
    });
  });
