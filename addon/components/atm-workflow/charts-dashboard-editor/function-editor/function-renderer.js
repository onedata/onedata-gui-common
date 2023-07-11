/**
 * Renders chart function - main block, argument blocks and lines between them.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { set, computed, observer, defineProperty } from '@ember/object';
import { inject as service } from '@ember/service';
import { dasherize } from '@ember/string';
import {
  getFunctionNameTranslation,
  getFunctionArgumentNameTranslation,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import dom from 'onedata-gui-common/utils/dom';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor/function-renderer';

/**
 * @typedef {Object} FunctionRendererArgument
 * @property {string} readableName
 * @property {string} name
 * @property {Array<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase>} attachedFunctions
 * @property {boolean} isArray
 */

export default Component.extend({
  layout,
  classNames: ['function-renderer'],
  classNameBindings: ['chartFunction.isRoot:root-function'],
  attributeBindings: ['chartFunction.id:data-function-id'],

  i18n: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase}
   */
  chartFunction: undefined,

  /**
   * @virtual
   * @type {FunctionExecutionContext}
   */
  executionContext: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<Array<FunctionRendererArgument>>}
   */
  functionArguments: undefined,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  readableName: computed('chartFunction.name', function readableName() {
    return getFunctionNameTranslation(this.i18n, this.chartFunction.name);
  }),

  /**
   * @type {ComputedProperty<string | null>}
   */
  settingsComponentName: computed(
    'chartFunction.{name.hasSettingsComponent}',
    function settingsComponentName() {
      if (!this.chartFunction.hasSettingsComponent) {
        return null;
      }

      return `atm-workflow/charts-dashboard-editor/function-editor/${dasherize(this.chartFunction.name)}-settings`;
    }
  ),

  functionArgumentsSetter: observer(
    'chartFunction.attachableArgumentSpecs',
    function functionArgumentsSetter() {
      const propertiesToObserve = this.chartFunction.attachableArgumentSpecs
        .map(({ name }) => name);
      const computedObservedProps = propertiesToObserve.length ? [
        `chartFunction.{${propertiesToObserve.join(',')}}`,
      ] : [];

      defineProperty(
        this,
        'functionArguments',
        computed(...computedObservedProps, function functionArguments() {
          return this.chartFunction.attachableArgumentSpecs.map((argSpec) => {
            let attachedFunctions = this.chartFunction[argSpec.name];
            if (!argSpec.isArray) {
              attachedFunctions = attachedFunctions ? [attachedFunctions] : [];
            }
            return {
              readableName: getFunctionArgumentNameTranslation(
                this.i18n,
                this.chartFunction.name,
                argSpec.name
              ),
              name: argSpec.name,
              attachedFunctions,
              isArray: argSpec.isArray,
            };
          });
        })
      );
      this.functionArguments;
    }
  ),

  detachDetector: observer('chartFunction.parent', function detachDetector() {
    if (!this.element) {
      return;
    }
    const isDetachedInDom =
      this.element.parentElement.matches('.detached-functions-container');
    const isDetached =
      this.chartFunction.parent?.detachedFunctions?.includes(this.chartFunction);
    const rootFunctionBlock = this.element.closest('.function-editor')
      ?.querySelector('.root-function > .function-block');
    const functionBlock = this.element.querySelector('.function-block');

    // When function becomes detached -> persist its current coordinates
    // relative to the root function (as root function position is considered
    // constant).
    if (
      functionBlock &&
      rootFunctionBlock &&
      isDetached &&
      !isDetachedInDom
    ) {

      const position = dom.position(functionBlock, rootFunctionBlock);
      set(this.chartFunction, 'positionRelativeToRootFunc', position);
    }
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.functionArgumentsSetter();
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);

    (async () => {
      await waitForRender();
      if (this.element) {
        this.recalculateArgumentLinePositions();
      }
    })();
  },

  recalculateArgumentLinePositions() {
    const argumentElements = this.element.querySelectorAll(
      ':scope > .function-arguments-container > .function-argument');
    for (const argumentElement of argumentElements) {
      const startLineElement = argumentElement.querySelector(':scope > .argument-start-line');
      const startLineHeight = dom.height(startLineElement);
      const argumentBlockElements = argumentElement.querySelectorAll(
        ':scope > .function-argument-blocks > .function-argument-block'
      );
      for (const argumentBlockElement of argumentBlockElements) {
        const middleLineElement = argumentBlockElement.querySelector(':scope > .argument-middle-line');
        const endLineElement = argumentBlockElement.querySelector(':scope > .argument-end-line');
        // Distance below can be negative when end line is lower (on the Y axis) than start.
        const startToEndDistance = dom.position(endLineElement, startLineElement).top;

        let middleLineCSSVariables;
        if (Math.abs(startToEndDistance) <= startLineHeight) {
          middleLineCSSVariables = {
            '--argument-middle-line-length': '0px',
            '--argument-middle-line-top': `calc(50% - ${startLineHeight / 2}px)`,
            '--argument-middle-line-bottom': 'initial',
          };
        } else {
          middleLineCSSVariables = {
            '--argument-middle-line-length': `${Math.abs(startToEndDistance) + startLineHeight}px`,
            [`--argument-middle-line-${startToEndDistance > 0 ? 'bottom' : 'top'}`]: `calc(50% - ${startLineHeight / 2}px)`,
            [`--argument-middle-line-${startToEndDistance <= 0 ? 'bottom' : 'top'}`]: 'initial',
          };
        }

        Object.keys(middleLineCSSVariables).forEach((variable) =>
          middleLineElement.style.setProperty(variable, middleLineCSSVariables[variable])
        );
      }
    }
  },

  actions: {
    removeFunction() {
      const action = this.actionsFactory
        .createRemoveFunctionAction({ functionToRemove: this.chartFunction });
      action.execute();
    },
    detachFunction(func) {
      const action = this.actionsFactory
        .createDetachArgumentFunctionAction({ functionToDetach: func });
      action.execute();
    },
  },
});
