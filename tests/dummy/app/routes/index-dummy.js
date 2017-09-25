import Ember from 'ember';
import componentsList from 'dummy/components-list';

export default Ember.Route.extend({
  model() {
    return {
      components: componentsList,
    }
  }
});
