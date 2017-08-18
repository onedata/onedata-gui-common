#!/usr/bin/env python
# coding=utf-8

"""Authors: Jakub Liput
Copyright (C) 2017 ACK CYFRONET AGH
This software is released under the MIT license cited in 'LICENSE.txt'

The script copies npm devDependencies and bower dependencies from
the in-repo-addon into project that uses it.
It should be done because of: https://github.com/ember-cli/ember-cli/issues/4164
"""

import json
import os
import collections

ADDON_DIR = os.path.dirname(os.path.realpath(__file__))

def get_addon_dev_deps():
    addon_package_path = os.path.join(ADDON_DIR, '../package.json')
    with open(addon_package_path) as addon_package_file:
        return json.load(addon_package_file)['devDependencies']
    
def get_addon_bower_deps():
    addon_bower_path = os.path.join(ADDON_DIR, '../bower.json')    
    with open(addon_bower_path) as addon_bower_file:
        return json.load(addon_bower_file)['dependencies']

def replace_npm_versions():
    project_package_path = os.path.join(ADDON_DIR, '../../../package.json')
    with open(project_package_path, 'r+b') as project_package_file:
        project_package = json.load(project_package_file, object_pairs_hook=collections.OrderedDict)
        project_dev_deps = project_package['devDependencies']
        addon_dev_deps = get_addon_dev_deps()
        for (pkg, ver) in addon_dev_deps.items():
            if pkg in project_dev_deps:
                if ver != project_dev_deps[pkg]:
                    print 'WARN: changing package version: %s %s -> %s' % (pkg, project_dev_deps[pkg], ver)
                    project_dev_deps[pkg] = ver
            else:
                print 'INFO: adding package: %s %s' % (pkg, ver)
                project_dev_deps[pkg] = ver

        project_dev_deps = collections.OrderedDict(sorted(project_dev_deps.items()))
        project_package['devDependencies'] = project_dev_deps
        project_package_file.seek(0)
        project_package_file.write(json.dumps(project_package, indent=2))
        project_package_file.write('\n')
        project_package_file.truncate()

def replace_bower_versions():
    project_bower_path = os.path.join(ADDON_DIR, '../../../bower.json')
    with open(project_bower_path, 'r+b') as project_bower_file:
        project_bower = json.load(project_bower_file, object_pairs_hook=collections.OrderedDict)
        project_bower_deps = project_bower['dependencies']
        addon_bower_deps = get_addon_bower_deps()
        for (pkg, ver) in addon_bower_deps.items():
            if pkg in project_bower_deps:
                if ver != project_bower_deps[pkg]:
                    print 'WARN: changing bower package version: %s %s -> %s' % (pkg, project_bower_deps[pkg], ver)
                    project_bower_deps[pkg] = ver
            else:
                print 'INFO: adding bower package: %s %s' % (pkg, ver)
                project_bower_deps[pkg] = ver

        project_dev_deps = collections.OrderedDict(sorted(project_bower_deps.items()))
        project_bower['dependencies'] = project_dev_deps
        project_bower_file.seek(0)
        project_bower_file.write(json.dumps(project_bower, indent=2))
        project_bower_file.write('\n')
        project_bower_file.truncate()

replace_npm_versions()
replace_bower_versions()
