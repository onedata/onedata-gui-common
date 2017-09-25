#!/bin/bash
git ls-files | grep '.*\.js$' | xargs js-beautify -r

