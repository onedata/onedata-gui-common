import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { click, fillIn, blur } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import sinon from 'sinon';

describe('Integration | Component | query builder main component', function () {
  setupComponentTest('query-builder/block-adder', {
    integration: true,
  });

  beforeEach(function () {
    this.set('queryProperties', [{
        key: 'key_hello',
        type: 'string',
      },
      {
        key: 'key_second',
        type: 'number',
      },
    ]);
  });

  it('has class "query-builder', async function () {
    this.render(hbs `{{query-builder}}`);

    expect(this.$('.query-builder'));
  });

  describe('calls notifyChange when', function () {
    beforeEach(function () {
      const conditionBlocks = [{
          property: { key: 'a', type: 'string' },
          comparator: 'string.eq',
          comparatorValue: '1',
        },
        {
          property: { key: 'b', type: 'string' },
          comparator: 'string.eq',
          comparatorValue: '2',
        },
        {
          property: { key: 'c', type: 'string' },
          comparator: 'string.eq',
          comparatorValue: '3',
        },
      ].map(spec => ConditionQueryBlock.create(spec));
      const orBlock = OrOperatorQueryBlock.create();
      orBlock.addOperand(conditionBlocks[0]);
      orBlock.addOperand(conditionBlocks[1]);
      const andBlock = AndOperatorQueryBlock.create();
      andBlock.addOperand(orBlock);
      andBlock.addOperand(conditionBlocks[2]);
      const notifyUpdateSpy = sinon.spy();
      const rootQueryBlock = RootOperatorQueryBlock.create({
        notifyUpdate: notifyUpdateSpy,
      });
      rootQueryBlock.addOperand(andBlock);
      notifyUpdateSpy.reset();
      this.setProperties({
        conditionBlocks,
        orBlock,
        andBlock,
        rootQueryBlock,
        notifyUpdateSpy,
      });

      this.render(hbs `<div id="builder-container">{{query-builder
        queryProperties=queryProperties
        rootQueryBlock=rootQueryBlock
      }}</div>`);
    });

    it(
      'value nested in operators is changed',
      async function () {
        const firstValue = this.$('.comparator-value:contains("1")');
        firstValue[0].click();
        await wait();

        await fillIn('input.comparator-value', 'test');
        await blur('input.comparator-value');

        expect(this.get('notifyUpdateSpy')).to.be.calledOnce;
      }
    );

    it('a new nested operator is added', async function () {
      await click('.query-builder-block-adder');
      await click('.operator-selector .operator-and');

      expect(this.get('notifyUpdateSpy')).to.be.calledOnce;
    });

    it('a nested block is surrounded', async function () {
      await click('.or-operator-block');
      await click('.surround-section .operator-and');

      expect(this.get('notifyUpdateSpy')).to.be.calledOnce;
    });

    it('a nested operator is changed', async function () {
      await click('.or-operator-block');
      await click('.change-to-section .operator-and');

      expect(this.get('notifyUpdateSpy')).to.be.calledOnce;
    });
  });
});
