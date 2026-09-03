import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

/* eslint-disable-next-line array-callback-return */
Router.map(function () {
  this.route('index-dummy', { path: '/' }, function () {
    this.route('index', { path: '/' });
    this.route('component', { path: '/component/:component_name' });
    this.route('readme', { path: '/readme' });
  });
});
