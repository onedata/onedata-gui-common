import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-steps';

export default Ember.Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['one-steps'],
  currentIndex: 0,
});
