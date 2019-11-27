import { expect } from 'chai';
import { describe, it } from 'mocha';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { getProperties } from '@ember/object';
import { Promise, resolve, reject } from 'rsvp';

describe('Unit | Utility | action result', function () {
  it(
    'sets result status to "pending" and result and error to null on init',
    function () {
      const actionResult = ActionResult.create();

      expect(getResultValues(actionResult)).to.deep.equal(['pending', null, null]);
    }
  );

  it(
    'sets status to "cancelled" after cancelIfPending(), when status is "pending"',
    function () {
      const actionResult = ActionResult.create();

      actionResult.cancelIfPending();

      expect(getResultValues(actionResult)).to.deep.equal(['cancelled', null, null]);
    }
  );

  it(
    'does not change status, result and error after interceptPromise(promise), but before passed promise resolve',
    function () {
      const actionResult = ActionResult.create();
      const promise = new Promise(() => {});

      actionResult.interceptPromise(promise);

      expect(getResultValues(actionResult)).to.deep.equal(['pending', null, null]);
    }
  );

  it(
    'intercepts result from resolving promise (without changing intercepted promise)',
    function () {
      const actionResult = ActionResult.create();
      const value = 'test';
      const promise = resolve(value);

      return actionResult.interceptPromise(promise).then(originResult => {
        expect(originResult).to.equal(value);
        expect(getResultValues(actionResult))
          .to.deep.equal(['done', value, null]);
      });
    }
  );

  it(
    'intercepts result from resolving promise (without changing intercepted promise)',
    function () {
      const actionResult = ActionResult.create();
      const value = 'test';
      const promise = reject(value);

      return actionResult.interceptPromise(promise)
        .then(() => {
          // Test should not reach this code, because promise rejects
          expect(false).to.be.true;
        })
        .catch(originError => {
          expect(originError).to.equal(value);
          expect(getResultValues(actionResult))
            .to.deep.equal(['failed', null, value]);
        });
    }
  );
});

function getResultValues(actionResult) {
  const {
    status,
    result,
    error,
  } = getProperties(actionResult, 'status', 'result', 'error');

  return [status, result, error];
}
