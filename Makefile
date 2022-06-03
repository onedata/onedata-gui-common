.PHONY: clean deps test test_ci submodules

all: test

clean:
	npm run clean

deps: node_modules

node_modules: package.json
	npm run deps

test: node_modules
	npm run test

test_ci: node_modules
	npm run test-ci

lint: node_modules
	npm run-script lint

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}
