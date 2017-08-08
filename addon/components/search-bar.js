import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/search-bar';

export default Ember.Component.extend({
  layout,
  tagName: 'input',
  classNames: ['search-bar'],
  attributeBindings: ['placeholder', 'type'],

  type: 'search',

  // TODO translate
  placeholder: 'Search...',

  input() {
    this.sendAction('search', this.element.value);
  }
});
