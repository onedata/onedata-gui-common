/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const defineSassColors = require('./addon/utils/define-sass-colors');
const defineSassBreakpoints = require('./addon/utils/define-sass-breakpoints');
const colors = require('./config/colors');
const breakpoints = require('./config/breakpoints');
const copyDynamicLibraries = require('./addon/utils/copy-dynamic-libraries');
const dynamicLibraries = require('./config/dynamic-libraries');
const sass = require('sass-embedded');

module.exports = function (defaults) {
  const app = new EmberAddon(defaults, {
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
      generateAssetMap: true,
      fingerprintAssetMap: true,
    },
    // options as in `preset-env` in standard Babel config
    'babel': {},
    'sassOptions': {
      implementation: sass,
      outputStyle: 'expanded',
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
    'ember-cli-string-helpers': {
      only: ['dasherize'],
    },
    'ace': {
      themes: ['textmate'],
      modes: ['json', 'xml'],
      workers: ['json', 'xml'],
      exts: ['searchbox'],
      workerPath: './assets/ace',
    },
  });

  defineSassColors(app, colors);
  defineSassBreakpoints(app, breakpoints);
  copyDynamicLibraries(app, dynamicLibraries);

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const NODE_ASSETS = [
    'chartist-plugin-legend/chartist-plugin-legend.js',
    'input-tokenizer/tokenizer.min.js',
    'perfect-scrollbar/css/perfect-scrollbar.css',
    'webui-popover/dist/jquery.webui-popover.css',
    'webui-popover/dist/jquery.webui-popover.js',
    'jquery-datetimepicker/build/jquery.datetimepicker.min.css',
    'jquery-datetimepicker/build/jquery.datetimepicker.full.js',
    'spin.js/spin.css',
  ];

  NODE_ASSETS.forEach(path => app.import(`node_modules/${path}`));

  return app.toTree();
};
