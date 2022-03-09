import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, blur } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import sinon from 'sinon';
import setDefaultQueryValuesBuilder from '../../helpers/set-default-query-values-builder';
import $ from 'jquery';

describe('Integration | Component | query builder main component', function () {
  setupRenderingTest();

  setDefaultQueryValuesBuilder();

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
    await render(hbs `{{query-builder valuesBuilder=valuesBuilder}}`);

    expect(this.$('.query-builder'));
  });

  it('calls refreshQueryProperties when add condition popover is opened', async function () {
    const refreshQueryProperties = sinon.spy();
    this.set('refreshQueryProperties', refreshQueryProperties);
    await render(hbs `{{query-builder
      valuesBuilder=valuesBuilder
      refreshQueryProperties=(action refreshQueryProperties)
    }}`);
    await click('.query-builder-block-adder');
    expect(refreshQueryProperties).to.be.calledOnce;
    await click('.operator-or');
    await click('.query-builder-block-adder');
    expect(refreshQueryProperties).to.be.calledTwice;
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
      this.setProperties({
        conditionBlocks,
        orBlock,
        andBlock,
        rootQueryBlock,
        notifyUpdateSpy,
      });

      render(hbs `{{query-builder
        queryProperties=queryProperties
        rootQueryBlock=rootQueryBlock
        valuesBuilder=valuesBuilder
      }}`);
      notifyUpdateSpy.reset();
    });

    it('value nested in operators is changed', async function () {
      const firstValue = this.$('.comparator-value:contains("1")');
      await click(firstValue[0]);

      await fillIn('input.comparator-value', 'test');
      await blur('input.comparator-value');

      expect(this.get('notifyUpdateSpy')).to.be.calledOnce;
    });

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

  // tests against regression bug
  it('allows to change block operator two times', async function () {
    const rootQueryBlock = RootOperatorQueryBlock.create({
      operands: [OrOperatorQueryBlock.create()],
    });

    this.setProperties({
      rootQueryBlock,
    });

    await render(hbs `{{query-builder rootQueryBlock=rootQueryBlock}}`);

    await click('.or-operator-block');
    await click('.change-to-section .operator-and');
    await click('.and-operator-block');

    expect($('.change-to-section .operator-or'), '"or" operator button')
      .to.exist.and.to.not.have.attr('disabled');
  });
});
