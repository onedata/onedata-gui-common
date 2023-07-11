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
   * @returns {void}
   */
  recalculateDetachedFunctionPositions() {
    const rootFunctionBlock = this.element?.querySelector(
      '.root-function > .function-block'
    );
    const detachedFunctionRenderers = this.element?.querySelectorAll(
      '.detached-functions-container > .function-renderer'
    );

    if (rootFunctionBlock && detachedFunctionRenderers?.length) {
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
    }

    this.recalculateFunctionsContainerExtraMargin();
  },

  /**
   * @returns {void}
   */
  recalculateFunctionsContainerExtraMargin() {
    const functionsContainer = this.element?.querySelector('.functions-container');
    const detachedFunctionRenderers = this.element?.querySelectorAll(
      '.detached-functions-container > .function-renderer'
    ) ?? [];
    if (!functionsContainer) {
      return;
    }

    const overflowDetectors = {
      top: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).top * -1,
        0
      ),
      bottom: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).top + dom.height(funcRenderer) -
        dom.height(functionsContainer),
        0
      ),
      left: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).left * -1,
        0
      ),
      right: (funcRenderer) => Math.max(
        dom.position(funcRenderer, functionsContainer).left + dom.width(funcRenderer) -
        dom.width(functionsContainer),
        0
      ),
    };
    const extraMargins = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    [...detachedFunctionRenderers].forEach((detachedFunctionRenderer) => {
      Object.keys(extraMargins).forEach((side) => {
        extraMargins[side] = Math.max(
          overflowDetectors[side](detachedFunctionRenderer),
          extraMargins[side]
        );
      });
    });

    dom.setStyles(functionsContainer, {
      marginTop: `${extraMargins.top}px`,
      marginBottom: `${extraMargins.bottom}px`,
      marginLeft: `${extraMargins.left}px`,
      marginRight: `${extraMargins.right}px`,
    });
  },
});
