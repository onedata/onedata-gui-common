import { expect } from 'chai';
import { describe, context, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, blur, fillIn } from 'ember-native-dom-helpers';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import ExcludingOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/excluding-operator-query-block';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import RootOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/root-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import sinon from 'sinon';
import { get } from '@ember/object';

const multiOperandOperatorsList = ['and', 'or', 'excluding'];
const singleOperandOperatorsList = ['not', 'root'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
  excluding: ExcludingOperatorQueryBlock,
  root: RootOperatorQueryBlock,
};

describe('Integration | Component | query builder/operator block', function () {
  setupComponentTest('query-builder/condition-block', {
    integration: true,
  });

  it(
    'has classes "query-builder-block" and "query-builder-operator-block"',
    async function () {
      this.render(hbs `{{query-builder/operator-block}}`);

      expect(this.$('.query-builder-block.query-builder-operator-block'))
        .to.have.length(1);
    }
  );

  operatorsList.forEach(operatorName => {
    context(`with ${operatorName.toUpperCase()} operator`, function () {
      const isMultiOperandOperator = multiOperandOperatorsList.includes(operatorName);

      it(
        `has class "${operatorName}-operator-block"`,
        async function () {
          this.set('queryBlock', operatorBlockClasses[operatorName].create());

          this.render(hbs `
            {{query-builder/operator-block queryBlock=queryBlock}}
          `);

          expect(this.$(
            `.query-builder-block.${operatorName}-operator-block`
          )).to.have.length(1);
        }
      );

      if (isMultiOperandOperator) {
        it(
          'has two block-adders (only first enabled) and no block when it represents empty block',
          async function () {
            this.set('queryBlock', operatorBlockClasses[operatorName].create());

            this.render(hbs `
              {{query-builder/operator-block queryBlock=queryBlock}}
            `);

            const blockAdderTriggers =
              this.$('.query-builder-block-adder');
            expect(blockAdderTriggers).to.have.length(2);
            expect(blockAdderTriggers.eq(0)).to.not.have.attr('disabled');
            expect(blockAdderTriggers.eq(1)).to.have.attr('disabled');
            expect(this.$(
              '.query-builder-block .query-builder-block'
            )).to.not.exist;
          }
        );

        it(
          'shows blocks and one enabled block-adder when it represents non-empty block',
          async function () {
            const queryBlock =
              this.set('queryBlock', operatorBlockClasses[operatorName].create());
            queryBlock.addOperand(NotOperatorQueryBlock.create());
            queryBlock.addOperand(NotOperatorQueryBlock.create());

            this.render(hbs `
              {{query-builder/operator-block queryBlock=queryBlock}}
            `);

            // 2 operands
            expect(this.$(
              '.query-builder-block .query-builder-block'
            )).to.have.length(2);
            // 2 from operands + 1 from the parent block
            expect(this.$(
              '.query-builder-block-adder:not([disabled])'
            )).to.have.length(3);
            // exactly 2 are from operands (NOT operators)
            expect(this.$(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            )).to.have.length(2);
          }
        );

        it('allows to add block using block-adder', async function () {
          const queryBlock =
            this.set('queryBlock', operatorBlockClasses[operatorName].create());

          this.render(hbs `
            {{query-builder/operator-block queryBlock=queryBlock}}
          `);
          await click('.query-builder-block-adder');
          await click('.operator-not');

          // 1 operand
          expect(this.$('.query-builder-block .query-builder-block')).to.have.length(1);
          // 1 from operands + 1 from the parent block
          expect(this.$('.query-builder-block-adder')).to.have.length(2);
          // exactly 1 is from operands (NOT operators)
          expect(this.$(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          )).to.have.length(1);
          expect(get(queryBlock, 'operands.length')).to.equal(1);
          expect(get(queryBlock, 'operands.firstObject.operator')).to.equal('not');
        });

        it('shows operator name', async function () {
          const queryBlock =
            this.set('queryBlock', operatorBlockClasses[operatorName].create());
          queryBlock.addOperand(NotOperatorQueryBlock.create());
          queryBlock.addOperand(NotOperatorQueryBlock.create());

          this.render(hbs `
            {{query-builder/operator-block queryBlock=queryBlock}}
          `);

          const labels = this.$('.block-infix-label');
          expect(labels).to.have.length(2);
          labels.each((index, labelElement) =>
            expect(labelElement.textContent.trim()).to.equal(operatorName)
          );
        });
      } else {
        it(
          'shows single block-adder and no block when it represents empty block',
          async function () {
            this.set('queryBlock', operatorBlockClasses[operatorName].create());

            this.render(hbs `
              {{query-builder/operator-block queryBlock=queryBlock}}
            `);

            expect(this.$('.query-builder-block-adder')).to.have.length(1);
            expect(
              this.$('.query-builder-block .query-builder-block')
            ).to.not.exist;
          }
        );

        it(
          'shows block and no block-adder when it represents non-empty block',
          async function () {
            const queryBlock =
              this.set('queryBlock', operatorBlockClasses[operatorName].create());
            queryBlock.addOperand(NotOperatorQueryBlock.create());

            this.render(hbs `
              {{query-builder/operator-block queryBlock=queryBlock}}
            `);

            // 1 operand
            expect(this.$('.query-builder-block .query-builder-block'))
              .to.have.length(1);
            // 1 adder... (or 2 if operator is "root")
            expect(this.$('.query-builder-block-adder'))
              .to.have.length(operatorName === 'root' ? 2 : 1);
            // ... where 1 is from operand
            expect(this.$(
              '.query-builder-block .query-builder-block .query-builder-block-adder'
            )).to.exist;
          }
        );

        it('allows to add block using block-adder', async function () {
          const queryBlock =
            this.set('queryBlock', operatorBlockClasses[operatorName].create());

          this.render(hbs `
            {{query-builder/operator-block queryBlock=queryBlock}}
          `);
          await click('.query-builder-block-adder');
          await click('.operator-not');

          // 1 operand
          expect(this.$('.query-builder-block .query-builder-block'))
            .to.have.length(1);
          // 1 adder... (or 2 if operator is "root")
          expect(this.$('.query-builder-block-adder'))
            .to.have.length(operatorName === 'root' ? 2 : 1);
          // ... but from operand, not parent block
          expect(this.$(
            '.query-builder-block .query-builder-block .query-builder-block-adder'
          )).to.exist;
          expect(get(queryBlock, 'operands.length')).to.equal(1);
          expect(get(queryBlock, 'operands.firstObject.operator')).to.equal('not');
        });

        if (operatorName === 'root') {
          it('does not show operator name', async function () {
            this.set('queryBlock', operatorBlockClasses[operatorName].create());

            this.render(hbs `
              {{query-builder/operator-block queryBlock=queryBlock}}
            `);

            expect(this.$('.block-prefix-label')).to.not.exist;
          });
        } else {
          it('shows operator name', async function () {
            this.set('queryBlock', operatorBlockClasses[operatorName].create());

            this.render(hbs `{{query-builder/operator-block queryBlock=queryBlock}}`);

            expect(this.$('.block-prefix-label').text().trim())
              .to.equal(operatorName);
          });
        }
      }

      it('allows to remove nested block', async function () {
        const {
          queryBlock,
          removedSpy,
        } = this.setProperties({
          queryBlock: operatorBlockClasses[operatorName].create(),
          removedSpy: sinon.spy(),
        });

        this.render(hbs `{{query-builder/operator-block
          queryBlock=queryBlock
          onBlockRemoved=this.removedSpy
        }}`);
        await click('.query-builder-block-adder');
        await click('.operator-not');
        expect(removedSpy).to.be.not.called;
        const nestedBlock = get(queryBlock, 'operands.firstObject');
        await click('.remove-block');

        expect(this.$(
          '.query-builder-block .query-builder-block'
        )).to.not.exist;
        expect(this.$('.query-builder-block-adder'))
          .to.have.length(isMultiOperandOperator ? 2 : 1);
        expect(get(queryBlock, 'operands.length')).to.equal(0);
        expect(removedSpy).to.be.calledOnce.and.to.be.calledWith(nestedBlock);
      });

      it('allows to surround nested block with an operator', async function () {
        const queryBlock =
          this.set('queryBlock', operatorBlockClasses[operatorName].create());

        this.render(hbs `
          {{query-builder/operator-block queryBlock=queryBlock}}
        `);
        await click('.query-builder-block-adder');
        await click('.operator-not');
        await click('.query-builder-block-visualiser');
        await click('.surround-section .operator-and');

        expect(this.$('.query-builder-block')).to.have.length(3);
        const surroundingBlock = this.$('.query-builder-block .query-builder-block');
        expect(surroundingBlock).to.have.class('and-operator-block');
        const innerBlock = this.$(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        expect(innerBlock).to.have.class('not-operator-block');
        expect(get(queryBlock, 'operands.firstObject.operator'))
          .to.equal('and');
        expect(get(queryBlock, 'operands.firstObject.operands.firstObject.operator'))
          .to.equal('not');
      });

      it('allows to change nested operator to another operator', async function () {
        const queryBlock =
          this.set('queryBlock', operatorBlockClasses[operatorName].create());

        this.render(hbs `
          {{query-builder/operator-block queryBlock=queryBlock}}
        `);
        await click('.query-builder-block-adder');
        await click('.webui-popover.in .operator-not');
        await click('.query-builder-block-adder');
        await click('.webui-popover.in .operator-or');
        await click('.query-builder-block-visualiser');
        await click('.webui-popover.in .change-to-section .operator-and');

        expect(this.$('.query-builder-block')).to.have.length(3);
        const changedBlock = this.$('.query-builder-block .query-builder-block');
        expect(changedBlock).to.have.class('and-operator-block');
        const innerBlock = this.$(
          '.query-builder-block .query-builder-block .query-builder-block'
        );
        expect(innerBlock).to.have.class('or-operator-block');
        expect(get(queryBlock, 'operands.firstObject.operator')).to.equal('and');

        expect(get(queryBlock, 'operands.firstObject.operands.firstObject.operator'))
          .to.equal('or');
      });

      it(
        'propagates edition-related notifications from condition blocks',
        async function () {
          const {
            queryBlock,
            editionStartSpy,
            editionEndSpy,
            editionValidityChangeSpy,
          } = this.setProperties({
            queryBlock: operatorBlockClasses[operatorName].create(),
            editionStartSpy: sinon.spy(),
            editionEndSpy: sinon.spy(),
            editionValidityChangeSpy: sinon.spy(),
          });
          const nestedOperator = operatorBlockClasses[operatorName].create();
          queryBlock.addOperand(nestedOperator);
          const condition = ConditionQueryBlock.create({
            property: { key: 'some_key', type: 'string' },
            comparator: 'string.eq',
            comparatorValue: 'abc',
          });
          nestedOperator.addOperand(condition);

          this.render(hbs `
            {{query-builder/operator-block
              queryBlock=queryBlock
              onConditionEditionStart=editionStartSpy
              onConditionEditionEnd=editionEndSpy
              onConditionEditionValidityChange=editionValidityChangeSpy
            }}
          `);
          expect(editionStartSpy).to.not.be.called;
          expect(editionEndSpy).to.not.be.called;
          expect(editionValidityChangeSpy).to.not.be.called;

          await click('.comparator-value');
          expect(editionStartSpy, 'first start')
            .to.be.calledOnce.and.to.be.calledWith(condition);
          expect(editionEndSpy, 'first end').to.not.be.called;
          expect(editionValidityChangeSpy, 'first validity').to.not.be.called;

          await fillIn('.comparator-value', 'def');
          expect(editionStartSpy, 'change start').to.be.calledOnce;
          expect(editionEndSpy, 'change end').to.not.be.called;
          expect(editionValidityChangeSpy, 'change validity').to.be.calledOnce
            .and.to.be.calledWith(condition, true);

          await blur('.comparator-value');
          expect(editionStartSpy, 'blur start').to.be.calledOnce;
          expect(editionEndSpy, 'blur end')
            .to.be.calledOnce.and.to.be.calledWith(condition);
          expect(editionValidityChangeSpy, 'blur validity').to.be.calledOnce;
        }
      );

      it('yields', async function () {
        this.set('queryBlock', operatorBlockClasses[operatorName].create());

        this.render(hbs `
          {{#query-builder/operator-block queryBlock=queryBlock}}
            <span class="test-element"></span>
          {{/query-builder/operator-block}}
        `);

        expect(this.$('.test-element')).to.exist;
      });
    });
  });
});
