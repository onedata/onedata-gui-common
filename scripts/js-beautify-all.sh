#!/bin/bash
git ls-files | grep -vE '/?(vendor|public/assets)/' | grep '.*\.js$' | xargs js-beautify -r
