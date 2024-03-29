# onedata-gui-common

## About

**Note:** this is a successor of ``ember-cli-onedata-common`` addon which is now deprecated.

*onedata-gui-common* is an EmberJS in-repo addon that contains components, services, styles
and other EmberJS application resources as well as static resources (images, fonts) for building
Onedata web front-ends using 3-column layout. Currently used by:
- ``onepanel-gui``
- ``onezone-gui``
- ``oneprovider-gui``

## Versioning

Currently this addon is not versioned due to its dynamic nature.

## Usage in projects

Use this repo as a submodule in Ember application ``lib`` directory, which in case of Onedata apps is placed in: ``src/lib/``.

### Initializing project with addon

**Note:** this documentation section may be incomplete and serves as an overview.

#### Installing dependencies for this addon in project

In ``package.json`` of Ember app project:

- add an ember addon in "ember-addon" path, eg.:
```json
"ember-addon": {
  "paths": [
    "lib/onedata-gui-common"
  ]
}
```

Then dependencies of the in-repo addon should be installed to the parent project.
It is required as in this issue on Github: https://github.com/ember-cli/ember-cli/issues/4164
To copy dependencies launch a script (requires Python ^2.7) from root of parent project repo:
```
./src/lib/onedata-gui-common/onedata-gui-utils/scripts/copy-deps-to-project.py
```

#### Setting up Sass

The addon depends on some globally set Sass variables - main colors used in the
application theme and window size breakpoints. These variables needs to be injected
using `ember-cli-build.js` configuration file.

At the top of that file, add `require` statements to import the Sass setup functions and configurations:
```javascript
const defineSassColors = require('./lib/onedata-gui-common/addon/utils/define-sass-colors');
const colors = require('./lib/onedata-gui-common/addon/colors').default;
const defineSassBreakpoints = require(
  './lib/onedata-gui-common/addon/utils/define-sass-breakpoints'
);
const breakpointValues = require('./lib/onedata-gui-common/addon/breakpoint-values').default;
```

And then, after an `app` definition, paste:
```javascript
defineSassColors(app, colors);
defineSassBreakpoints(app, breakpointValues);
```

#### Routing and templates

The addon has a util that configures standard onedata-gui app routes, example of usage:

```javascript
import onedataRouterSetup from 'onedata-gui-common/utils/onedata-router-setup';
const Router = ...
Router.map(function () {
  onedataRouterSetup(Router, this);
});
```

Then extend application route shipped with this addon:

- ``routes/application.js`` file:
```javascript
import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
export default OnedataApplicationRoute.extend();
```

#### Templates

You should use standard application template and route shipped with this addon:

- ``templates/application.js`` file:
```javascript
export { default } from 'onedata-gui-common/templates/application';
```


#### Authentication

The ``login-box`` component by default sends authentication action to
``authenticator:application``, so set your favorite authenticator as application.


## Running tests

Locally just run ``make test`` from repo root dir or install dependencies and run
``ember test`` from ``src/`` dir for customized test runs.

On Bamboo or other CI server, the best way is to use following script from Onedata ``bamboos`` repo: https://git.plgrid.pl/projects/VFS/repos/bamboos/browse/docker/make.py

```
# clone bamboos repo to <bamboos_dir>
# go to onedata-gui-common repo root dir
<bamboos_dir>/make.py test_ci
```

## Organization of files

The project has structure of standard Ember CLI in-repo addon. See: https://ember-cli.com/extending/#addon-project-structure

## Features highlight

**Note:** this documentation section is not complete features list and serves as an overview.

### Routing

The addon has standard onedata-gui app routes. To use them, refer to *Initializing project with addon section* of this documentation.

### Layout

The addon has layout components that creates 3,2,1-columns views of onedata
apps (desktop, tablet, phone).

### Components

Just see components of this addon. Especially those starting with ``one-`` prefix.

### Oneicons font

The ``oneicon`` font provides a set of icons used in Onedata front-end.
It is generated using Icomoon web application (https://icomoon.io). Source files are in SVG format, with size 128x128px, using only black color.
They are currently not published in any repository.

To use icons, you can import a ``onedata-common`` (all common onedata styles) SCSS file to your main SCSS or ``oneicons`` for only icons.

Settings of Icomoon for generating icons are:
- Font name: `oneicons`
- Class prefix: `oneicon-`
- Support IE8: false
- Generate stylesheet variables for: Sass
- CSS Selector: Use attribute selector
- Em square height: 1024
- Baseline height: 0
- Whitespace width: 0

Package generated with Icomoon is placed in ``public/assets/fonts/oneicon`` directory.
The directory contains also ``demo.html`` file for browsing icons.

Icons can be used with ``one-icon`` component (included in gui) or ``icon`` helper (only in ``op-gui-default``).
They can be also used in pure HTML:

```
<span class="oneicon oneicon-(icon-name)"></span>
```
