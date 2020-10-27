import Component from '@ember/component';
import { conditional, raw } from 'ember-awesome-macros';
import layout from 'onedata-gui-common/templates/components/query-builder/block-visualiser';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,

  classNames: ['query-builder-block-visualiser'],
  classNameBindings: ['isHoveredClass'],

  onConditionEditionStart: notImplementedIgnore,

  onConditionEditionEnd: notImplementedIgnore,

  onConditionEditionValidityChange: notImplementedIgnore,

  onBlockRemoved: notImplementedIgnore,

  /**
   * @virtual
   * @type {Utils.QueryBuilder.QueryBlock}
   */
  queryBlock: undefined,

  /**
   * @virtual
   * @type {Array<Utils.QueryProperty>}
   */
  queryProperties: Object.freeze([]),

  /**
   * @type {boolean}
   */
  areSettingsVisible: false,

  /**
   * @type {Boolean}
   */
  isHovered: false,

  hoveredClassName: 'is-directly-hovered',

  isHoveredClass: conditional('isHovered', 'hoveredClassName', raw(undefined)),

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
    // Query blocks are nested. We need to find the origin (deepest) visualiser element,
    // that is on the path of the event bubbling.
    let closestVisualiserElement = clickEvent.target;
    while (
      closestVisualiserElement &&
      !closestVisualiserElement.matches('.query-builder-block-visualiser') &&
      closestVisualiserElement !== document.body
    ) {
      closestVisualiserElement = closestVisualiserElement.parentElement;
    }

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
      this.set('areSettingsVisible', false);
    },
  },
});
