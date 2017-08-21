# onedata-gui-common

## About

**Note:** this is a successor of ``ember-cli-onedata-common`` addon which is now deprecated.

*onedata-gui-common* is an EmberJS in-repo addon that contains components, services, styles
and other EmberJS application resources as well as static resources (images, fonts) for building
Onedata web front-ends using 3-column layout. Currently used by:
- ``onepanel-gui``
- ``onezone-gui``

## Versioning

Currently this addon is not versioned due to its dynamic nature.

## Usage in projects

Use this repo as a subtree in Ember application ``lib`` directory, which in case of Onedata apps is placed in: ``src/lib/``.

### Updating addon code

To update addon:

- add a remote: ``git remote add onedata-gui-common ssh://git@git.plgrid.pl:7999/vfs/onedata-gui-common.git``
- pull recent changes: ``git subtree pull --squash --prefix=src/lib/onedata-gui-common onedata-gui-common develop`` (you can use other branch name than ``develop``)

Some projects using this addon should have also Makefile tasks named ``pull_onedata_gui_common``.

### Modifying addon code in projects that use it

If you want to modify this addon from specific Onedata project, after pulling recent version of addon, do from project's root:

- make changes in ``src/lib/onedata-gui-common`` and commit them
- push changes to project's repo: ``git push``
- push changes to addon repo: ``git subtree push --squash --prefix=src/lib/onedata-gui-common onedata-gui-common <branch_name>``

Some projects using this addon should have also Makefile tasks named  ``push_onedata_gui_common``.

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
./src/lib/onedata-gui-common/scripts/copy-deps-to-project.py
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
- Font name: ``oneicons``
- Class prefix: ``icon-``
- Support IE8
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
