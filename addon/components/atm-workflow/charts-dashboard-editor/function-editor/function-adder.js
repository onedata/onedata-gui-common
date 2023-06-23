import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor/function-adder';
import {
  functions as functionDefs,
  getFunctionNameTranslation,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

export default Component.extend(I18n, {
  layout,
  classNames: ['function-adder'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.functionEditor.functionAdder',

  /**
   * @virtual
   * @type {Array<FunctionDataType>}
   */
  allowedReturnTypes: undefined,

  /**
   * @virtual
   * @type {FunctionExecutionContext}
   */
  executionContext: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase}
   */
  parentFunction: undefined,

  /**
   * @virtual
   * @type {string}
   */
  parentFunctionArgumentName: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

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
    function functions() {
      const functionsArray = Object.values(functionDefs)
        .filter((funcDef) =>
          !funcDef.isNotAvailableForUser &&
          (funcDef.allowedContexts?.includes(this.executionContext) ?? true) &&
          _.intersection(
            funcDef.returnedTypes,
            this.parentFunctionArgumentSpec?.compatibleTypes ?? []
          ).length
        )
        .map((funcDef) => ({
          ...funcDef,
          translatedName: String(getFunctionNameTranslation(this.i18n, funcDef.name)),
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
      const action = this.actionsFactory.createAddFunctionAction({
        newFunctionName,
        targetFunction: this.parentFunction,
        targetArgumentName: this.parentFunctionArgumentName,
      });
      action.execute();
    },
  },
});
