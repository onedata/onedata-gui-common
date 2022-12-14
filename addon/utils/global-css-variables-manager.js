/**
 * Allows to assign CSS variables to body. Each variable has it's owners, so
 * the variable is present as long as at least one owner is still using it.
 *
 * `GlobalCssVariablesManager` is intended to be a singleton (as there is only
 * one `body` tag). You should use the already created instance exported from
 * this module.
 *
 * WARNING: value of an already defined variable can be changed only by it's
 * owner and only when it has exactly one owner. Otherwise value conflict will
 * appear and exception will be thrown.
 *
 * Example of usage:
 * ```
 * import globalCssVariablesManager from 'onedata-gui-common/utils/global-css-variables-manager';
 *
 * const modalAnimationTime = 0.3;
 * globalCssVariablesManager.setVariable(
 *   'one-modal',  // variable owner
 *   '--one-modal-animation-time',  // variable name (it must start with `--`)
 *   `${modalAnimationTime}s`  // variable value (it is always a string)
 * );
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';

/**
 * @typedef {unknown} CSSVariableOwner It's an entity which asked manager to
 * set specific CSS variable. Each set variable has a list of associated owners.
 * When that list becomes empty, variable is removed.
 */

/**
 * @typedef {`--${string}`} CSSVariableName CSS variable name including
 * `--` prefix.
 */

/**
 * @typedef {string} CSSVariableValue
 */

export class GlobalCssVariablesManager {
  /**
   * @public
   */
  constructor() {
    /**
     * Contains all variables set by each owner.
     * @private
     * @type {Map<CSSVariableOwner, Set<CSSVariableName>>}
     */
    this.variablesPerOwner = new Map();

    /**
     * Contains values and all owners associated to each variable.
     * @private
     * @type {Map<CSSVariableName, { owners: Set<CSSVariableOwner>, value: CSSVariableValue }>}
     */
    this.variablesData = new Map();

    /**
     * A style element where CSS variables will be defined.
     * @private
     * @type {HTMLStyleElement}
     */
    this.styleElement = this.createStyleElement();
  }

  /**
   * Gets CSS variable value. If it's not set, `null` is returned;
   * @public
   * @param {CSSVariableName} variableName
   * @returns {CSSVariableValue|null}
   */
  getVariable(variableName) {
    return this.variablesData.get(variableName)?.value ?? null;
  }

  /**
   * Sets CSS variable to the specified value. If variable was already set with
   * different value by another owner, exception will by thrown (only
   * in non-production environments).
   * @public
   * @param {CSSVariableOwner} variableOwner
   * @param {CSSVariableName} variableName
   * @param {CSSVariableValue} variableValue
   * @returns {CSSVariableValue}
   */
  setVariable(variableOwner, variableName, variableValue) {
    const currentValue = this.getVariable(variableName);
    const variableOwners = this.variablesData.get(variableName)?.owners;
    if (
      variableOwners &&
      (variableOwners.size > 1 || !variableOwners.has(variableOwner)) &&
      currentValue !== variableValue
    ) {
      const errorMessage =
        `Cannot change value of CSS variable set by another owner. New value: ${variableValue}, current value: ${currentValue}.`;
      if (config.environment !== 'production') {
        throw new Error(errorMessage);
      } else {
        console.error(errorMessage);
        return currentValue;
      }
    }

    if (!this.variablesPerOwner.has(variableOwner)) {
      this.variablesPerOwner.set(variableOwner, new Set());
    }
    this.variablesPerOwner.get(variableOwner).add(variableName);

    if (!this.variablesData.has(variableName)) {
      this.variablesData.set(variableName, {
        owners: new Set([variableOwner]),
        value: variableValue,
      });
    } else {
      const variableData = this.variablesData.get(variableName);
      variableData.owners.add(variableOwner);
      variableData.value = variableValue;
    }

    if (currentValue !== variableValue) {
      this.recalculateStyleSheet();
    }

    return variableValue;
  }

  /**
   * Removes CSS variable association to the specific owner. If variable
   * has only one owner, it is removed.
   * @public
   * @param {CSSVariableOwner} variableOwner
   * @param {CSSVariableName} variableName
   * @returns {void}
   */
  unsetVariable(variableOwner, variableName) {
    const ownerVariables = this.variablesPerOwner.get(variableOwner);
    if (!ownerVariables?.has(variableName)) {
      return;
    }

    ownerVariables.delete(variableName);
    if (ownerVariables.size === 0) {
      this.variablesPerOwner.delete(variableOwner);
    }

    const variableOwners = this.variablesData.get(variableName)?.owners;
    if (!variableOwners) {
      return;
    }
    variableOwners.delete(variableOwner);
    if (variableOwners.size === 0) {
      this.variablesData.delete(variableName);
      this.recalculateStyleSheet();
    }
  }

  /**
   * Removes all CSS variable associations of the specific owner. If some of
   * owner's variables have only one owner, then these are removed.
   * @public
   * @param {CSSVariableOwner} variableOwner
   * @returns {void}
   */
  unsetOwnerVariables(variablesOwner) {
    const ownerVariables = this.variablesPerOwner.get(variablesOwner);
    if (!ownerVariables) {
      return;
    }

    ownerVariables.forEach((variableName) =>
      this.unsetVariable(variablesOwner, variableName)
    );
  }

  /**
   * This class is meant to be a singleton, but for testing purposes it is
   * necessary to allow it's destruction and recreation.
   * @public
   * @returns {void}
   */
  destroy() {
    this.variablesPerOwner.clear();
    this.variablesData.clear();
    this.styleElement.remove();
    this.styleElement = null;
  }

  /**
   * Creates a `style` element which will be used to define CSS variables.
   * @private
   * @returns {HTMLStyleElement}
   */
  createStyleElement() {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return style;
  }

  /**
   * Removes existing definitions of CSS variables from `style` element and
   * creates new ones based on the current state of the manager.
   * @private
   * @returns {void}
   */
  recalculateStyleSheet() {
    const cssRuleEntries = [];
    [...this.variablesData.entries()].forEach(([variableName, { value }]) => {
      cssRuleEntries.push(`${variableName}:${value};`);
    });
    const cssRule = `body { ${cssRuleEntries.join('')} }`;
    while (this.styleElement.sheet.cssRules.length) {
      this.styleElement.sheet.deleteRule(0);
    }
    this.styleElement.sheet.insertRule(cssRule);
  }
}

/**
 * @type {GlobalCssVariablesManager}
 */
const managerInstance = new GlobalCssVariablesManager();

export default managerInstance;
