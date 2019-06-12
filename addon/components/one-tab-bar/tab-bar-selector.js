import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-selector';

export default Component.extend({
  layout,

  triggerClass: 'small',
  dropdownClass: 'small',
  disabled: undefined,
  onchange: undefined,
  searchEnabled: true,
  renderInPlace: true,

  items: undefined,
  selectedItem: undefined,

  actions: {
    onchange() {
      this.get('onchange')(...arguments);
    }
  }
});
