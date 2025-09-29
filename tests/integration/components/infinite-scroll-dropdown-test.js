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
});

class RenderContext {
  @tracked
  selected;

  @tracked
  options = [];

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
    return new OneDropdownHelper(this.mochaContext.element);
  }

  async scrollToBottom() {
    const dropdown = this.getDropdownHelper();
    /** @type {HTMLUListElement} */
    const optionsContainer = (await dropdown.getOptionsContainer()).querySelector('ul');
    let lastScrollTop;
    while (lastScrollTop !== optionsContainer.scrollTop) {
      lastScrollTop = optionsContainer.scrollTop;
      optionsContainer.scrollBy({ top: 1000 });
      await sleep(100);
    }
  }

  async render() {
    await render(hbs`
      <InfiniteScrollDropdown
        @renderInPlace={{true}}
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
