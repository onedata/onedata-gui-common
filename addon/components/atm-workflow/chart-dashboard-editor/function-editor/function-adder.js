/**
 * A component responsible for function creation. Which function can be
 * created is determined by execution context and parent function target argument
 * (place where new function is going to be attached).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/function-editor/function-adder';
import {
  functions as functionDefs,
  getFunctionNameTranslation,
  getFunctionTipTranslation,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.functionEditor.functionAdder',

  /**
   * @virtual
   * @type {FunctionExecutionContext}
   */
  executionContext: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.FunctionBase}
   */
  parentFunction: undefined,

  /**
   * @virtual
   * @type {string}
   */
  parentFunctionArgumentName: undefined,

  /**
   * @virtual
   * @type {number}
   */
  insertAtIndex: undefined,

  /**
   * Function that will be automatically attached to the newly created function.
   * Useful when implementing "add function in the middle" feature.
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.FunctionBase | null}
   */
  functionToAttach: null,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @virtual
   * @type {string}
   */
  triggerSelector: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isOpened: false,

  /**
   * @virtual
   * @type {() => void}
   */
  onClose: undefined,

  /**
   * @type {string}
   */
  filterString: '',

  /**
   * @virtual
   * @type {ComputedProperty<FunctionAttachableArgumentSpec | null>}
   */
  parentFunctionArgumentSpec: computed(
    'parentFunction',
    'parentFunctionArgumentName',
    function parentFunctionArgumentSpec() {
      return this.parentFunction.attachableArgumentSpecs.find(({ name }) =>
        name === this.parentFunctionArgumentName
      ) ?? null;
    }
  ),

  /**
   * @type {ComputedProperty<Array<FunctionSpec & { translatedName: string }>>}
   */
  functions: computed(
    'executionContext',
    'parentFunctionArgumentSpec',
    'functionToAttach',
    function functions() {
      const functionsArray = Object.values(functionDefs)
        .filter((funcDef) =>
          !funcDef.isNotAvailableForUser &&
          (funcDef.allowedContexts?.includes(this.executionContext) ?? true) &&
          _.intersection(
            funcDef.returnedTypes,
            this.parentFunctionArgumentSpec?.compatibleTypes ?? []
          ).length &&
          (!this.functionToAttach || funcDef.attachableArgumentSpecs.length > 0)
        )
        .map((funcDef) => ({
          ...funcDef,
          translatedName: String(getFunctionNameTranslation(this.i18n, funcDef.name)),
          tip: getFunctionTipTranslation(this.i18n, funcDef.name),
        }));
      return functionsArray.sort((a, b) =>
        a.translatedName.localeCompare(b.translatedName)
      );
    }
  ),

  /**
   * @type {ComputedProperty<Array<FunctionSpec & { translatedName: string }>>}
   */
  filteredFunctions: computed(
    'functions',
    'filterString',
    function filteredFunctions() {
      return this.functions.filter(({ translatedName }) =>
        translatedName.toLowerCase().includes(this.filterString.trim().toLowerCase())
      );
    }
  ),

  actions: {
    addFunction(newFunctionName) {
      const action = this.editorContext.actionsFactory.createAddFunctionAction({
        newFunctionName,
        targetFunction: this.parentFunction,
        targetArgumentName: this.parentFunctionArgumentName,
        insertAtIndex: this.insertAtIndex,
        functionToAttach: this.functionToAttach,
      });
      action.execute();
      this.onClose?.();
    },
  },
});
