import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  getOneDropdownTrigger,
  getOneDropdownSelectedOptionText,
  getOneDropdownPlaceholder,
  isOneDropdownDisabled,
  isOneDropdownOpened,
  openOneDropdown,
  closeOneDropdown,
  getOneDropdownOptionsContainer,
  isOneDropdownHavingSearch,
  fillInOneDropdownSearch,
  getOneDropdownSearchValue,
  getOneDropdownOptions,
  getOneDropdownOptionsText,
  getOneDropdownOptionByText,
  getOneDropdownOptionByIndex,
  isOneDropdownOptionDisabled,
  selectOneDropdownOption,
  selectOneDropdownOptionByText,
  selectOneDropdownOptionByIndex,
} from '../../helpers/one-dropdown';
import sinon from 'sinon';
import { clickTrigger } from 'ember-power-select/test-support/helpers';

describe('Integration | Test helper | one dropdown', function () {
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

      describe('getOneDropdownTrigger', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns trigger of the first found dropdown when ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              expect(getOneDropdownTrigger(selectorProvider()))
                .to.have.class('trigger1');
            }
          );
        });
      });

      describe('getOneDropdownSelectedOptionText', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns trigger text of the first found dropdown when option is selected and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'selected', ['a', 'b', 'c']);
              await renderOneDropdown();

              expect(getOneDropdownSelectedOptionText(selectorProvider()))
                .to.equal('b');
            }
          );
        });

        it('returns trigger text of the first found dropdown when nothing is selected',
          async function () {
            setDropdownsOption(this, 'selected', ['a', undefined, 'c']);
            await renderOneDropdown();

            expect(getOneDropdownSelectedOptionText('.testing-dropdowns'))
              .to.equal('');
          }
        );

        it('returns trigger text of the first found dropdown when nothing is selected and placeholder is specified',
          async function () {
            setDropdownsOption(this, 'selected', ['a', undefined, 'c']);
            setDropdownsOption(this, 'placeholder', [undefined, 'p', undefined]);
            await renderOneDropdown();

            expect(getOneDropdownSelectedOptionText('.testing-dropdowns'))
              .to.equal('');
          }
        );
      });

      describe('getOneDropdownPlaceholder', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns placeholder text of the first found dropdown when nothing is selected and placeholder is set and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'placeholder', ['o', 'p', 'q']);
              await renderOneDropdown();

              expect(getOneDropdownPlaceholder(selectorProvider()))
                .to.equal('p');
            }
          );
        });

        it('returns empty placeholder text of the first found dropdown when option is selected and placeholder is set',
          async function () {
            setDropdownsOption(this, 'selected', ['a', 'b', 'c']);
            setDropdownsOption(this, 'placeholder', [undefined, 'p', undefined]);
            await renderOneDropdown();

            expect(getOneDropdownPlaceholder('.testing-dropdowns'))
              .to.equal('');
          }
        );

        it('returns empty placeholder text of the first found dropdown when nothing is selected and placeholder is not set',
          async function () {
            await renderOneDropdown();

            expect(getOneDropdownPlaceholder('.testing-dropdowns'))
              .to.equal('');
          }
        );
      });

      describe('isOneDropdownDisabled', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns false when the first found dropdown is not disabled and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'disabled', [true, false, true]);
              await renderOneDropdown();

              expect(isOneDropdownDisabled(selectorProvider()))
                .to.be.false;
            }
          );
        });

        it('returns true when the first found dropdown is disabled',
          async function () {
            setDropdownsOption(this, 'disabled', [false, true, false]);
            await renderOneDropdown();

            expect(isOneDropdownDisabled('.testing-dropdowns'))
              .to.be.true;
          }
        );
      });

      describe('isOneDropdownOpened', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns false when the first found dropdown is closed and ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              expect(isOneDropdownOpened(selectorProvider()))
                .to.be.false;
            }
          );
        });

        it('returns true when the first found dropdown is opened', async function () {
          await renderOneDropdown();
          await clickTrigger('.testing-dropdowns');

          expect(isOneDropdownOpened('.testing-dropdowns')).to.be.true;
        });
      });

      describe('openOneDropdown', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`opens the first found dropdown if it is closed and ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              await openOneDropdown(selectorProvider());

              expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
            }
          );
        });

        it('does nothing when the first found dropdown is opened',
          async function () {
            await renderOneDropdown();
            await clickTrigger('.testing-dropdowns');

            await openOneDropdown('.testing-dropdowns');

            expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
          }
        );
      });

      describe('closeOneDropdown', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`closes the first found dropdown if it is opened and ${selectorKind}`,
            async function () {
              await renderOneDropdown();
              await clickTrigger('.testing-dropdowns');

              await closeOneDropdown(selectorProvider());

              expect(find('.trigger1')).to.not.have.attribute('aria-expanded');
            }
          );
        });

        it('does nothing when the first found dropdown is closed and ${selectorKind}',
          async function () {
            await renderOneDropdown();

            await closeOneDropdown('.testing-dropdowns');

            expect(find('.trigger1')).to.not.have.attribute('aria-expanded');
          }
        );
      });

      describe('getOneDropdownOptionsContainer', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns options container for the first found dropdown when ${selectorKind}`,
            async function () {
              await renderOneDropdown();

              const optionsContainer =
                await getOneDropdownOptionsContainer(selectorProvider());

              expect(optionsContainer).to.have.class('ember-power-select-dropdown');
              expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
            }
          );
        });
      });

      describe('isOneDropdownHavingSearch', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns false when the first found dropdown does not have search input and ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'searchEnabled', [true, false, true]);
              await renderOneDropdown();

              expect(await isOneDropdownHavingSearch(selectorProvider()))
                .to.be.false;
            }
          );
        });

        it('returns true when the first found dropdown has search input',
          async function () {
            setDropdownsOption(this, 'searchEnabled', [false, true, false]);
            await renderOneDropdown();

            expect(await isOneDropdownHavingSearch('.testing-dropdowns'))
              .to.be.true;
          }
        );

        it('lefts the first found dropdown in the open state the same as it was at the beginning',
          async function () {
            await renderOneDropdown();

            await isOneDropdownHavingSearch('.testing-dropdowns');
            expect(find('.trigger1')).to.not.have.attribute('aria-expanded');

            await clickTrigger('.testing-dropdowns');
            await isOneDropdownHavingSearch('.testing-dropdowns');
            expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
          }
        );
      });

      describe('fillInOneDropdownSearch', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`fills in search input in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'searchEnabled', [false, true, false]);
              await renderOneDropdown();

              await fillInOneDropdownSearch(selectorProvider(), 'b');

              expect(find('.ember-power-select-search-input')).to.have.value('b');
              expect(find('.ember-power-select-dropdown')).to.not.contain.text('c');
            }
          );
        });
      });

      describe('getOneDropdownSearchValue', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns search input value of the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'searchEnabled', [false, true, false]);
              await renderOneDropdown();

              await clickTrigger('.testing-dropdowns');
              await fillIn('.ember-power-select-search-input', 'b');

              expect(await getOneDropdownSearchValue(selectorProvider()))
                .to.equal('b');
            }
          );
        });

        it('lefts the first found dropdown in the open state the same as it was at the beginning',
          async function () {
            setDropdownsOption(this, 'searchEnabled', [false, true, false]);
            await renderOneDropdown();

            await getOneDropdownSearchValue('.testing-dropdowns');
            expect(find('.trigger1')).to.not.have.attribute('aria-expanded');

            await clickTrigger('.testing-dropdowns');
            await getOneDropdownSearchValue('.testing-dropdowns');
            expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
          }
        );
      });

      describe('getOneDropdownOptions', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns options of the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                [],
                ['a', 'b'],
                [],
              ]);
              await renderOneDropdown();

              const options = await getOneDropdownOptions(selectorProvider());

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

            const options = await getOneDropdownOptions('.testing-dropdowns');

            expect(options).to.have.length(0);
          }
        );
      });

      describe('getOneDropdownOptionsText', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns options text of the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                [],
                ['a', 'b'],
                [],
              ]);
              await renderOneDropdown();

              expect(await getOneDropdownOptionsText(selectorProvider()))
                .to.deep.equal(['a', 'b']);
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

            expect(await getOneDropdownOptionsText('.testing-dropdowns'))
              .to.have.length(0);
          }
        );

        it('lefts the first found dropdown in the open state the same as it was at the beginning',
          async function () {
            await renderOneDropdown();

            await getOneDropdownOptionsText('.testing-dropdowns');
            expect(find('.trigger1')).to.not.have.attribute('aria-expanded');

            await clickTrigger('.testing-dropdowns');
            await getOneDropdownOptionsText('.testing-dropdowns');
            expect(find('.trigger1')).to.have.attribute('aria-expanded', 'true');
          }
        );
      });

      describe('getOneDropdownOptionByText', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              expect(await getOneDropdownOptionByText(selectorProvider(), 'b'))
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

            expect(await getOneDropdownOptionByText('.testing-dropdowns', 'c'))
              .to.be.null;
          }
        );
      });

      describe('getOneDropdownOptionByIndex', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`returns matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              expect(await getOneDropdownOptionByIndex(selectorProvider(), 1))
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

            expect(await getOneDropdownOptionByIndex('.testing-dropdowns', 2))
              .to.be.null;
          }
        );
      });

      describe('selectOneDropdownOptionByText', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`selects matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              await selectOneDropdownOptionByText(selectorProvider(), 'b');

              expect(this.onChange1).to.have.been.calledWith('abc', sinon.match.any);
            }
          );
        });
      });

      describe('selectOneDropdownOptionByIndex', function () {
        testForAllSelectors((selectorProvider, selectorKind) => {
          it(`selects matching option in the first found dropdown when ${selectorKind}`,
            async function () {
              setDropdownsOption(this, 'options', [
                ['a', 'b'],
                ['abc', 'def'],
                ['a', 'b'],
              ]);
              await renderOneDropdown();

              await selectOneDropdownOptionByIndex(selectorProvider(), 1);

              expect(this.onChange1).to.have.been.calledWith('def', sinon.match.any);
            }
          );
        });
      });
    });
  });

  describe('isOneDropdownOptionDisabled', function () {
    it('returns false when given option is not disabled', async function () {
      setDropdownsOption(this, 'options', [
        [{ disabled: true }],
        [{ disabled: false }, { disabled: true }],
        [{ disabled: true }],
      ]);
      await renderOneDropdown();

      await clickTrigger('.testing-dropdowns');
      const option = find('.ember-power-select-dropdown li');
      expect(isOneDropdownOptionDisabled(option)).to.be.false;
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
      expect(isOneDropdownOptionDisabled(option)).to.be.true;
    });
  });

  describe('selectOneDropdownOption', function () {
    it('selects given option', async function () {
      await renderOneDropdown();
      await clickTrigger('.testing-dropdowns');
      const option = find('.ember-power-select-dropdown li');

      await selectOneDropdownOption(option);

      expect(this.onChange1).to.have.been.calledWith('a');
    });
  });
});

async function renderOneDropdown() {
  await render(hbs`
    {{!-- dropdown "0" to check if helpers will omit dropdown, which is outside
    given element/selector --}}
    {{#one-dropdown
      triggerClass="trigger0"
      renderInPlace=renderInPlace
      onchange=onChange0
      options=options0
      selected=selected0
      placeholder=placeholder0
      disabled=disabled0
      searchEnabled=searchEnabled0
      as |option|
    }}
      {{option}}
    {{/one-dropdown}}
    <div class="testing-dropdowns">
      {{!-- dropdown "1" is the main dropdown to be tested --}}
      {{#one-dropdown
        triggerClass="trigger1"
        renderInPlace=renderInPlace
        onchange=onChange1
        options=options1
        selected=selected1
        placeholder=placeholder1
        disabled=disabled1
        searchEnabled=searchEnabled1
        as |option|
      }}
        {{option}}
      {{/one-dropdown}}
      {{!-- dropdown "2" to check if helpers will take the first found
      dropdown and omit the rest of matching dropdowns --}}
      {{#one-dropdown
        triggerClass="trigger2"
        renderInPlace=renderInPlace
        onchange=onChange2
        options=options2
        selected=selected2
        placeholder=placeholder2
        disabled=disabled2
        searchEnabled=searchEnabled2
        as |option|
      }}
        {{option}}
      {{/one-dropdown}}
    </div>
  `);
}

function testForAllSelectors(testCallback) {
  [{
    selectorProvider: () => find('.testing-dropdowns'),
    selectorKind: 'parent element has been provided',
  }, {
    selectorProvider: () => find('.trigger1'),
    selectorKind: 'trigger element has been provided',
  }, {
    selectorProvider: () => '.testing-dropdowns',
    selectorKind: 'parent element selector has been provided',
  }, {
    selectorProvider: () => '.trigger1',
    selectorKind: 'trigger selector has been provided',
  }].forEach(({ selectorProvider, selectorKind }) =>
    testCallback(selectorProvider, selectorKind)
  );
}

function setDropdownsOption(testCase, name, values) {
  values.forEach((value, index) => testCase.set(`${name}${index}`, value));
}
