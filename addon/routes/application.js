import Route from '@ember/routing/route';
import $ from 'jquery';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

// generated with https://realfavicongenerator.net
const FAVICON_HTML =
  `
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/manifest.json">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ee3f3f">
<meta name="theme-color" content="#363636">
  `;

export default Route.extend(ApplicationRouteMixin, {
  beforeModel() {
    this._super(...arguments);
    this.addFavicon();
  },

  addFavicon() {
    $('head').append(FAVICON_HTML);
  },

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
