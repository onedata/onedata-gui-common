import { expect } from 'chai';
import { describe, it } from 'mocha';
import backendNameRegexp from 'onedata-gui-common/utils/backend-name-regexp';

describe('Unit | Utility | backend name regexp', function () {
  it('matches unicode names with spaces', function () {
    expect('Zażółć gęślą jaźń').to.match(backendNameRegexp);
  });

  it('matches names with dots and dashes inside', function () {
    expect('hello-world.com').to.match(backendNameRegexp);
  });

  it('matches names with digits, brackets and underscores', function () {
    expect('a23').to.match(backendNameRegexp);
    expect('a(2)3').to.match(backendNameRegexp);
    expect('a2_3').to.match(backendNameRegexp);
    expect('_a23)').to.match(backendNameRegexp);
    expect('13').to.match(backendNameRegexp);
  });

  it('does not match names with dots and dashes on start or end', function () {
    expect('.hello').to.not.match(backendNameRegexp);
    expect('-hello').to.not.match(backendNameRegexp);
    expect('-hello.').to.not.match(backendNameRegexp);
    expect('hello-').to.not.match(backendNameRegexp);
    expect('hello.').to.not.match(backendNameRegexp);
  });

  it('does not match names with whitespaces on start or end', function () {
    expect('   hello').to.not.match(backendNameRegexp);
    expect('hello   ').to.not.match(backendNameRegexp);
    expect('   hello   ').to.not.match(backendNameRegexp);
    expect('\thello\n').to.not.match(backendNameRegexp);
  });
});
