/**
 * Extended version of ember-bootstrap tooltip. Adds custom bugfixes.
 *
 * Typical usage:
 * ```
 * <OneTooltip @title="tooltip text" @placement="top" />
 * ```
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsTooltip from 'ember-bootstrap/components/bs-tooltip';
import { inject as service } from '@ember/service';
import config from 'ember-get-config';
import { action } from '@ember/object';
import { PropertyAsyncObserver } from 'onedata-gui-common/utils/observer';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

const isTest = config.environment === 'test';

export default class OneTooltip extends BsTooltip {
  /**
   * Using deprecated Ember Bootstrap subclassing for this component, because we need
   * access to some private members of original class to fix some bugs:
   * - show tooltip when cursor is above trigger on its insertion to DOM;
   * - fast changing `visible` property not closes tooltip in original component.
   *
   * The recommended way to extend Ember Bootstrap components is to make a wrapper
   * component, but then we lack some crucial properties like `triggerTargetElements` and
   * methods like `show()`. If we would like to create these properties and methods in the
   * wrapping component, it will bring a huge rendundancy.
   *
   * We cannot currently upgrade Ember Boostrap above 4.9.0, because > 5.0 versions
   * dropped support for Bootstrap 3 (which would be a huge refactor for us).
   */
  '__ember-bootstrap_subclass' = true;

  @service scrollState;

  /**
   * @type {PropertyAsyncObserver|undefined}
   */
  visibleObserver;

  /**
   * @type {ScrollListener}
   */
  scrollListener = () => this.handlePageScroll();

  /**
   * If true, the global scrollState will be observed and tooltip will be hidden
   * when user scrolls.
   * @type {boolean}
   */
  get hideOnScroll() {
    return this.args.hideOnScroll ?? true;
  }

  /** @override */
  get fade() {
    return isTest ? false : (this.args.fade ?? true);
  }

  /** @override */
  get delay() {
    return isTest ? 0 : (this.args.delay ?? 0);
  }

  constructor() {
    super(...arguments);
    this.scrollState.addScrollListener(this.scrollListener);
    if (this.args.triggerEvents === '') {
      this.visibleObserver = PropertyAsyncObserver.create({
        path: 'oneTooltip.args.visible',
        // This fixes tooltip not hiding when using `@visible` for visibility control.
        // `showOrHide` is unused action of BsContextualHelp component in Ember Bootstrap
        // 4.9.0 that shows/hides tooltip basing on `@visible` value.
        onChange: (value) => this.showOrHide(value),
        oneTooltip: this,
      });
    }
  }

  /**
   * @override
   */
  @action
  setup() {
    super.setup(...arguments);
    (async () => {
      await waitForRender();
      // show the tooltip on element insert if the trigger is currently hovered
      let events = this.triggerEvents;
      if (!Array.isArray(events)) {
        events = events.split(' ');
      }
      if (
        !this.inDom &&
        events.includes('hover') &&
        this.triggerTargetElement?.matches(':hover')
      ) {
        this.triggerTargetElement.dispatchEvent(new Event('mouseenter'));
      }
    })();
  }

  /** @override */
  willDestroy() {
    super.willDestroy(...arguments);
    this.scrollState.removeScrollListener(this.scrollListener);
    this.visibleObserver?.destroy();
  }

  /**
   * @override
   */
  _show() {
    if (this.visibleObserver) {
      // Bugfix: fast changing `visible` property does not close tooltip.
      //
      // Note: This might be outdated fix, but in theory, the we still use observer and
      // invoking show/hide when `visible` changes. So it is left out for potential, rare
      // cases.
      //
      // Bug description: when changing a tooltip visibility manually via `visible`
      // property, there were cases when tooltip stayed open even when `visible` was false.
      // It was caused by `_watchVisible` observer calling `show()` which then schedules
      // running `_show()`. That scheduling runs `_show()` asynchronously and it was
      // possible to change `visible` value to `false` between scheduling and running
      // `_show()`. `_show()` does not have any checks regarding current value of `visible`
      // hence it opens tooltip regardless `visible === false`.
      //
      // Additional `!hoverState` is needed to be sure, that showing tooltip was triggered
      // manually (via `visible` change) and not by an event. When showing tooltip via event
      // (mouse hover etc.) `visible` property can be `false` and that's correct.
      if (!this.visible && !this.hoverState) {
        // Only `return` is not enough here - it leaves rendered (but transparent)
        // tooltip, which overlays page content.
        this.hide();
        return;
      }
      // End of the "fast changing `visible` property not closes tooltip" bugfix
    }

    super._show(...arguments);
  }

  handlePageScroll() {
    if (this.hideOnScroll && this.inDom) {
      this.hide();
    }
  }
}
