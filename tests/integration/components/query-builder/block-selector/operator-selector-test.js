import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

const allowedOperatorsList = ['and', 'or', 'excluding', 'not'];

describe(
  'Integration | Component | query builder/block selector/operator selector',
  function () {
    setupComponentTest('query-builder/block-selector/operator-selector', {
      integration: true,
    });

    it(
      `renders four operators: ${allowedOperatorsList.map(s => s.toUpperCase()).join(', ')} by default`,
      async function () {
        this.render(hbs `{{query-builder/block-selector/operator-selector}}`);

        const operators = this.$('.operator-selector .operator');
        expect(operators).to.have.length(4);
        allowedOperatorsList.forEach((operatorName, index) =>
          checkOperatorButton(operators[index], operatorName)
        );
      }
    );

    allowedOperatorsList.forEach(operatorName => {
      it(
        `calls "onOperatorSelected" callback, when ${operatorName.toUpperCase()} operator has been clicked`,
        async function () {
          const addSpy = this.set('addSpy', sinon.spy());

          this.render(hbs `{{query-builder/block-selector/operator-selector
            onOperatorSelected=addSpy
          }}`);

          expect(addSpy).to.not.be.called;
          await click(`.operator-${operatorName}`);
          expect(addSpy).to.be.calledOnce.and.to.be.calledWith(operatorName);
        }
      );
    });

    it(
      'renders only specified subset of operators',
      async function () {

        this.render(hbs `{{query-builder/block-selector/operator-selector
          operators=(array "and" "or")
        }}`);

        const operators = this.$('.operator-selector .operator');
        expect(operators).to.have.length(2);
        ['and', 'or'].forEach((operatorName, index) =>
          checkOperatorButton(operators[index], operatorName)
        );
      }
    );

    it(
      'does not render incorrect operators',
      async function () {

        this.render(hbs `{{query-builder/block-selector/operator-selector
          operators=(array "and" "xor")
        }}`);

        const operators = this.$('.operator-selector .operator');
        expect(operators).to.have.length(1);
        checkOperatorButton(operators[0], 'and');
      }
    );

    it(
      'does not disable any operator by default',
      async function () {
        this.render(hbs `{{query-builder/block-selector/operator-selector}}`);

        expect(this.$('.operator-selector .operator[disabled]')).to.not.exist;
      }
    );

    it(
      'disables specified operators',
      async function () {
        this.render(hbs `{{query-builder/block-selector/operator-selector
          disabledOperators=(array "and" "or")
        }}`);

        expect(this.$('.operator-selector .operator[disabled]'))
          .to.have.length(2);
        expect(this.$('.operator-selector .operator-not'))
          .to.not.have.attr('disabled');
      }
    );
  }
);

function checkOperatorButton(buttonNode, operatorName) {
  expect(buttonNode.textContent.trim()).to.equal(operatorName);
  expect(Array.from(buttonNode.classList)).to.include(`operator-${operatorName}`);
}
