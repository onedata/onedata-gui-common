/**
 * A component for displaying information in popover or modal (in which one
 * depends on screen width). To work, it needs at least triggersConfiguration
 * property set.
 * By default, component handles open/close actions by itself. This behaviour
 * can be overwritten by setting ``open`` property to true/false values.
 *
 * The component supports multiple triggers with separate rendering strategies
 * for each one. More information can be found in the comment for
 * triggersConfiguration property
 *
 * It triggers events onHide, onHidden, onShow, onShown. If ``open`` is set,
 * onHide and onShow are triggered when component would hide/show as
 * if ``open`` was undefined, but then these events do not launch any internal actions -
 * it can be used to handle interaction with user from outside of the component.
 *
 * Example:
 * ```
 *  <button class="trigger">Show popover/modal</button>
 *  {{#one-switchable-popover-modal
 *    triggersConfiguration=".trigger"
 *    as |ospm|}}
 *    Some content
 *    <button {{action ospm.close}}>Close me</button>
 *  {{/one-switchable-popover-modal}}
 * ```
 *
 * @module components/one-switchable-popover-modal
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { debounce, next } from '@ember/runloop';
import { observer, computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-switchable-popover-modal';
import ClickOutside from 'ember-click-outside/mixins/click-outside';
import { invokeAction, invoke } from 'ember-invoke-action';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(ClickOutside, {
  layout,

  /**
   * Status of component visibility. If not boolean, then component
   * handles its close and open actions by itself.
   * @type {boolean|null}
   */
  open: null,

  /**
   * Active trigger selector, which is used when ``open`` property is true;
   * @type {string}
   */
  activeTriggerSelector: null,

  /**
   * List of triggers configuration strings separated by ; (semicolon) character.
   * To inject.
   *
   * @type {string}
   *
   * Each configuration can be written using two formats:
   * - selector:mode,
   * - selector
   * So, in general, whole string should look like this:
   * ``selector1;selector2:mode2;selector3:mode3;selector4...``
   *
   * A selector should be in format acceptable by jQuery.
   * Of course the ':' character is forbidden.
   *
   * There are three modes:
   * - popover - content shows always in a popover,
   * - modal - content is always in a modal,
   * - dynamic - content is in a popover or a modal according to the screen width.
   * dynamic mode is default and is used when the 'mode' string part is not provided.
   *
   * Examples:
   * ``.simple-trigger``
   * ``button.show-modal:modal;.general-trigger:dynamic;a.another-trigger:popover``
   */
  triggersConfiguration: '',

  /**
   * Popover placement
   * Values: auto, top, right, bottom, left, top-right, top-left, bottom-right,
   *  bottom-left, auto-top, auto-right, auto-bottom, auto-left, horizontal,
   *  vertical
   * @type {string}
   */
  popoverPlacement: 'auto',

  /**
   * If true, popover has padding
   * @type {boolean}
   */
  popoverPadding: true,

  /**
   * Popover style. It will add webui-popover-{popoverStyle}
   * class to popover element
   * @type {string}
   */
  popoverStyle: null,

  /**
   * Popover class
   * @type {string}
   */
  popoverClass: '',

  /**
   * @type {string}
   */
  popoverWindowEvent: 'resize',

  /**
   * Modal class
   * @type {string}
   */
  modalClass: '',

  /**
   * Classes attached to both popover and modal
   * @type {string}
   */
  componentClass: '',

  /**
   * One of: simple, modal.
   * - simple - yields content directly into popover or modal body
   * - modal - yields `modal` object in hash with header, body and footer to use modal
   *   layout; in popover mode it simply renders three block elements
   * @virtual
   * @type {String}
   */
  layoutType: 'simple',

  /**
   * Submit action. Component will close when promise returned by that action
   * will finish (but only if open property is not set).
   * @type {Function}
   */
  submit: null,

  /**
   * Screen width breakpoint, at which component will switch between modal
   * and popover.
   * @type {number}
   */
  switchBreakpoint: 768,

  /**
   * Callback called when popover/modal is going to close. If open property
   * is not set and function returns false, hide action is stopped
   * @type {Function}
   */
  onHide: null,

  /**
   * Callback called when popover/modal is after hide action.
   * @type {Function}
   */
  onHidden: null,

  /**
   * Callback called when popover/modal is going to show. Trigger selector is
   * passed as a first argument.
   *
   * If open property is not set and function returns false, show
   * action is stopped.
   * @type {Function}
   */
  onShow: null,

  /**
   * Callback called when popover/modal is after show action.
   * @type {Function}
   */
  onShown: null,

  /**
   * @type {number}
   */
  modalTransitionDuration: 300,

  /**
   * If true, popover/modal will be visible to user
   */
  _contentVisible: false,

  /**
   * Trigger configuration related to the last used trigger.
   * @type {Object}
   */
  _activeTriggerConfiguration: null,

  /**
   * Rendering mode used by component. It depends on actual
   * screen size and active trigger.
   * Possible values: none, popover, modal
   * @type {string}
   */
  _renderMode: 'none',

  /**
   * Old list of trigger configuration objects. Stored for cleanup purposes,
   * used after each _triggersConfiguration change.
   * @type {Array.Object}
   */
  _triggersConfigurationOld: Object.freeze([]),

  /**
   * Property for testing purposes
   * @type {Window}
   */
  _window: window,

  /**
   * If true, component will handle open/close actions on its own.
   * @type {computed.boolean}
   */
  _handleOpenClose: computed('open', function () {
    return typeof this.get('open') !== 'boolean';
  }),

  /**
   * List of trigger configuration objects.
   * @type {computed.Array.Object}
   *
   * Each object has format:
   * {
   *   element: jQuery - jQuery object that represents trigger element
   *   selector: string - selector used to find trigger element
   *   mode: string - content render mode used when trigger onclick happens
   * }
   */
  _triggersConfiguration: computed('triggersConfiguration', function () {
    return this.get('triggersConfiguration').split(';').map(conf => {
      let [selector, mode] = conf.split(':');
      if (!mode) {
        mode = 'dynamic';
      }
      let element = $(selector);
      return {
        element,
        selector,
        mode,
      };
    });
  }),

  /**
   * Unique class for popover component
   * @type {computed.string}
   */
  _popoverIdClass: computed('elementId', function () {
    return 'popover-' + this.get('elementId');
  }),

  /**
   * Class for popover - concatenation of componentClass, popoverClass
   * and _popoverIdClass
   * @type {computed.string}
   */
  _popoverClass: computed('componentClass', 'popoverClass', '_popoverIdClass',
    function () {
      let {
        componentClass,
        popoverClass,
        _popoverIdClass,
      } = this.getProperties(
        'componentClass',
        'popoverClass',
        '_popoverIdClass'
      );
      return [componentClass, popoverClass, _popoverIdClass].join(' ');
    }
  ),

  /**
   * Unique class for modal component
   * @type {computed.string}
   */
  _modalIdClass: computed('elementId', function () {
    return 'modal-' + this.get('elementId');
  }),

  /**
   * Class for modal - concatenation of componentClass, modalClass
   * and _modalIdClass
   * @type {computed.string}
   */
  _modalClass: computed('componentClass', 'modalClass', '_modalIdClass',
    function () {
      let {
        componentClass,
        modalClass,
        _modalIdClass,
      } = this.getProperties('componentClass', 'modalClass', '_modalIdClass');
      return [componentClass, modalClass, _modalIdClass].join(' ');
    }
  ),

  /**
   * Click event handler attached to trigger elements
   * @type {computed.Function}
   */
  _clickHandler: computed(function () {
    return (event) => this.onTriggerClick(event);
  }),

  /**
   * Window resize event handler
   * @type {computed.Function}
   */
  _windowResizeHandler: computed(function () {
    return () => debounce(this, this.recomputeRenderMode, 100);
  }),

  /**
   * Handles changes of component visibility properties
   */
  _openAndActiveTriggerSelectorObserver: observer('open', 'activeTriggerSelector',
    '_triggersConfiguration',
    function () {
      this.handleManualTriggering();
    }
  ),

  _triggersConfigurationObserver: observer('_triggersConfiguration', function () {
    this.unbindTriggerListeners();
    this.bindTriggerListeners();
    this.setProperties({
      _triggersConfigurationOld: this.get('_triggersConfiguration'),
      _activeTriggerConfiguration: null,
      _contentVisible: false,
    });
  }),

  _activeTriggerAndBreakpointObserver: observer(
    '_activeTriggerConfiguration', 'switchBreakpoint',
    function () {
      this.recomputeRenderMode();
    }
  ),

  _contentVisibleObserver: observer('_contentVisible', function () {
    invokeAction(this, this.get('_contentVisible') ? 'onShown' : 'onHidden');
  }),

  didInsertElement() {
    this._super(...arguments);

    let _windowResizeHandler = this.get('_windowResizeHandler');

    // bind neccessary event listeners
    this.bindTriggerListeners();
    next(this, () => safeExec(this, 'addClickOutsideListener'));
    this.get('_window').addEventListener('resize', _windowResizeHandler);

    this.handleManualTriggering();
  },

  willDestroyElement() {
    this._super(...arguments);

    let _windowResizeHandler = this.get('_windowResizeHandler');

    // unbind event listeners
    this.unbindTriggerListeners();
    this.removeClickOutsideListener();
    this.get('_window').removeEventListener('resize', _windowResizeHandler);
  },

  clickOutside(event) {
    let {
      _activeTriggerConfiguration,
      _popoverIdClass,
      _modalIdClass,
    } = this.getProperties(
      '_activeTriggerConfiguration',
      '_popoverIdClass',
      '_modalIdClass'
    );

    if (_activeTriggerConfiguration) {
      let clickTarget = $(event.target);
      let triggerSelector = _activeTriggerConfiguration.selector;
      let excludeSelector =
        `${triggerSelector}, .${_popoverIdClass}, .${_modalIdClass}`;
      // close only if click is outside the trigger element and the popover
      if (!clickTarget.is(excludeSelector) &&
        clickTarget.parents(excludeSelector).length === 0) {
        invoke(this, 'close');
      }
    }
  },

  bindTriggerListeners() {
    let {
      _triggersConfiguration,
      _clickHandler,
    } = this.getProperties('_triggersConfiguration', '_clickHandler');

    _triggersConfiguration.forEach(conf => {
      conf.element.bind('click', _clickHandler);
    });
  },

  unbindTriggerListeners() {
    let {
      _triggersConfigurationOld,
      _clickHandler,
    } = this.getProperties('_triggersConfigurationOld', '_clickHandler');

    _triggersConfigurationOld.forEach(conf => {
      conf.element.unbind('click', _clickHandler);
    });
  },

  /**
   * Trigger click handler. Shows/hides popover/modal
   * @param {jQuery.Event} event
   */
  onTriggerClick(event) {
    if (this.isDestroyed) {
      return;
    }
    let {
      _triggersConfiguration,
      _activeTriggerConfiguration,
      _handleOpenClose,
      _contentVisible,
    } = this.getProperties(
      '_triggersConfiguration',
      '_activeTriggerConfiguration',
      '_handleOpenClose',
      '_contentVisible'
    );

    // avoid popover immediate close issues
    event.stopPropagation();

    let targetTrigger = $(event.currentTarget);
    if (_activeTriggerConfiguration &&
      _activeTriggerConfiguration.element.is(targetTrigger)) {
      // this trigger is the same as the last used one so only toggle
      // content visibility
      if (invokeAction(this,
          _contentVisible ? 'onHide' : 'onShow',
          _activeTriggerConfiguration.selector) !== false &&
        _handleOpenClose) {
        this.toggleProperty('_contentVisible');
      }
    } else {
      // this trigger is different than the last used trigger so
      // find appropriate configuration and show content according to
      // that configuration
      _triggersConfiguration.forEach(conf => {
        if (conf.element.is($(event.currentTarget))) {
          if (_handleOpenClose) {
            this.set('_activeTriggerConfiguration', conf);
            if (!_contentVisible &&
              invokeAction(this, 'onShow', conf.selector) !== false) {
              this.set('_contentVisible', true);
            }
          } else {
            invokeAction(this, 'onShow', conf.selector);
          }
        }
      });
    }
  },

  /**
   * Sets modal/popover rendering mode using screen width and
   * _activeTriggerConfiguration
   */
  recomputeRenderMode() {
    if (this.isDestroyed) {
      return;
    }

    let {
      switchBreakpoint,
      _activeTriggerConfiguration,
      _window,
    } = this.getProperties(
      'switchBreakpoint',
      '_activeTriggerConfiguration',
      '_window'
    );

    if (!_activeTriggerConfiguration) {
      this.set('_renderMode', 'none');
      return;
    }

    let inModalSize = _window.innerWidth < switchBreakpoint;
    let confMode = _activeTriggerConfiguration.mode;
    if (confMode === 'modal' || (confMode === 'dynamic' && inModalSize)) {
      this.set('_renderMode', 'modal');
    } else {
      this.set('_renderMode', 'popover');
    }
  },

  /**
   * Uses actual values of open and activeTriggerSelector properties
   * to set _activeTriggerConfiguration and open
   */
  handleManualTriggering() {
    let {
      open,
      activeTriggerSelector,
      _triggersConfiguration,
    } = this.getProperties(
      'open',
      'activeTriggerSelector',
      '_triggersConfiguration'
    );

    if (typeof open === 'boolean') {
      _triggersConfiguration.forEach(conf => {
        if (conf.selector === activeTriggerSelector) {
          this.set('_activeTriggerConfiguration', conf);
        }
      });
      this.set('_contentVisible', open);
    }
  },

  actions: {
    close() {
      if (invokeAction(this, 'onHide') !== false && this.get('_handleOpenClose')) {
        safeExec(this, () => {
          this.set('_contentVisible', false);
        });
      }
    },
    onModalHide() {
      invoke(this, 'close');
      return false;
    },
    submit() {
      let submitPromise = invokeAction(this, 'submit');
      submitPromise.finally(() => {
        invoke(this, 'close');
      });
      return submitPromise;
    },
  },
});
