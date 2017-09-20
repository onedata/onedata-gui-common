import { expect } from 'chai';
import { describe, it } from 'mocha';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import { run } from '@ember/runloop';
import wait from 'ember-test-helpers/wait';

import EmberObject from '@ember/object';

describe('Unit | Utility | safe method execution', function () {
  it('invokes method on valid object', function () {
    const testObject = EmberObject.create({
      echo(p1, p2) {
        return [p1, p2];
      },
    });
    const result = safeMethodExecution(testObject, 'echo', 1, 2);

    expect(result).to.be.deep.equal([1, 2]);
  });

  it('does not throw exception if invoking method on destroyed object', function (done) {
    const testObject = EmberObject.create({
      hello() {
        return 'world'
      },
    });

    run(() => testObject.destroy());

    wait().then(() => {
      const result = safeMethodExecution(testObject, 'hello');

      expect(result).to.be.undefined;
      done();
    });

  });
});
