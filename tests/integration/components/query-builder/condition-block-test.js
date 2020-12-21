import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { click, fillIn, blur } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { get } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import setDefaultQueryValuesBuilder from '../../../helpers/set-default-query-values-builder';

const mathOperators = [{
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

describe('Integration | Component | query builder/condition block', function () {
  setupComponentTest('query-builder/condition-block', {
    integration: true,
  });

  setDefaultQueryValuesBuilder();

  it(
    'has classes "query-builder-block" and "query-builder-condition-block"',
    async function () {
      this.set('queryBlock', ConditionQueryBlock.create({
        property: { key: 'example', displayedKey: 'example' },
        comparator: 'string.eq',
        comparatorValue: 'hello',
      }));

      this.render(hbs `{{query-builder/condition-block
        queryBlock=queryBlock
        valuesBuilder=valuesBuilder
      }}`);

      expect(this.$('.query-builder-block.query-builder-condition-block')).to.exist;
    }
  );

  [{
      comparator: 'string.eq',
      comparatorValue: 'hello',
      comparatorViewValue: '"hello"',
      comparatorSymbol: '=',
    },
    ...mathOperators.map(({ operator, symbol }) => ({
      comparator: `number.${operator}`,
      comparatorValue: '2',
      comparatorViewValue: '2',
      comparatorSymbol: symbol,
    })),
  ].forEach(({
    comparator,
    comparatorValue,
    comparatorViewValue,
    comparatorSymbol,
  }) => {
    const [propertyType, comparatorName] = comparator.split('.');

    it(
      `shows property key, comparator and comparator value for ${propertyType} "${comparatorName}" condition`,
      async function () {
        this.set(
          'queryBlock', ConditionQueryBlock.create({
            property: { key: 'some_key', displayedKey: 'some_key' },
            comparator,
            comparatorValue,
          })
        );

        this.render(hbs `{{query-builder/condition-block
          queryBlock=queryBlock
          valuesBuilder=valuesBuilder
        }}`);

        expect(this.$('.property-key').text().trim()).to.equal('some_key');
        expect(this.$('.comparator').text().trim()).to.equal(comparatorSymbol);
        expect(this.$('.comparator-value').text().trim()).to.equal(comparatorViewValue);
      }
    );
  });

  it('yields', async function () {
    this.set('queryBlock', ConditionQueryBlock.create({
      property: { key: 'some_key', displayedKey: 'some_key' },
      comparator: 'string.eq',
      comparatorValue: 'hello',
    }));

    this.render(hbs `{{#query-builder/condition-block
      queryBlock=queryBlock
      valuesBuilder=valuesBuilder
    }}
      <span class="test-element"></span>
    {{/query-builder/condition-block}}
    `);

    expect(this.$('.test-element')).to.exist;
  });

  it('starts comparator value edition on value click', async function () {
    const {
      queryBlock,
      editionStartSpy,
    } = this.setProperties({
      queryBlock: ConditionQueryBlock.create({
        property: { key: 'some_key' },
        comparator: 'string.eq',
        comparatorValue: 'abc',
      }),
      editionStartSpy: sinon.spy(),
    });

    this.render(hbs `{{query-builder/condition-block
      queryBlock=queryBlock
      onConditionEditionStart=editionStartSpy
      valuesBuilder=valuesBuilder
    }}`);

    expect(editionStartSpy).to.not.be.called;
    await click('.comparator-value');

    expect(this.$('.comparator-value-editor')).to.exist;
    expect(this.$('input[type="text"]')).to.exist;
    expect(editionStartSpy).to.be.calledOnce.and.to.be.calledWith(queryBlock);
  });

  it('accepts new edited comparator value', async function () {
    const {
      queryBlock,
      editionEndSpy,
      editionValidityChangeSpy,
    } = this.setProperties({
      queryBlock: ConditionQueryBlock.create({
        property: { key: 'some_key', displayedKey: 'some_key' },
        comparator: 'string.eq',
        comparatorValue: 'abc',
      }),
      editionEndSpy: sinon.spy(),
      editionValidityChangeSpy: sinon.spy(),
    });

    this.render(hbs `{{query-builder/condition-block
      queryBlock=queryBlock
      onConditionEditionEnd=editionEndSpy
      onConditionEditionValidityChange=editionValidityChangeSpy
      valuesBuilder=valuesBuilder
    }}`);

    await click('.comparator-value');
    expect(editionValidityChangeSpy).to.not.be.called;
    await fillIn('.comparator-value', 'def');
    expect(editionEndSpy).to.not.be.called;
    await blur('.comparator-value');

    expect(this.$('.comparator-value').text().trim()).to.equal('"def"');
    expect(this.$('input[type="text"]')).to.not.exist;
    expect(get(queryBlock, 'comparatorValue')).to.equal('def');
    expect(editionValidityChangeSpy)
      .to.be.calledOnce
      .and.to.be.calledWith(queryBlock, true);
    expect(editionEndSpy).to.be.calledOnce.and.to.be.calledWith(queryBlock);
  });

  it('allows to cancel edition of comparator value', async function () {
    const {
      queryBlock,
      editionEndSpy,
      editionValidityChangeSpy,
    } = this.setProperties({
      queryBlock: ConditionQueryBlock.create({
        property: { key: 'some_key', displayedKey: 'some_key' },
        comparator: 'string.eq',
        comparatorValue: 'abc',
      }),
      editionEndSpy: sinon.spy(),
      editionValidityChangeSpy: sinon.spy(),
    });

    this.render(hbs `{{query-builder/condition-block
      queryBlock=queryBlock
      onConditionEditionEnd=editionEndSpy
      onConditionEditionValidityChange=editionValidityChangeSpy
      valuesBuilder=valuesBuilder
    }}`);

    await click('.comparator-value');
    expect(editionValidityChangeSpy).to.not.be.called;
    await fillIn('.comparator-value', 'def');
    expect(editionEndSpy).to.not.be.called;

    this.$('.comparator-value').trigger({ type: 'keydown', key: 'Escape' });
    await wait();

    expect(editionEndSpy).to.be.calledOnce.and.to.be.calledWith(queryBlock);

    expect(this.$('.comparator-value').text().trim(), 'comparator-value text')
      .to.equal('"abc"');
    expect(this.$('input[type="text"]')).to.not.exist;
    expect(get(queryBlock, 'comparatorValue'), 'query block comparatorValue')
      .to.equal('abc');
    expect(editionValidityChangeSpy, 'editionValidityChange')
      .to.be.calledOnce
      .and.to.be.calledWith(queryBlock, true);
    expect(editionEndSpy).to.be.calledOnce.and.to.be.calledWith(queryBlock);
  });

  [{
    comparators: ['string.eq'],
    initialValue: 'abc',
    incorrectValues: [''],
  }, {
    comparators: mathOperators.map(({ operator }) => `number.${operator}`),
    initialValue: '1',
    incorrectValues: ['', 'abc'],
  }].forEach(({ comparators, initialValue, incorrectValues }) => {
    comparators.forEach(comparator => {
      const [propertyType, comparatorName] = comparator.split('.');
      incorrectValues.forEach(incorrectValue => {
        const when =
          `when incorrect value ${JSON.stringify(incorrectValue)} has been provided for "${comparatorName}" comparator of "${propertyType}" property`;
        it(
          `shows invalid state ${when}`,
          async function () {
            this.set('queryBlock', ConditionQueryBlock.create({
              property: { key: 'some_key', displayedKey: 'some_key' },
              comparator,
              comparatorValue: initialValue,
            }));

            this.render(hbs `{{query-builder/condition-block
              queryBlock=queryBlock
              valuesBuilder=valuesBuilder
            }}`);

            await click('.comparator-value');

            expect(this.$('input[type="text"].comparator-value'))
              .to.exist.to.not.have.class('is-invalid');

            await fillIn('.comparator-value', incorrectValue);

            expect(this.$('input[type="text"].comparator-value'))
              .to.exist.and.to.have.class('is-invalid');
          }
        );

        it(
          `does not allow to finish edition ${when}`,
          async function () {
            const {
              queryBlock,
              editionEndSpy,
              editionValidityChangeSpy,
            } = this.setProperties({
              queryBlock: ConditionQueryBlock.create({
                property: { key: 'some_key', displayedKey: 'some_key' },
                comparator,
                comparatorValue: initialValue,
              }),
              editionEndSpy: sinon.spy(),
              editionValidityChangeSpy: sinon.spy(),
            });

            this.render(hbs `{{query-builder/condition-block
              queryBlock=queryBlock
              onConditionEditionEnd=editionEndSpy
              onConditionEditionValidityChange=editionValidityChangeSpy
              valuesBuilder=valuesBuilder
            }}`);

            await click('.comparator-value');
            await fillIn('.comparator-value', incorrectValue);
            await blur('.comparator-value');

            expect(this.$('input[type="text"]')).to.exist;
            expect(get(queryBlock, 'comparatorValue')).to.equal(initialValue);
            expect(editionValidityChangeSpy).to.be.calledOnce
              .and.to.be.calledWith(queryBlock, false);
            expect(editionEndSpy).to.not.be.called;
          }
        );
      });
    });
  });
});
