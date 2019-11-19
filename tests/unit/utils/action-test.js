import { expect } from 'chai';
import { describe, it } from 'mocha';
import Action from 'onedata-gui-common/utils/action';
import sinon from 'sinon';
import { get } from '@ember/object';

describe('Unit | Utility | action', function () {
  it('throws "not implemented" error on execute() call', function () {
    let error;

    const action = Action.create();

    try {
      action.execute();
    } catch (e) {
      error = e;
    }

    expect(error).to.be.ok;
    expect(error.message).to.equal('not implemented');
  });

  it('provides callback to execute() through property executeCallback', function () {
    const executeSpy = sinon.spy();
    const action = Action.create({
      execute: executeSpy,
    });

    get(action, 'executeCallback')();

    expect(executeSpy).to.be.calledOnce;
  });
});
