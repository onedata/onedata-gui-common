import { expect } from 'chai';
import { describe, context, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import setDefaultQueryValuesBuilder from '../../../helpers/set-default-query-values-builder';
import {
  render,
  click,
  fillIn,
  blur,
  triggerKeyEvent,
  find,
} from '@ember/test-helpers';
import globals from 'onedata-gui-common/utils/globals';

const mathOperators = ['eq', 'lt', 'lte', 'gt', 'gte'];

describe('Integration | Component | query-builder/condition-comparator-value-editor',
  function () {
    setupRenderingTest();

    setDefaultQueryValuesBuilder();

    context('in view mode', function () {
      [{
        comparator: 'string.eq',
        value: 'hello',
        viewValue: '"hello"',
      }, {
        comparator: 'number.eq',
        value: '2',
        viewValue: '2',
      }].forEach(({ comparator, value, viewValue }) => {
        const [propertyType, comparatorName] = comparator.split('.');
        it(`shows comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            this.setProperties({
              comparator,
              value,
            });

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="view"
              comparator=comparator
              value=value
              valuesBuilder=valuesBuilder
            }}`);

            expect(find('.comparator-value').textContent.trim()).to.equal(viewValue);
          }
        );
      });

      it('calls "onStartEdit" on click', async function () {
        const onStartEditSpy = this.set('onStartEditSpy', sinon.spy());

        await render(hbs `{{query-builder/condition-comparator-value-editor
          mode="view"
          comparator="string.eq"
          value="hello"
          onStartEdit=onStartEditSpy
          valuesBuilder=valuesBuilder
        }}`);

        await click('.comparator-value');

        expect(onStartEditSpy).to.be.calledOnce;
      });
    });

    context('in create mode', function () {
      itShowsTextInput('string.eq');
      itShowsPowerSelectWithOptions('stringOptions.eq', ['one', 'two', 'three']);
      itShowsPowerSelectWithOptions('mixedOptions.eq', ['1', '2', 'a', 'b', 'c']);
      itShowsPowerSelectWithOptions('mixedOptions.lt', ['1', '2', 'a', 'b'], ['1', '2']);
      itCallsOnValueChange('string.eq', 'abc');

      mathOperators.forEach(operator => {
        itShowsTextInput(`number.${operator}`);
        itCallsOnValueChange(`number.${operator}`, 'abc');
      });
    });

    context('in edit mode', function () {
      [
        'string.eq',
        ...mathOperators.map(operator => `number.${operator}`),
      ].forEach(comparator => {
        const [propertyType, comparatorName] = comparator.split('.');
        const value = comparator.startsWith('number') ? '1' : 'abc';
        const newValue = comparator.startsWith('number') ? '2' : 'def';
        const beforeTest = (testCase) => {
          testCase.setProperties({
            comparator,
            value,
            newValue,
          });
        };

        it(`has focused editor on init for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              valuesBuilder=valuesBuilder
            }}`);

            expect(find('.comparator-value'), '.comparator-value is active')
              .to.equal(globals.document.activeElement);
          }
        );

        it(`shows current comparator value for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value="abc"
              valuesBuilder=valuesBuilder
            }}`);

            expect(find('.comparator-value').value).to.equal('abc');
          }
        );

        it(`closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property (close using Enter)`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value="abc"
              onValueChange=changeSpy
              onFinishEdit=finishEditSpy
              valuesBuilder=valuesBuilder
            }}`);

            await fillIn('.comparator-value', newValue);
            await triggerKeyEvent('.comparator-value', 'keydown', 'Enter');

            expect(changeSpy).to.be.calledWith(newValue);
            expect(finishEditSpy).to.be.calledOnce;
          }
        );

        it(`closes editor and notifies about new value for "${comparatorName}" comparator for ${propertyType} property (close using blur)`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              onValueChange=changeSpy
              onFinishEdit=finishEditSpy
              valuesBuilder=valuesBuilder
            }}`);

            await fillIn('.comparator-value', newValue);
            await blur('.comparator-value');

            expect(changeSpy, 'change').to.be.calledWith(newValue);
            expect(finishEditSpy, 'finishEdit').to.be.called;
          }
        );

        it(`notifies about partial new value before close for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              changeSpy,
              finishEditSpy,
            } = this.setProperties({
              changeSpy: sinon.spy(),
              finishEditSpy: sinon.spy(),
            });

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              onValueChange=changeSpy
              onFinishEdit=finishEditSpy
              valuesBuilder=valuesBuilder
            }}`);

            await fillIn('.comparator-value', 'de');

            expect(changeSpy).to.be.calledWith('de');
            expect(finishEditSpy).to.not.be.called;
          }
        );

        it(`cancels editor on Escape key down for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);
            const {
              finishEditSpy,
              cancelEditSpy,
            } = this.setProperties({
              finishEditSpy: sinon.spy(),
              cancelEditSpy: sinon.spy(),
            });

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value=value
              onFinishEdit=finishEditSpy
              onCancelEdit=cancelEditSpy
              valuesBuilder=valuesBuilder
            }}`);

            await click('.comparator-value');
            await fillIn('.comparator-value', newValue);
            await triggerKeyEvent('.comparator-value', 'keydown', 'Escape');

            expect(finishEditSpy).to.not.be.called;
            expect(cancelEditSpy).to.be.calledOnce;
          }
        );

        it(`does not add class "is-invalid" to the input by default for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              value="abc"
              valuesBuilder=valuesBuilder
            }}`);

            expect(find('.comparator-value')).to.not.have.class('is-invalid');
          }
        );

        it(`adds class "is-invalid" to the input if isValueInvalid is true for "${comparatorName}" comparator for ${propertyType} property`,
          async function () {
            beforeTest(this);

            await render(hbs `{{query-builder/condition-comparator-value-editor
              mode="edit"
              comparator=comparator
              isValueInvalid=true
              value="abc"
              valuesBuilder=valuesBuilder
            }}`);

            expect(find('.comparator-value')).to.have.class('is-invalid');
          }
        );
      });
    });
  }
);

function itShowsPowerSelectWithOptions(
  comparator,
  providedOptionValues = [],
  expectedOptionValues = providedOptionValues
) {
  const [propertyType, comparatorName] = comparator.split('.');
  it(`shows power-select with options for "${comparatorName}" comparator for ${propertyType} property`,
    async function () {
      const queryProperty = {
        key: 'dummy',
        displayedKey: 'Dummy',
        type: `${propertyType}Options`,
        numberValues: providedOptionValues.filter(value => !isNaN(parseFloat(value))),
        stringValues: providedOptionValues.filter(value => isNaN(parseFloat(value))),
        allValues: providedOptionValues,
      };

      this.setProperties({
        queryProperty,
        comparator,
      });

      await render(hbs `{{query-builder/condition-comparator-value-editor
        mode="create"
        comparator=comparator
        queryProperty=queryProperty
        valuesBuilder=valuesBuilder
      }}`);

      expect(find('.dropdown-editor-trigger.comparator-value'), 'dropdown trigger')
        .to.exist;
      await clickTrigger('.dropdown-editor');
      const options = globals.document.querySelectorAll('.ember-power-select-option');
      expect(options).to.have.length(expectedOptionValues.length);
      expect(Array.from(options).map(opt => opt.textContent.trim()).sort())
        .to.deep.equal(expectedOptionValues.sort());
    }
  );
}

function itShowsTextInput(comparator) {
  const [propertyType, comparatorName] = comparator.split('.');
  it(`shows text input for "${comparatorName}" comparator for ${propertyType} property`,
    async function () {
      this.set('comparator', comparator);

      await render(hbs `{{query-builder/condition-comparator-value-editor
        mode="create"
        comparator=comparator
        valuesBuilder=valuesBuilder
      }}`);

      expect(find('input[type="text"].comparator-value'), 'input.comparator-value')
        .to.exist;
    }
  );
}

function itCallsOnValueChange(comparator, valueToInput) {
  const [propertyType, comparatorName] = comparator.split('.');
  it(`calls "onValueChange" callback, when ${propertyType} property "${comparatorName}" condition value has changed`,
    async function () {
      const { changeSpy } = this.setProperties({
        comparator,
        changeSpy: sinon.spy(),
      });

      await render(hbs `{{query-builder/condition-comparator-value-editor
        mode="create"
        comparator=comparator
        onValueChange=changeSpy
        valuesBuilder=valuesBuilder
      }}`);

      await fillIn('.comparator-value', valueToInput);

      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith(valueToInput);
    }
  );
}
