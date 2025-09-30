import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';
import OneDropdownHelper from '../../helpers/one-dropdown';
import _ from 'lodash';
import sleep from 'onedata-gui-common/utils/sleep';

describe('Integration | Component | infinite-scroll-dropdown', function () {
  setupRenderingTest();

  it('renders whole small list of items', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = ['one', 'two', 'three', 'four', 'five'];

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    const actualOptions = await dropdown.getOptionsText();

    expect(actualOptions).to.deep.equal(this.helper.renderContext.options);
  });

  it('renders end of long scrollable list after scrolling', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(100).map(String);

    await this.helper.render();

    await this.helper.scrollToBottom();
    const dropdown = this.helper.getDropdownHelper();
    const optionsText = await dropdown.getOptionsText();
    expect(optionsText.at(-1)).to.equal('99');
  });

  it('renders only some number of first items on list without scrolling', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(100).map(String);

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    /** @type {Array<string>} */
    const actualOptions = await dropdown.getOptionsText();

    expect(actualOptions.length).to.be.lessThan(100);
    // check if options are continuous
    for (let i = 0; i < actualOptions.length; ++i) {
      expect(Number(actualOptions[i]) - Number(actualOptions[i - 1] ?? -1)).to.equal(1);
    }
  });

  it('shows selected item in the trigger after select from initial visible list', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = ['one', 'two', 'three', 'four', 'five'];

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    await dropdown.selectOptionByText('three');

    expect(dropdown.getSelectedOptionText()).to.equal('three');
  });

  it('shows selected item in the trigger after select from the loaded part of list', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = _.range(100).map(String);

    await this.helper.render();
    await this.helper.scrollToBottom();

    const dropdown = this.helper.getDropdownHelper();
    await dropdown.selectOptionByText('99');
    expect(dropdown.getSelectedOptionText()).to.equal('99');
  });

  // FIXME: customowy searchField, customowy matcher

  it('filters the long scrollable list if search term is provided', async function () {
    const options = _.range(100).map(String);
    this.helper = new Helper(this);
    this.helper.renderContext.searchEnabled = true;
    this.helper.renderContext.options = options;
    await this.helper.render();

    const dropdown = this.helper.getDropdownHelper();
    await dropdown.fillInSearchInput('1');

    const expectedOptions = options.filter(it => it.includes('1'));
    await this.helper.compareAllOptions(expectedOptions);
  });

  it('shows all options again after search term is cleared using input', async function () {
    const options = _.range(100).map(String);
    this.helper = new Helper(this);
    this.helper.renderContext.searchEnabled = true;
    this.helper.renderContext.options = options;
    await this.helper.render();

    const dropdown = this.helper.getDropdownHelper();
    await dropdown.fillInSearchInput('1');
    await dropdown.fillInSearchInput('');

    await this.helper.compareAllOptions(options);
  });

  it('shows all options again after search term is cleared on close', async function () {
    const options = _.range(100).map(String);
    this.helper = new Helper(this);
    this.helper.renderContext.searchEnabled = true;
    this.helper.renderContext.options = options;
    await this.helper.render();

    const dropdown = this.helper.getDropdownHelper();
    await dropdown.fillInSearchInput('1');
    await dropdown.close();

    await this.helper.compareAllOptions(options);
  });
});

class RenderContext {
  @tracked selected;
  @tracked searchEnabled;
  @tracked options = [];

  onChange(option) {
    this.selected = option;
  }
}

class Helper {
  renderContext = new RenderContext();

  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
    this.mochaContext.renderContext = this.renderContext;
  }

  getDropdownHelper() {
    if (!this.mochaContext.element) {
      throw new Error('element is not rendered');
    }
    if (!this.dropdownHelper) {
      this.dropdownHelper = new OneDropdownHelper(this.mochaContext.element);
    }
    return this.dropdownHelper;
  }

  /** @type {HTMLUListElement} */
  async getOptionsContainer() {
    const dropdown = this.getDropdownHelper();
    return (await dropdown.getOptionsContainer()).querySelector('ul');
  }

  async scrollDown() {
    (await this.getOptionsContainer()).scrollBy({ top: 1000 });
  }

  async scrollToBottom() {
    const optionsContainer = await this.getOptionsContainer();
    let lastScrollTop;
    while (lastScrollTop !== optionsContainer.scrollTop) {
      lastScrollTop = optionsContainer.scrollTop;
      await this.scrollDown();
      await sleep(100);
    }
  }

  /**
   * @param {Array<string>} expectedOptions
   */
  async compareAllOptions(expectedOptions) {
    const dropdown = this.getDropdownHelper();
    let actualOptions = await dropdown.getOptionsText();
    for (let i = 0; i < expectedOptions.length; ++i) {
      if (actualOptions[i] === undefined) {
        await this.scrollDown();
        await sleep(100);
        actualOptions.push(...await dropdown.getOptionsText());
        actualOptions = _.uniq(actualOptions);
      }
      expect(actualOptions[i]).to.equal(expectedOptions[i]);
    }
  }

  async render() {
    await render(hbs`
      <InfiniteScrollDropdown
        @renderInPlace={{true}}
        @searchEnabled={{this.renderContext.searchEnabled}}
        @options={{this.renderContext.options}}
        @selected={{this.renderContext.selected}}
        @onChange={{this.renderContext.onChange}}
        as |option|
      >
        {{option}}
      </InfiniteScrollDropdown>
    `);
  }
}
