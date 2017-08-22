import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('index-dummy', { path: '/' }, function () {
    this.route('component', { path: '/component/:componentName' });
  })
});

export default Router;
