import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import layout from '../../templates/components/two-level-sidebar/second-level-items';

export default Component.extend({
  layout,
  classNames: ['second-level-items'],

  item: undefined,
  secondaryItemId: undefined,
  sidebar: undefined,
  secondLevelItems: undefined,
  sidebarType: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  internalSecondLevelItems: reads('secondLevelItems'),
});
