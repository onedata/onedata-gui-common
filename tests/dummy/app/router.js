import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

/* eslint-disable-next-line array-callback-return */
Router.map(function () {
  this.route('index-dummy', { path: '/' }, function () {
    this.route('component', { path: '/component/:component_name' });
  });
});

export default Router;
