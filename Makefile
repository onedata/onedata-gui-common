.PHONY: test test_ci clean

all: test

clean:
	npm run clean

test:
	npm run deps && npm run test

test_ci:
	npm run test-ci
