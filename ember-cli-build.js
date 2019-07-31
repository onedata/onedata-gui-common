/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const colors = require('./addon/colors').default;
const defineSassColors = require('./addon/utils/define-sass-colors');
const defineSassBreakpoints = require('./addon/utils/define-sass-breakpoints');
const breakpointValues = require('./addon/breakpoint-values').default;

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
    },
    'sassOptions': {
      includePaths: [
        'app/styles',
        'app/styles/onedata-gui-common',
        'app/styles/onedata-gui-common/oneicons',
        'app/styles/onedata-gui-common/components',
      ],
      onlyIncluded: false,
    },
    // a "bootstrap" should be imported into app.scss
    'ember-cli-bootstrap-sassy': {
      // import SASS styles and some JS that is used outside of ember-bootstrap components 
      'js': [
        'transition',
        // TODO: rewrite collapses to ember-bootstrap components
        'tooltip',
        'collapse',
        'popover',
      ],
      'glyphicons': false
    },
    // import only JS
    'ember-bootstrap': {
      'importBootstrapCSS': false,
      'importBootstrapTheme': false,
      'importBootstrapFont': true,
      'bootstrapVersion': 3
    },
    'ember-cli-chartist': {
      'useCustomCSS': true
    },
  });

  defineSassColors(app, colors);
  defineSassBreakpoints(app, breakpointValues);

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const BOWER_ASSETS = [
    'webui-popover/dist/jquery.webui-popover.css',
    'webui-popover/dist/jquery.webui-popover.js',
  ];

  const NODE_ASSETS = [
    'chartist-plugin-legend/chartist-plugin-legend.js',
    'input-tokenizer/tokenizer.min.js',
  ];

  BOWER_ASSETS.forEach(path => app.import(app.bowerDirectory + '/' + path));
  NODE_ASSETS.forEach(path => app.import(`node_modules/${path}`));

  return app.toTree();
};
