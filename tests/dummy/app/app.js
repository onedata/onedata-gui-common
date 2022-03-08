import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import silenceDeprecations from './utils/silence-deprecations';

// TODO: VFS-8903 Remove silenceDeprecations call
silenceDeprecations();

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
});

loadInitializers(App, config.modulePrefix);

export default App;
