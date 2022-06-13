.PHONY: clean deps test test_ci submodules lint

all: test

clean:
	npm run clean

node_modules: package.json
	npm run deps

deps: node_modules

test: deps
	npm run test

test_ci: deps
	npm run test-ci

lint: deps
	npm run lint

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}
