import { find, click, fillIn } from '@ember/test-helpers';
import { findInElementsByText } from './find';

export default class OneDropdownHelper {
  /**
   * @public
   * @param {HTMLElement|string} elementOrSelector Dropdown's trigger or it's parent
   * element/selector
   */
  constructor(elementOrSelector) {
    this.elementOrSelector = elementOrSelector;
  }

  /**
   * @public
   * @returns {HTMLDivElement|null}
   */
  getTrigger() {
    let element;
    if (typeof this.elementOrSelector === 'string') {
      element = find(this.elementOrSelector);
    } else {
      element = this.elementOrSelector;
    }

    return element.matches('.ember-power-select-trigger') ?
      element : element.querySelector('.ember-power-select-trigger');
  }

  /**
   * @public
   * @returns {string|null}
   */
  getSelectedOptionText() {
    const trigger = this.getTrigger();
    return trigger.querySelector('.ember-power-select-selected-item')
      ?.textContent?.trim() ?? null;
  }

  /**
   * @public
   * @returns {string|null}
   */
  getPlaceholder() {
    const trigger = this.getTrigger();
    return trigger.querySelector('.ember-power-select-placeholder')
      ?.textContent?.trim() ?? null;
  }

  /**
   * @public
   * @returns {boolean}
   */
  isDisabled() {
    const trigger = this.getTrigger();
    return trigger.getAttribute('aria-disabled') === 'true';
  }

  /**
   * @public
   * @returns {Promise<HTMLDivElement>}
   */
  async getOptionsContainer() {
    await this.open();
    const trigger = this.getTrigger();
    const containerId = trigger.getAttribute('aria-owns');
    return find(`#${containerId}`) ?? null;
  }

  /**
   * @public
   * @returns {Promise<HTMLInputElement|null>}
   */
  async getSearchInput() {
    await this.open();
    const optionsContainer = await this.getOptionsContainer();
    return optionsContainer.querySelector('.ember-power-select-search-input');
  }

  /**
   * @public
   * @param {string} searchText
   * @returns {Promise<void>}
   */
  async fillInSearchInput(searchText) {
    await fillIn(await this.getSearchInput(), searchText);
  }

  /**
   * @public
   * @returns {Promise<void>}
   */
  async open() {
    if (!this.isOpened()) {
      await click(this.getTrigger());
    }
  }

  /**
   * @public
   * @returns {Promise<void>}
   */
  async close() {
    if (this.isOpened()) {
      await click(this.getTrigger());
    }
  }

  /**
   * @public
   * @returns {boolean}
   */
  isOpened() {
    const trigger = this.getTrigger();
    return trigger.getAttribute('aria-expanded') === 'true';
  }

  /**
   * @public
   * @returns {Promise<Array<HTMLLIElement>>}
   */
  async getOptions() {
    const optionsContainer = await this.getOptionsContainer();
    return [...optionsContainer.querySelectorAll('li[aria-selected]')];
  }

  /**
   * @public
   * @returns {Promise<Array<string>>}
   */
  async getOptionsText() {
    return await this.preserveOpenState(async () => {
      const options = await this.getOptions();
      return options.map((option) => option.textContent.trim());
    });
  }

  /**
   * @public
   * @param {string} text Option text to search by. Might be a partial
   * option text
   * @returns {Promise<HTMLLIElement|null>}
   */
  async getOptionByText(text) {
    const options = await this.getOptions();
    return findInElementsByText(options, text) ?? null;
  }

  /**
   * @public
   * @param {number} index Option index starting from 0
   * @returns {Promise<HTMLLIElement|null>}
   */
  async getOptionByIndex(index) {
    const options = await this.getOptions();
    return options[index] ?? null;
  }

  /**
   * @public
   * @param {HTMLLIElement} optionElement
   * @returns {Promise<boolean>}
   */
  isOptionDisabled(optionElement) {
    return optionElement.getAttribute('aria-disabled') === 'true';
  }

  /**
   * @public
   * @param {HTMLLIElement} optionElement
   * @returns {Promise<void>}
   */
  async selectOption(optionElement) {
    await click(optionElement);
  }

  /**
   * @public
   * @param {string} text Option text to search by. Might be a partial
   * option text
   * @returns {Promise<void>}
   */
  async selectOptionByText(text) {
    const option = await this.getOptionByText(text);
    await this.selectOption(option);
  }

  /**
   * @public
   * @param {number} index Option index starting from 0
   * @returns {Promise<void>}
   */
  async selectOptionByIndex(index) {
    const option = await this.getOptionByIndex(index);
    await this.selectOption(option);
  }

  /**
   * Evaluates given `dropdownAction` taking care of preserving the same
   * state of dropdown "openess" before and after execution.
   * @private
   * @param {() => Promise<unknown>} dropdownAction
   * @returns {unknown} value from `dropdownAction` promise
   */
  async preserveOpenState(dropdownAction) {
    const wasOpened = this.isOpened();

    const actionResult = await dropdownAction();

    if (wasOpened) {
      await this.open();
    } else {
      await this.close();
    }

    return actionResult;
  }
}
