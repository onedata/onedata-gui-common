/**
 * An editor component for series/axes functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import dom from 'onedata-gui-common/utils/dom';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor';

export default Component.extend({
  layout,
  classNames: ['function-editor'],

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase}
   */
  outputFunction: undefined,

  /**
   * @virtual
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase>}
   */
  detachedFunctions: undefined,

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
   * @type {ResizeObserver |null}
   */
  functionsContainerResizeObserver: undefined,

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.setupFunctionsContainerResizeObserver();
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);

    (async () => {
      await waitForRender();
      if (this.element) {
        this.recalculateDetachedFunctionPositions();
      }
    })();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.teardownFunctionsContainerResizeObserver();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Resize observer is responsible for triggering recalculation of detached
   * function positions.
   * @returns {void}
   */
  setupFunctionsContainerResizeObserver() {
    if (this.resizeObserver) {
      return;
    }

    const functionsContainer = this.element?.querySelector('.functions-container');
    // Check whether ResizeObserver API is available
    if (!ResizeObserver || !functionsContainer) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      this.recalculateDetachedFunctionPositions();
    });
    resizeObserver.observe(functionsContainer);

    this.set('functionsContainerResizeObserver', resizeObserver);
  },

  /**
   * @returns {void}
   */
  teardownFunctionsContainerResizeObserver() {
    this.functionsContainerResizeObserver?.disconnect();
    this.set('functionsContainerResizeObserver', null);
  },

  /**
   * @returns {void}
   */
  recalculateDetachedFunctionPositions() {
    const rootFunctionBlock = this.element?.querySelector(
      '.root-function > .function-block'
    );
    const detachedFunctionRenderers = this.element?.querySelectorAll(
      '.detached-functions-container > .function-renderer'
    );
    if (!rootFunctionBlock || !detachedFunctionRenderers?.length) {
      return;
    }

    const rootFunctionBlockPosition = dom.position(
      rootFunctionBlock,
      rootFunctionBlock.closest('.functions-container')
    );

    [...detachedFunctionRenderers].forEach((detachedFunctionRenderer) => {
      const detachedFunctionId = detachedFunctionRenderer.dataset['functionId'];
      const detachedFunction = this.detachedFunctions?.find(({ id }) =>
        id === detachedFunctionId
      );
      const detachedFunctionBlock = detachedFunctionRenderer.querySelector(
        ':scope > .function-block'
      );
      if (!detachedFunction?.positionRelativeToRootFunc || !detachedFunctionBlock) {
        return;
      }
      const detachedBlockInRendererPosition = dom.position(
        detachedFunctionBlock,
        detachedFunctionRenderer
      );
      const newDetachedLeftCoord = rootFunctionBlockPosition.left +
        detachedFunction.positionRelativeToRootFunc.left -
        detachedBlockInRendererPosition.left;
      const newDetachedTopCoord = rootFunctionBlockPosition.top +
        detachedFunction.positionRelativeToRootFunc.top -
        detachedBlockInRendererPosition.top;
      dom.setStyles(detachedFunctionRenderer, {
        left: `${newDetachedLeftCoord}px`,
        top: `${newDetachedTopCoord}px`,
      });
    });
  },
});
