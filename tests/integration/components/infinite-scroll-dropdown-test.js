import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';
import OneDropdownHelper from '../../helpers/one-dropdown';
import _ from 'lodash';
import sleep from 'onedata-gui-common/utils/sleep';
import { action } from '@ember/object';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

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

  it('item selected onChange is an object from options array', async function () {
    this.helper = new Helper(this);
    const i0 = { val: 0 };
    const i1 = { val: 1 };
    const i2 = { val: 2 };
    this.helper.renderContext.options = [i0, i1, i2];

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    await dropdown.selectOptionByIndex(1);

    expect(this.helper.renderContext.selected).to.equal(i1);
  });

  it('updates list when changing @options', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = ['a', 'b', 'c'];

    await this.helper.render();
    this.helper.renderContext.options = ['d', 'e', 'f'];
    await waitForRender();

    const dropdown = this.helper.getDropdownHelper();
    expect(await dropdown.getOptionsText()).to.deep.equal(['d', 'e', 'f']);
  });

  it('preserves selected item when changing @options and item is still present', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = ['a', 'b', 'c'];

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    await dropdown.selectOptionByText('a');
    this.helper.renderContext.options = ['d', 'a', 'e', 'f'];
    await waitForRender();

    expect(dropdown.getSelectedOptionText()).to.equal('a');
  });

  it('does not preserve selected item when changing @options and item is not present', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.options = ['a', 'b', 'c'];

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    await dropdown.selectOptionByText('a');
    this.helper.renderContext.options = ['d', 'e', 'f'];
    await waitForRender();

    expect(dropdown.getSelectedOptionText()).to.equal(null);
  });

  it('shows no results for filtering complex options without custom search matcher or searchField',
    async function () {
      const options = _.range(100).map(i => new ObjectOption(i, String(i * 2)));
      this.helper = new Helper(this);
      this.helper.renderContext.searchEnabled = true;
      this.helper.renderContext.options = options;
      await this.helper.renderObjectOptions();

      const dropdown = this.helper.getDropdownHelper();
      await dropdown.fillInSearchInput('2');

      expect((await dropdown.getOptions()).length).to.equal(0);
    }
  );

  it('filters the long scrollable list using provided matcher', async function () {
    const options = _.range(100).map(i => new ObjectOption(i, String(i * 2)));
    this.helper = new Helper(this);
    this.helper.renderContext.searchEnabled = true;
    this.helper.renderContext.options = options;
    this.helper.renderContext.matcher = (option, searchTerm) => {
      return option.value.indexOf(searchTerm);
    };
    await this.helper.renderObjectOptions();

    const dropdown = this.helper.getDropdownHelper();
    await dropdown.fillInSearchInput('2');

    const expectedOptions = options
      .filter(option => option.value.includes('2'))
      .map(option => option.label);

    await this.helper.compareAllOptions(expectedOptions);
  });

  it('filters the long scrollable list using provided searchField', async function () {
    const options = _.range(100).map(i => new ObjectOption(i, String(i * 2)));
    this.helper = new Helper(this);
    this.helper.renderContext.searchEnabled = true;
    this.helper.renderContext.options = options;
    this.helper.renderContext.searchField = 'value';
    await this.helper.renderObjectOptions();

    const dropdown = this.helper.getDropdownHelper();
    await dropdown.fillInSearchInput('2');

    const expectedOptions = options
      .filter(option => option.value.includes('2'))
      .map(option => option.label);

    await this.helper.compareAllOptions(expectedOptions);
  });

  it('shows selected item in the trigger when current filtered list does not include it', async function () {
    this.helper = new Helper(this);
    this.helper.renderContext.searchEnabled = true;
    this.helper.renderContext.options = ['a', 'b', 'c'];

    await this.helper.render();
    const dropdown = this.helper.getDropdownHelper();
    await dropdown.selectOptionByText('a');
    await dropdown.fillInSearchInput('b');

    expect(dropdown.getSelectedOptionText()).to.equal('a');
  });
});

class RenderContext {
  @tracked selected;
  @tracked searchEnabled;
  @tracked options = [];
  @tracked matcher;

  @action
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
    this.infiniteToolbox = new InfiniteScrollDropdownTestToolbox(mochaContext);
  }

  getDropdownHelper() {
    return this.infiniteToolbox.getDropdownHelper(...arguments);
  }

  getOptionsContainer() {
    return this.infiniteToolbox.getOptionsContainer(...arguments);
  }

  scrollDown() {
    return this.infiniteToolbox.scrollDown(...arguments);
  }

  scrollToBottom() {
    return this.infiniteToolbox.scrollToBottom(...arguments);
  }

  compareAllOptions() {
    return this.infiniteToolbox.compareAllOptions(...arguments);
  }

  async render() {
    await render(hbs`
      <InfiniteScrollDropdown
        @renderInPlace={{true}}
        @searchEnabled={{this.renderContext.searchEnabled}}
        @options={{this.renderContext.options}}
        @selected={{this.renderContext.selected}}
        @matcher={{this.renderContext.matcher}}
        @searchField={{this.renderContext.searchField}}
        @onChange={{this.renderContext.onChange}}
        as |option|
      >
        {{option}}
      </InfiniteScrollDropdown>
    `);
  }

  async renderObjectOptions() {
    await render(hbs`
      <InfiniteScrollDropdown
        @renderInPlace={{true}}
        @searchEnabled={{this.renderContext.searchEnabled}}
        @options={{this.renderContext.options}}
        @selected={{this.renderContext.selected}}
        @matcher={{this.renderContext.matcher}}
        @searchField={{this.renderContext.searchField}}
        @onChange={{this.renderContext.onChange}}
        as |option|
      >
        {{option.label}}
      </InfiniteScrollDropdown>
    `);
  }
}

class ObjectOption {
  constructor(label, value) {
    this.label = String(label);
    this.value = value;
  }
}

export class InfiniteScrollDropdownTestToolbox {
  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    this.mochaContext = mochaContext;
  }

  initDropdownHelper() {
    this.dropdownHelper = new OneDropdownHelper(this.mochaContext.element);
  }

  getDropdownHelper() {
    if (!this.mochaContext.element) {
      throw new Error('element is not rendered');
    }
    if (!this.dropdownHelper) {
      this.initDropdownHelper();
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
}
