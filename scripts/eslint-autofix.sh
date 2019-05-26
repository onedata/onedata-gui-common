#!/bin/bash
eslint --fix `git ls-files | grep '.*.js$'`

