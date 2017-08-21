import Ember from 'ember';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    /**
     * Allows to send transitionTo action from places that not supported it
     */
    transitionTo() {
      let transition = this.transitionTo(...arguments);
      return transition.promise;
    }
  },
});
