#!/bin/bash
git ls-files | grep -vE '/?vendor/' | grep '.*\.js$' | xargs js-beautify -r
