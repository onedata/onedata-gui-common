.PHONY: test_ci

all: test

test:
	npm run deps && npm run test

test_ci:
	npm run test-ci
