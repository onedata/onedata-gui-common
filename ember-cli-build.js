/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const defineSassColors = require('./addon/utils/define-sass-colors');
const defineSassBreakpoints = require('./addon/utils/define-sass-breakpoints');
const colors = require('./config/colors');
const breakpoints = require('./config/breakpoints');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    'fingerprint': {
      extensions: [
        'js',
        'css',
        'map',
        'svg',
        'png',
        'jpg',
        'gif',
        'webmanifest',
        'ttf',
        'woff',
        'woff2',
        'svg',
        'eot',
      ],
      replaceExtensions: ['html', 'css', 'js', 'webmanifest'],
    },
    // options as in `preset-env` in standard Babel config
    'babel': {
      include: [
        // there are many runloop problems in tests when using async/await, because of
        // poor support of native promises in Ember < 3.4; try to disable this plugin
        // in Ember >= 3.4
        'transform-async-to-generator',
      ],
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
      js: [
        'transition',
        // TODO: rewrite collapses to ember-bootstrap components
        'tooltip',
        'collapse',
        'popover',
      ],
      glyphicons: false,
    },
    // import only JS
    'ember-bootstrap': {
      importBootstrapCSS: false,
      importBootstrapTheme: false,
      importBootstrapFont: true,
      bootstrapVersion: 3,
    },
    'ember-cli-chartist': {
      useCustomCSS: true,
    },
  });

  defineSassColors(app, colors);
  defineSassBreakpoints(app, breakpoints);

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const NODE_ASSETS = [
    'showdown/dist/showdown.js',
    'chartist-plugin-legend/chartist-plugin-legend.js',
    'input-tokenizer/tokenizer.min.js',
    'perfect-scrollbar/css/perfect-scrollbar.css',
    'webui-popover/dist/jquery.webui-popover.css',
    'webui-popover/dist/jquery.webui-popover.js',
  ];

  NODE_ASSETS.forEach(path => app.import(`node_modules/${path}`));

  return app.toTree();
};
