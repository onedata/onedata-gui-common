import { find, click, fillIn } from '@ember/test-helpers';
import { findInElementsByText } from './find';

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {HTMLDivElement|null}
 */
export function getOneDropdownTrigger(elementOrSelector) {
  let element;
  if (typeof elementOrSelector === 'string') {
    element = find(elementOrSelector);
  } else {
    element = elementOrSelector;
  }

  return element.matches('.ember-power-select-trigger') ?
    element : element.querySelector('.ember-power-select-trigger');
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {string}
 */
export function getOneDropdownSelectedOptionText(elementOrSelector) {
  const trigger = getOneDropdownTrigger(elementOrSelector);
  return trigger.querySelector('.ember-power-select-selected-item')
    ?.textContent?.trim() ?? '';
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {string}
 */
export function getOneDropdownPlaceholder(elementOrSelector) {
  const trigger = getOneDropdownTrigger(elementOrSelector);
  return trigger.querySelector('.ember-power-select-placeholder')
    ?.textContent?.trim() ?? '';
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {boolean}
 */
export function isOneDropdownDisabled(elementOrSelector) {
  const trigger = getOneDropdownTrigger(elementOrSelector);
  return trigger.getAttribute('aria-disabled') === 'true';
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<HTMLDivElement>}
 */
export async function getOneDropdownOptionsContainer(elementOrSelector) {
  await openOneDropdown(elementOrSelector);

  const trigger = getOneDropdownTrigger(elementOrSelector);
  const containerId = trigger.getAttribute('aria-owns');
  return find(`#${containerId}`) ?? null;
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<boolean>}
 */
export async function isOneDropdownHavingSearch(elementOrSelector) {
  return await preserveOneDropdownOpenState(elementOrSelector, async () => {
    await openOneDropdown(elementOrSelector);
    const optionsContainer = await getOneDropdownOptionsContainer(elementOrSelector);
    return Boolean(
      optionsContainer.querySelector('.ember-power-select-search-input')
    );
  });
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @param {string} searchText
 * @returns {Promise<void>}
 */
export async function fillInOneDropdownSearch(elementOrSelector, searchText) {
  await openOneDropdown(elementOrSelector);
  const optionsContainer = await getOneDropdownOptionsContainer(elementOrSelector);
  const searchInput = optionsContainer.querySelector('.ember-power-select-search-input');
  await fillIn(searchInput, searchText);
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<string>}
 */
export async function getOneDropdownSearchValue(elementOrSelector) {
  return await preserveOneDropdownOpenState(elementOrSelector, async () => {
    await openOneDropdown(elementOrSelector);
    const optionsContainer = await getOneDropdownOptionsContainer(elementOrSelector);
    return optionsContainer
      .querySelector('.ember-power-select-search-input').value;
  });
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<void>}
 */
export async function openOneDropdown(elementOrSelector) {
  if (!isOneDropdownOpened(elementOrSelector)) {
    await click(getOneDropdownTrigger(elementOrSelector));
  }
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<void>}
 */
export async function closeOneDropdown(elementOrSelector) {
  if (isOneDropdownOpened(elementOrSelector)) {
    await click(getOneDropdownTrigger(elementOrSelector));
  }
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {boolean}
 */
export function isOneDropdownOpened(elementOrSelector) {
  const trigger = getOneDropdownTrigger(elementOrSelector);
  return trigger.getAttribute('aria-expanded') === 'true';
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<Array<HTMLLIElement>>}
 */
export async function getOneDropdownOptions(elementOrSelector) {
  const optionsContainer = await getOneDropdownOptionsContainer(elementOrSelector);
  return [...optionsContainer.querySelectorAll('li[aria-selected]')];
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @returns {Promise<Array<string>>}
 */
export async function getOneDropdownOptionsText(elementOrSelector) {
  return await preserveOneDropdownOpenState(elementOrSelector, async () => {
    const options = await getOneDropdownOptions(elementOrSelector);
    return options.map((option) => option.textContent.trim());
  });
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @param {string} text Option text to search by. Might be a partial option text
 * @returns {Promise<HTMLLIElement|null>}
 */
export async function getOneDropdownOptionByText(elementOrSelector, text) {
  const options = await getOneDropdownOptions(elementOrSelector);
  return findInElementsByText(options, text) ?? null;
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @param {number} index Option index starting from 0
 * @returns {Promise<HTMLLIElement|null>}
 */
export async function getOneDropdownOptionByIndex(elementOrSelector, index) {
  const options = await getOneDropdownOptions(elementOrSelector);
  return options[index] ?? null;
}

/**
 * @param {HTMLLIElement} optionElement
 * @returns {Promise<boolean>}
 */
export function isOneDropdownOptionDisabled(optionElement) {
  return optionElement.getAttribute('aria-disabled') === 'true';
}

/**
 * @param {HTMLLIElement} optionElement
 * @returns {Promise<void>}
 */
export async function selectOneDropdownOption(optionElement) {
  await click(optionElement);
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @param {string} text Option text to search by. Might be a partial option text
 * @returns {Promise<void>}
 */
export async function selectOneDropdownOptionByText(elementOrSelector, text) {
  const option = await getOneDropdownOptionByText(elementOrSelector, text);
  await selectOneDropdownOption(option);
}

/**
 * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
 * @param {number} index Option index starting from 0
 * @returns {Promise<void>}
 */
export async function selectOneDropdownOptionByIndex(elementOrSelector, index) {
  const option = await getOneDropdownOptionByIndex(elementOrSelector, index);
  await selectOneDropdownOption(option);
}

export default class OneDrodopdownHelper {
  /**
   * @public
   * @param {HTMLElement|string} elementOrSelector Dropdown or it's parent element/selector
   */
  constructor(elementOrSelector) {
    this.elementOrSelector = elementOrSelector;
  }

  /**
   * @public
   * @returns {HTMLDivElement|null}
   */
  getTrigger() {
    return getOneDropdownTrigger(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {string}
   */
  getSelectedOptionText() {
    return getOneDropdownSelectedOptionText(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {string}
   */
  getPlaceholder() {
    return getOneDropdownPlaceholder(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {boolean}
   */
  isDisabled() {
    return isOneDropdownDisabled(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {Promise<HTMLDivElement>}
   */
  getOptionsContainer() {
    return getOneDropdownOptionsContainer(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {Promise<boolean>}
   */
  async isHavingSearch() {
    return isOneDropdownHavingSearch(this.elementOrSelector);
  }

  /**
   * @public
   * @param {string} searchText
   * @returns {Promise<void>}
   */
  async fillInSearch(searchText) {
    await fillInOneDropdownSearch(this.elementOrSelector, searchText);
  }

  /**
   * @public
   * @returns {Promise<string>}
   */
  async getSearchValue() {
    return getOneDropdownSearchValue(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {Promise<void>}
   */
  async open() {
    await openOneDropdown(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {Promise<void>}
   */
  async close() {
    await closeOneDropdown(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {boolean}
   */
  isOpened() {
    return isOneDropdownOpened(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {Promise<Array<HTMLLIElement>>}
   */
  async getOptions() {
    return getOneDropdownOptions(this.elementOrSelector);
  }

  /**
   * @public
   * @returns {Promise<Array<string>>}
   */
  async getOptionsText() {
    return getOneDropdownOptionsText(this.elementOrSelector);
  }

  /**
   * @public
   * @param {string} text Option text to search by. Might be a partial option text
   * @returns {Promise<HTMLLIElement|null>}
   */
  async getOptionByText(text) {
    return getOneDropdownOptionByText(this.elementOrSelector, text);
  }

  /**
   * @public
   * @param {number} index Option index starting from 0
   * @returns {Promise<HTMLLIElement|null>}
   */
  async getOptionByIndex(index) {
    return getOneDropdownOptionByIndex(this.elementOrSelector, index);
  }

  /**
   * @public
   * @param {HTMLLIElement} optionElement
   * @returns {Promise<boolean>}
   */
  isOptionDisabled(optionElement) {
    return isOneDropdownOptionDisabled(optionElement);
  }

  /**
   * @public
   * @param {HTMLLIElement} optionElement
   * @returns {Promise<void>}
   */
  async selectOption(optionElement) {
    await selectOneDropdownOption(optionElement);
  }

  /**
   * @public
   * @param {string} text Option text to search by. Might be a partial option text
   * @returns {Promise<void>}
   */
  async selectOptionByText(text) {
    await selectOneDropdownOptionByText(this.elementOrSelector, text);
  }

  /**
   * @public
   * @param {number} index Option index starting from 0
   * @returns {Promise<void>}
   */
  async selectOptionByIndex(index) {
    await selectOneDropdownOptionByIndex(this.elementOrSelector, index);
  }
}

/**
 * Evaluates given `dropdownAction` taking care of preserving the same
 * state of dropdown "openess" before and after execution.
 * @param {string} elementOrSelector Dropdown or it's parent element/selector
 * @param {() => Promise<unknown>} dropdownAction
 * @returns {unknown} value from `dropdownAction` promise
 */
async function preserveOneDropdownOpenState(elementOrSelector, dropdownAction) {
  const wasOpened = isOneDropdownOpened(elementOrSelector);

  const actionResult = await dropdownAction();

  if (wasOpened) {
    await openOneDropdown(elementOrSelector);
  } else {
    await closeOneDropdown(elementOrSelector);
  }

  return actionResult;
}
