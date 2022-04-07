/**
 * Is responsible for rendering any type of a query block. Delegates rendering to
 * a component specific for a passed block.
 *
 * @module components/query-builder/block-visualiser
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { conditional, raw, and } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/query-builder/block-visualiser';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  layout,

  classNames: ['query-builder-block-visualiser'],
  classNameBindings: [
    'isHoveredClass',
    'isRemoveHoveredClass',
    'areSettingsVisible:has-open-settings',
    'readonly',
  ],

  /**
   * Nesting level of block tree hierachy, but *counted from bottom*.
   * The deepets block in blocks tree have level 0, and the root block has max value
   * of level. The level-from-bottom is computed using another property `levelScore`,
   * which is counted from the root, to check what is the deepest level.
   * @virtual
   * @type {Number}
   */
  level: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  readonly: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  refreshQueryProperties: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onConditionEditionStart: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onConditionEditionEnd: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onConditionEditionValidityChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onBlockRemoved: notImplementedIgnore,

  /**
   * @virtual
   * @type {Utils.QueryBuilder.QueryBlock}
   */
  queryBlock: undefined,

  /**
   * @virtual
   * @type {Array<QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @virtual
   * @type {Utils.QueryBuilder.OperatorQueryBlock}
   */
  parentQueryBlock: undefined,

  /**
   * @virtual
   * @type {Utils.QueryComponentValueBuilder}
   */
  valuesBuilder: undefined,

  // TODO: https://jira.onedata.org/browse/VFS-7145
  /**
   * @override
   */
  touchActionProperties: 'touch-action: manipulation;',

  /**
   * @type {String}
   */
  popoverPlacement: 'vertical',

  /**
   * @type {boolean}
   */
  areSettingsVisible: false,

  /**
   * @type {Boolean}
   */
  isHovered: false,

  /**
   * Name of class that will be added when mouse is exactly over this block and not over
   * the child or parent.
   * @type {String}
   */
  hoveredClassName: 'is-directly-hovered',

  /**
   * Decide if directly hovered class should be applied.
   * @type {ComputedProperty<Boolean>}
   */
  isHoveredClass: conditional('isHovered', 'hoveredClassName', raw(undefined)),

  /**
   * Decide if directly remove-hovered class should be applied.
   * @type {ComputedProperty<Boolean>}
   */
  isRemoveHoveredClass: conditional(
    and('isHovered', 'removeButtonHovered'),
    raw('is-directly-hovered-remove'),
    raw(undefined)
  ),

  mouseLeave() {
    this.changeHoverState(false);
  },

  mouseMove() {
    const containsHoveredElement =
      Boolean(this.get('element').querySelector(`.${this.get('hoveredClassName')}`));
    this.changeHoverState(!containsHoveredElement);
  },

  /**
   * @override
   * @param {MouseEvent} clickEvent
   */
  click(clickEvent) {
    if (this.get('readonly')) {
      return;
    }

    const target = clickEvent.target;
    if (target.matches('input') ||
      target.closest('.block-adder-popover, .comparator-value-editor')) {
      return;
    }

    // Query blocks are nested. We need to find the origin (deepest) visualiser element,
    // that is on the path of the event bubbling.
    const closestVisualiserElement = target.closest('.query-builder-block-visualiser');

    this.set(
      'areSettingsVisible',
      closestVisualiserElement === this.get('element') && !this.get('areSettingsVisible')
    );
  },

  /**
   * Changes hovered state and adds classes to the element.
   * @param {boolean} newState
   */
  changeHoverState(newState) {
    if (newState !== this.get('isHovered')) {
      this.set('isHovered', newState);
    }
  },

  actions: {
    onSettingsClose() {
      // NOTE: this is a workaround for a bug in Ember that causes not chaninging
      // className when bound property is changed
      // without this, selection of block stays if clicking from inside to outside blocks
      scheduleOnce('afterRender', () => {
        safeExec(this, 'set', 'areSettingsVisible', false);
      });
    },
    removeButtonHover(state) {
      this.set('removeButtonHovered', state);
    },
  },
});
