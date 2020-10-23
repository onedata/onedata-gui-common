import { expect } from 'chai';
import { describe, context, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click, fillIn, blur } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

const mathOperators = ['eq', 'lt', 'lte', 'gt', 'gte'];

describe(
  'Integration | Component | query builder/condition comparator value editor',
  function () {
    setupComponentTest('query-builder/condition-comparator-value-editor', {
      integration: true,
    });

    context('in view mode', function () {
      [{
        comparator: 'string.eq',
        value: 'hello',
        viewValue: '"hello"',
      }, {
        comparator: 'number.eq',
        value: '2',
        viewValue: '"2"',
      }].forEach(({ comparator, value, viewValue }) => {
        const [propertyType, comparatorName] = comparator.split('.');
        it(
          `shows comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          function () {
            this.setProperties({
              comparator,
              value,
            });

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="view"
              comparator=comparator
              value=value
            }}`);

            expect(this.$('.comparator-value').text().trim()).to.equal(viewValue);
          }
        );
      });

      it('calls "onStartEdit" on click', async function () {
        const onStartEditSpy = this.set('onStartEditSpy', sinon.spy());

        this.render(hbs `{{query-builder/condition-comparator-value-editor
          mode="view"
          comparator="text.eq"
          value="hello"
          onStartEdit=onStartEditSpy
        }}`);

        await click('.comparator-value');

        expect(onStartEditSpy).to.be.calledOnce;
      });
    });

    context('in create mode', function () {
      [{
        comparator: 'string.eq',
        valueToInput: 'abc',
      }, ...mathOperators.map(operator => ({
        comparator: `number.${operator}`,
        valueToInput: '2',
      }))].forEach(({ comparator, valueToInput }) => {
        const [propertyType, comparatorName] = comparator.split('.');

        it(
          `shows text input for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            this.set('comparator', comparator);

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="create"
              comparator=comparator
            }}`);

            expect(this.$('input[type="text"].comparator-value'))
              .to.exist;
          }
        );

        it(
          `calls "onValueChange" callback, when ${propertyType} property "${comparatorName}" condition value has changed`,
          async function () {
            const { changeSpy } = this.setProperties({
              comparator,
              changeSpy: sinon.spy(),
            });

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="create"
              comparator=comparator
              onValueChange=changeSpy
            }}`);

            await fillIn('.comparator-value', valueToInput);

            expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(valueToInput);
          }
        );
      });
    });

    context('in edit mode', function () {
      [
        'text.eq',
        ...mathOperators.map(operator => `number.${operator}`),
      ].forEach(comparator => {
        const [propertyType, comparatorName] = comparator.split('.');
        const value = comparator.startsWith('number') ? '1' : 'abc';
        const newValue = comparator.startsWith('number') ? '2' : 'def';
        const beforeTest = testCase => {
          testCase.setProperties(
            comparator,
            value,
            newValue
          );
        };

        it(
          `has focused editor on init for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
            }}`);

            expect(this.$('.comparator-value')[0]).to.equal(document.activeElement);
          }
        );

        it(
          `shows current comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value="abc"
            }}`);

            expect(this.$('.comparator-value')).to.have.value('abc');
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property (close using Enter)`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value="abc"
              onValueChange=changeSpy
              onFinishEdit=finishEditSpy
            }}`);

            await fillIn('.comparator-value', newValue);

            this.$('.comparator-value').trigger({ type: 'keydown', key: 'Enter' });

            expect(changeSpy).to.be.calledWith(newValue);
            expect(finishEditSpy).to.be.calledOnce;
          }
        );

        it(
          `closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property (close using blur)`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              onValueChange=changeSpy
              onFinishEdit=finishEditSpy
            }}`);

            await fillIn('.comparator-value', newValue);
            await blur('.comparator-value');

            expect(changeSpy, 'change').to.be.calledWith(newValue);
            expect(finishEditSpy, 'finishEdit').to.be.called;
          }
        );

        it(
          `notifies about partial new value before close for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              onValueChange=changeSpy
              onFinishEdit=finishEditSpy
            }}`);

            await fillIn('.comparator-value', 'de');

            expect(changeSpy).to.be.calledWith('de');
            expect(finishEditSpy).to.not.be.called;
          }
        );

        it(
          `cancels editor on Escape key down for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              finishEditSpy,
              cancelEditSpy,
            } = this.setProperties({
              finishEditSpy: sinon.spy(),
              cancelEditSpy: sinon.spy(),
            });

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              onFinishEdit=finishEditSpy
              onCancelEdit=cancelEditSpy
            }}`);

            await click('.comparator-value');
            await fillIn('.comparator-value', newValue);

            this.$('.comparator-value').trigger({ type: 'keydown', key: 'Escape' });
            await wait();

            expect(finishEditSpy).to.not.be.called;
            expect(cancelEditSpy).to.be.calledOnce;
          }
        );

        it(
          `does not add class "is-invalid" to the input by default for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value="abc"
            }}`);

            expect(this.$('.comparator-value')).to.not.have.class('is-invalid');
          }
        );

        it(
          `adds class "is-invalid" to the input if isValueInvalid is true for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            this.render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              isValueInvalid=true
              value="abc"
            }}`);

            expect(this.$('.comparator-value'))
              .to.have.class('is-invalid');
          }
        );
      });
    });
  }
);
