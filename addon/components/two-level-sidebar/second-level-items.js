import Component from '@ember/component';
import layout from '../../templates/components/two-level-sidebar/second-level-items';

export default Component.extend({
  layout,
  classNames: ['second-level-items'],

  item: undefined,
  secondaryItemId: undefined,
  sidebar: undefined,
  secondLevelItems: undefined,
  sidebarType: undefined,

  init() {
    this._super(...arguments);
    console.log(this.get('secondLevelItems'));
  }
});
