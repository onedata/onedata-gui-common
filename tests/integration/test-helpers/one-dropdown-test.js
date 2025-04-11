import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import OneDropdownHelper from '../../helpers/one-dropdown';
import sinon from 'sinon';
import { clickTrigger } from 'ember-power-select/test-support/helpers';

describe('Integration | Test helper | one-dropdown', function () {
  setupRenderingTest();

  beforeEach(function () {
    setDropdownsOption(this, 'options', [
      ['a', 'b', 'c', 'd'],
      ['a', 'b', 'c', 'd'],
      ['a', 'b', 'c', 'd'],
    ]);
    setDropdownsOption(this, 'selected', [undefined, undefined, undefined]);
    setDropdownsOption(this, 'disabled', [false, false, false]);
    setDropdownsOption(this, 'searchEnabled', [false, false, false]);
    setDropdownsOption(this, 'onChange', [
      sinon.spy((value) => this.set('selected0', value)),
      sinon.spy((value) => this.set('selected1', value)),
      sinon.spy((value) => this.set('selected2', value)),
    ]);
  });

  [true, false].forEach((renderInPlace) => {
    context(`when renderInPlace is ${renderInPlace}`, function () {
      beforeEach(function () {
        this.set('renderInPlace', renderInPlace);
      });

      describe('getTrigger', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns trigger of the first found dropdown when ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(helper.getTrigger()).to.have.class('trigger1');
            }
          );
        });
      });

      describe('getSelectedOptionText', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns trigger text of the first found dropdown when option is selected and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'selected', ['a', 'b', 'c']);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(helper.getSelectedOptionText()).to.equal('b');
            }
          );
        });

        it('returns null for the first found dropdown when nothing is selected',
          async function () {
            setDropdownsOption(this, 'selected', ['a', undefined, 'c']);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(helper.getSelectedOptionText()).to.be.null;
          }
        );

        it('returns null for the first found dropdown when nothing is selected and placeholder is specified',
          async function () {
            setDropdownsOption(this, 'selected', ['a', undefined, 'c']);
            setDropdownsOption(this, 'placeholder', [undefined, 'p', undefined]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(helper.getSelectedOptionText()).to.be.null;
          }
        );
      });

      describe('getPlaceholder', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns placeholder text of the first found dropdown when nothing is selected and placeholder is set and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'placeholder', ['o', 'p', 'q']);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(helper.getPlaceholder()).to.equal('p');
            }
          );
        });

        it('returns null for the first found dropdown when option is selected and placeholder is set',
          async function () {
            setDropdownsOption(this, 'selected', ['a', 'b', 'c']);
            setDropdownsOption(this, 'placeholder', [undefined, 'p', undefined]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(helper.getPlaceholder()).to.be.null;
          }
        );

        it('returns null for the first found dropdown when nothing is selected and placeholder is not set',
          async function () {
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(helper.getPlaceholder()).to.be.null;
          }
        );
      });

      describe('isDisabled', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns false when the first found dropdown is not disabled and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'disabled', [true, false, true]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(helper.isDisabled()).to.be.false;
            }
          );
        });

        it('returns true when the first found dropdown is disabled',
          async function () {
            setDropdownsOption(this, 'disabled', [false, true, false]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(helper.isDisabled()).to.be.true;
          }
        );
      });

      describe('isOpened', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns false when the first found dropdown is closed and ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(helper.isOpened()).to.be.false;
            }
          );
        });

        it('returns true when the first found dropdown is opened', async function () {
          await renderOneDropdown();
          await clickTrigger('.testing-dropdowns');

          const helper = new OneDropdownHelper('.testing-dropdowns');
          expect(helper.isOpened()).to.be.true;
        });
      });

      describe('open', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`opens the first found dropdown if it is closed and ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              await helper.open();

              expect(find('.trigger1'))
                .to.have.attribute('aria-expanded', 'true');
            }
          );
        });

        it('does nothing when the first found dropdown is opened',
          async function () {
            await renderOneDropdown();
            await clickTrigger('.testing-dropdowns');

            const helper = new OneDropdownHelper('.testing-dropdowns');
            await helper.open();

            expect(find('.trigger1'))
              .to.have.attribute('aria-expanded', 'true');
          }
        );
      });

      describe('close', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`closes the first found dropdown if it is opened and ${selectorKind}`,
            async function () {
              await renderOneDropdown();
              await clickTrigger('.testing-dropdowns');

              const helper = new OneDropdownHelper(getElementOrSelector());
              await helper.close();

              expect(find('.trigger1')).to.not.have.attribute('aria-expanded');
            }
          );
        });

        it('does nothing when the first found dropdown is closed and ${selectorKind}',
          async function () {
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            await helper.close();

            expect(find('.trigger1')).to.not.have.attribute('aria-expanded');
          }
        );
      });

      describe('getOptionsContainer', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns options container for the first found dropdown when ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              const optionsContainer = await helper.getOptionsContainer();

              expect(optionsContainer)
                .to.have.class('ember-power-select-dropdown');
              expect(find('.trigger1'))
                .to.have.attribute('aria-expanded', 'true');
            }
          );
        });
      });

      describe('getSearchInput', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns null when the first found dropdown does not have search input and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'searchEnabled', [true, false, true]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(await helper.getSearchInput()).to.be.null;
            }
          );
        });

        it('returns input when the first found dropdown has search input',
          async function () {
            setDropdownsOption(this, 'searchEnabled', [false, true, false]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(await helper.getSearchInput())
              .to.have.class('ember-power-select-search-input');
          }
        );
      });

      describe('fillInSearchInput', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`fills in search input in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'searchEnabled', [false, true, false]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              await helper.fillInSearchInput('b');

              expect(find('.ember-power-select-search-input'))
                .to.have.value('b');
              expect(find('.ember-power-select-dropdown'))
                .to.not.contain.text('c');
            }
          );
        });
      });

      describe('getOptions', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns options of the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                [],
                ['a', 'b'],
                [],
              ]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              const options = await helper.getOptions();

              expect(options).to.have.length(2);
              expect(options[0]).to.contain.text('a');
              expect(options[1]).to.contain.text('b');
            }
          );
        });

        it('returns empty array of options when the first found dropdown does not have any',
          async function () {
            setDropdownsOption(this, 'options', [
              ['a', 'b'],
              [],
              ['a', 'b'],
            ]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            const options = await helper.getOptions();

            expect(options).to.have.length(0);
          }
        );
      });

      describe('getOptionsText', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns options text of the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                [],
                ['a', 'b'],
                [],
              ]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(await helper.getOptionsText()).to.deep.equal(['a', 'b']);
            }
          );
        });

        it('returns empty array of options text when the first found dropdown does not have any',
          async function () {
            setDropdownsOption(this, 'options', [
              ['a', 'b'],
              [],
              ['a', 'b'],
            ]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(await helper.getOptionsText()).to.have.length(0);
          }
        );

        it('lefts the first found dropdown in the open state the same as it was at the beginning',
          async function () {
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            await helper.getOptionsText();
            expect(find('.trigger1')).to.not.have.attribute('aria-expanded');

            await clickTrigger('.testing-dropdowns');
            await helper.getOptionsText();
            expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
          }
        );
      });

      describe('getOptionByText', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(await helper.getOptionByText('b'))
                .to.contain.trimmed.text('abc');
            }
          );
        });

        it('returns null when the first found dropdown does not have matching option',
          async function () {
            setDropdownsOption(this, 'options', [
              ['abc', 'def'],
              ['a', 'b'],
              ['abc', 'def'],
            ]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(await helper.getOptionByText('c')).to.be.null;
          }
        );
      });

      describe('getOptionByIndex', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(await helper.getOptionByIndex(1))
                .to.contain.trimmed.text('def');
            }
          );
        });

        it('returns null when the first found dropdown does not have matching option',
          async function () {
            setDropdownsOption(this, 'options', [
              ['a', 'b'],
              ['abc', 'def'],
              ['a', 'b'],
            ]);
            await renderOneDropdown();

            const helper = new OneDropdownHelper('.testing-dropdowns');
            expect(await helper.getOptionByIndex(2)).to.be.null;
          }
        );
      });

      describe('selectOptionByText', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`selects matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              await helper.selectOptionByText('b');

              expect(this.onChange1).to.have.been.calledWith('abc', sinon.match.any);
            }
          );
        });
      });

      describe('selectOptionByIndex', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`selects matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              const helper = new OneDropdownHelper(getElementOrSelector());
              await helper.selectOptionByIndex(1);

              expect(this.onChange1)
                .to.have.been.calledWith('def', sinon.match.any);
            }
          );
        });
      });

      describe('isOptionDisabled', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`returns false when given option is not disabled when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                [{ disabled: true }],
                [{ disabled: false }, { disabled: true }],
                [{ disabled: true }],
              ]);
              await renderOneDropdown();

              await clickTrigger('.testing-dropdowns');
              const option = find('.ember-power-select-dropdown li');
              const helper = new OneDropdownHelper(getElementOrSelector());
              expect(helper.isOptionDisabled(option)).to.be.false;
            });
        });

        it('returns true when given option is disabled', async function () {
          setDropdownsOption(this, 'options', [
            [{ disabled: false }],
            [{ disabled: true }, { disabled: false }],
            [{ disabled: false }],
          ]);
          await renderOneDropdown();

          await clickTrigger('.testing-dropdowns');
          const option = find('.ember-power-select-dropdown li');
          const helper = new OneDropdownHelper('.testing-dropdowns');
          expect(helper.isOptionDisabled(option)).to.be.true;
        });
      });

      describe('selectOption', function () {
        testForAllSelectors((getElementOrSelector, selectorKind) => {
          it(`selects given option when ${selectorKind}`, async function () {
            await renderOneDropdown();
            await clickTrigger('.testing-dropdowns');
            const option = find('.ember-power-select-dropdown li');

            const helper = new OneDropdownHelper(getElementOrSelector());
            await helper.selectOption(option);

            expect(this.onChange1).to.have.been.calledWith('a');
          });
        });
      });
    });
  });
});

async function renderOneDropdown() {
  await render(hbs`
    {{!-- dropdown "0" to check if helpers will omit dropdown, which is outside
    given element/selector --}}
    <OneDropdown
      @triggerClass="trigger0"
      @renderInPlace={{renderInPlace}}
      @onChange={{onChange0}}
      @options={{options0}}
      @selected={{selected0}}
      @placeholder={{placeholder0}}
      @disabled={{disabled0}}
      @searchEnabled={{searchEnabled0}}
      as |option|
    >
      {{option}}
    </OneDropdown>
    <div class="testing-dropdowns">
      {{!-- dropdown "1" is the main dropdown to be tested --}}
      <OneDropdown
        @triggerClass="trigger1"
        @renderInPlace={{renderInPlace}}
        @onChange={{onChange1}}
        @options={{options1}}
        @selected={{selected1}}
        @placeholder={{placeholder1}}
        @disabled={{disabled1}}
        @searchEnabled={{searchEnabled1}}
        as |option|
      >
        {{option}}
      </OneDropdown>
      {{!-- dropdown "2" to check if helpers will take the first found
      dropdown and omit the rest of matching dropdowns --}}
      <OneDropdown
        @triggerClass="trigger2"
        @renderInPlace={{renderInPlace}}
        @onChange={{onChange2}}
        @options={{options2}}
        @selected={{selected2}}
        @placeholder={{placeholder2}}
        @disabled={{disabled2}}
        @searchEnabled={{searchEnabled2}}
        as |option|
      >
        {{option}}
      </OneDropdown>
    </div>
  `);
}

/**
 * @param {(getElementOrSelector: () => (Element|string), selectorKind: string) => void} testCallback
 */
function testForAllSelectors(testCallback) {
  [{
    getElementOrSelector: () => find('.testing-dropdowns'),
    selectorKind: 'parent element has been provided',
  }, {
    getElementOrSelector: () => find('.trigger1'),
    selectorKind: 'trigger element has been provided',
  }, {
    getElementOrSelector: () => '.testing-dropdowns',
    selectorKind: 'parent element selector has been provided',
  }, {
    getElementOrSelector: () => '.trigger1',
    selectorKind: 'trigger selector has been provided',
  }].forEach(({ getElementOrSelector, selectorKind }) =>
    testCallback(getElementOrSelector, selectorKind)
  );
}

/**
 * Sets given property for all three test dropdowns at once
 * @param {Mocha.Context} testCase
 * @param {'onChange'|'options'|'selected'|'placeholder'|'disabled'|'searchEnabled'} name
 * @param {[unknown, unknown, unknown]} values
 */
function setDropdownsOption(testCase, name, values) {
  values.forEach((value, index) => testCase.set(`${name}${index}`, value));
}
