import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import AndOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/not-operator-query-block';
import ExceptOperatorQueryBlock from 'onedata-gui-common/utils/query-builder/except-operator-query-block';
import ConditionQueryBlock from 'onedata-gui-common/utils/query-builder/condition-query-block';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import { get } from '@ember/object';

const multiOperandOperatorsList = ['and', 'or', 'except'];
const singleOperandOperatorsList = ['not'];
const operatorsList = [...multiOperandOperatorsList, ...singleOperandOperatorsList];
const operatorBlockClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  except: ExceptOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

describe('Integration | Component | query builder/block selector', function () {
  setupComponentTest('query-builder/block-selector', {
    integration: true,
  });

  context('in "create" mode', function () {
    beforeEach(function () {
      this.set('queryProperties', [{
        key: 'numProp',
        type: 'number',
      }, {
        key: 'stringProp',
        type: 'string',
      }]);
    });

    it(`renders operators: ${operatorsList.join(', ')}`, async function () {
      this.render(hbs `{{query-builder/block-selector mode="create"}}`);

      const operators = this.$('.operator-selector .operator');
      expect(operators).to.have.length(operatorsList.length);
      operatorsList.forEach((operatorName, index) => {
        const operator = operators[index];
        expect(operator.textContent.trim()).to.equal(operatorName);
      });
    });

    operatorsList.forEach(operatorName => {
      it(
        `calls "onBlockAdd" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
        async function () {
          const addSpy = this.set('addSpy', sinon.spy());

          this.render(hbs `{{query-builder/block-selector
            mode="create"
            onBlockAdd=addSpy
          }}`);

          expect(addSpy).to.not.be.called;
          await click(`.operator-${operatorName}`);

          const blockMatcher = sinon.match(obj => get(obj, 'operator') === operatorName);
          expect(addSpy).to.be.calledOnce.and.to.be.calledWith(blockMatcher);
        }
      );
    });

    it('lists query properties in dropdown', async function () {
      this.render(hbs `{{query-builder/block-selector
        mode="create"
        queryProperties=queryProperties
      }}`);

      await clickTrigger('.property-selector-container');

      const queryProperties = this.get('queryProperties');
      const options = this.$('.ember-power-select-option');
      expect(options).to.have.length(queryProperties.length);
      queryProperties.mapBy('key').forEach((path, index) =>
        expect(options[index].textContent.trim()).to.equal(path)
      );
    });

    it(
      'calls "onBlockAdd" callback, when condition has been accepted',
      async function () {
        const addSpy = this.set('addSpy', sinon.spy((block) => this.set('block', block)));

        this.render(hbs `{{query-builder/block-selector
          mode="create"
          onBlockAdd=addSpy
          queryProperties=queryProperties
        }}`);

        await selectChoose('.property-selector-container', 'numProp');
        await fillIn('.comparator-value', '10');
        await click('.accept-condition');

        expect(addSpy).to.be.calledOnce;
        const block = this.get('block');
        expect(get(block, 'isCondition')).to.be.true;
        expect(get(block, 'property.key')).to.equal('numProp');
        expect(get(block, 'comparator')).to.equal('number.eq');
        expect(get(block, 'comparatorValue')).to.equal('10');
      }
    );

    it('does not render edit-specific sections', async function () {
      this.render(hbs `{{query-builder/block-selector
        mode="create"
      }}`);

      expect(this.$('.surround-section')).to.not.exist;
      expect(this.$('.change-to-section')).to.not.exist;
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.set('editBlock', NotOperatorQueryBlock.create());
    });

    it(
      `renders operators: ${operatorsList.join(', ')} in "surround" section`,
      async function () {
        this.render(hbs `{{query-builder/block-selector
          mode="edit"
        }}`);
        const operators = this.$('.surround-section .operator-selector .operator');
        expect(operators).to.have.length(operatorsList.length);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          expect(operator.textContent.trim()).to.equal(operatorName);
        });
      }
    );

    operatorsList.forEach(operatorName => {
      it(
        `calls "onBlockReplace" callback, when ${operatorName.toUpperCase()} operator in "surround" section has been clicked`,
        async function () {
          const editBlock = this.get('editBlock');
          const replaceSpy = this.set('replaceSpy', sinon.spy());

          this.render(hbs `{{query-builder/block-selector
            mode="edit"
            editBlock=editBlock
            onBlockReplace=replaceSpy
          }}`);

          expect(replaceSpy).to.not.be.called;
          await click(`.surround-section .operator-${operatorName}`);
          expect(replaceSpy).to.be.calledOnce;
          const blocks = replaceSpy.firstCall.args[0];
          const block = blocks[0];
          expect(get(blocks, 'length')).to.equal(1);
          expect(get(block, 'operator')).to.equal(operatorName);
          expect(get(block, 'operands.length')).to.equal(1);
          expect(get(block, 'operands.firstObject')).to.equal(editBlock);
        }
      );
    });

    it(
      `renders operators: ${operatorsList.join(', ')} in "change to" section`,
      async function () {
        this.render(hbs `{{query-builder/block-selector
          mode="edit"
          editBlock=editBlock
        }}`);

        const operators = this.$('.change-to-section .operator-selector .operator');
        expect(operators).to.have.length(operatorsList.length);
        operatorsList.forEach((operatorName, index) => {
          const operator = operators[index];
          expect(operator.textContent.trim()).to.equal(operatorName);
        });
      }
    );

    it(
      'does not render operators in "change operator to" section when block is not an operator',
      async function () {
        this.set('editBlock', ConditionQueryBlock.create());

        this.render(hbs `{{query-builder/block-selector
          mode="edit"
          editBlock=editBlock
        }}`);

        expect(this.$('.change-to-section')).to.not.exist;
      }
    );

    operatorsList.forEach(operatorName => {
      [{
        beforeFunc() {},
        descriptionSuffix: 'with no condition',
      }, {
        beforeFunc(testCase) {
          const editBlock = testCase.get('editBlock');
          const conditionBlock = ConditionQueryBlock.create();
          editBlock.addOperand(conditionBlock);
        },
        descriptionSuffix: 'with single condition',
      }].forEach(({ beforeFunc, descriptionSuffix }) => {
        const operatorUpper = operatorName.toUpperCase();
        it(
          `blocks "change operator to" ${operatorUpper} when editing ${operatorUpper} operator ${descriptionSuffix}`,
          async function () {
            this.set('editBlock', operatorBlockClasses[operatorName].create({
              operator: operatorName,
            }));
            beforeFunc(this);

            this.render(hbs `{{query-builder/block-selector
                mode="edit"
                editBlock=editBlock
              }}`);

            expect(
              this.$(`.change-to-section .operator-${operatorName}`)
            ).to.have.attr('disabled');
            expect(
              this.$('.change-to-section .operator:not([disabled])')
            ).to.have.length(operatorsList.length - 1);
          }
        );
      });
    });

    multiOperandOperatorsList.forEach(operatorName => {
      const operatorUpper = operatorName.toUpperCase();
      it(
        `blocks "change operator to" ${operatorUpper} and NOT when editing ${operatorUpper} operator with two conditions`,
        async function () {
          const editBlock = this.set(
            'editBlock',
            operatorBlockClasses[operatorName].create({
              operator: operatorName,
            })
          );
          const conditionBlock = ConditionQueryBlock.create();
          editBlock.addOperand(conditionBlock);
          editBlock.addOperand(conditionBlock);

          this.render(hbs `{{query-builder/block-selector
            mode="edit"
            editBlock=editBlock
          }}`);

          [
            operatorName,
            'not',
          ].forEach(disabledOperator => {
            expect(this.$(
              `.change-to-section .operator-${disabledOperator}`
            )).to.have.attr('disabled');
          });

          expect(
            this.$('.change-to-section .operator:not([disabled])')
          ).to.have.length(operatorsList.length - 2);
        }
      );
    });

    operatorsList.forEach(sourceOperatorName => {
      operatorsList.without(sourceOperatorName).forEach(destinationOperatorName => {
        it(
          `changes ${sourceOperatorName.toUpperCase()} operator with single condition to ${destinationOperatorName.toUpperCase()} operator`,
          async function () {
            const editBlock = this.set(
              'editBlock',
              operatorBlockClasses[sourceOperatorName].create({
                operator: sourceOperatorName,
              })
            );
            const conditionBlock = ConditionQueryBlock.create();
            editBlock.addOperand(conditionBlock);
            const replaceSpy = this.set(
              'replaceSpy',
              sinon.spy(([block]) => this.set('block', block))
            );

            this.render(hbs `{{query-builder/block-selector
              mode="edit"
              editBlock=editBlock
              onBlockReplace=replaceSpy
            }}`);

            await click(`.change-to-section .operator-${destinationOperatorName}`);

            expect(replaceSpy).to.be.calledOnce;
            const block = this.get('block');
            expect(get(block, 'operator')).to.equal(destinationOperatorName);
            expect(get(block, 'operands.length')).to.equal(1);
            expect(get(block, 'operands.firstObject')).to.equal(conditionBlock);
          }
        );
      });
    });

    it('does not render create-specific sections', async function () {
      this.render(hbs `{{query-builder/block-selector
        mode="edit"
        editBlock=editBlock
      }}`);

      expect(this.$('.add-operator-section')).to.not.exist;
      expect(this.$('.condition-section')).to.not.exist;
    });
  });
});
