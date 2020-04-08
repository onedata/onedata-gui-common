import { expect } from 'chai';
import { describe, it } from 'mocha';
import Action from 'onedata-gui-common/utils/action';
import sinon from 'sinon';
import { get } from '@ember/object';
import { lookupService } from '../../helpers/stub-service';
import { setupComponentTest } from 'ember-mocha';

describe('Integration | Utility | action', function () {
  setupComponentTest('test-component', {
    integration: true,
  });

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

  it('loads success translation via getSuccessNotificationText()', function () {
    const i18n = lookupService(this, 'i18n');
    const targetTranslation = 'someTranslation';
    const actionResult = { result: { a: 1 } };
    sinon.stub(i18n, 't')
      .withArgs('prefix.successNotificationText', actionResult.result)
      .returns(targetTranslation);

    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });

    expect(action.getSuccessNotificationText(actionResult))
      .to.equal(targetTranslation);
  });

  it(
    'loads failure action name translation via getFailureNotificationActionName()',
    function () {
      const i18n = lookupService(this, 'i18n');
      const targetTranslation = 'someTranslation';
      const actionResult = { error: { a: 1 } };
      sinon.stub(i18n, 't')
        .withArgs('prefix.failureNotificationActionName', actionResult.error)
        .returns(targetTranslation);

      const action = Action.create({
        ownerSource: this,
        i18nPrefix: 'prefix',
      });

      expect(action.getFailureNotificationActionName(actionResult))
        .to.equal(targetTranslation);
    }
  );

  it('notifies about success on notifySuccess()', function () {
    const globalNotify = lookupService(this, 'global-notify');
    const i18n = lookupService(this, 'i18n');
    const successNotifySpy = sinon.spy(globalNotify, 'success');
    const actionResult = { result: { a: 1 } };
    const targetTranslation = 'someTranslation';
    sinon.stub(i18n, 't')
      .withArgs('prefix.successNotificationText', actionResult.result)
      .returns(targetTranslation);

    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });
    action.notifySuccess(actionResult);

    expect(successNotifySpy).to.be.calledWith(targetTranslation);
  });

  it('notifies about failure on notifyFailure()', function () {
    const globalNotify = lookupService(this, 'global-notify');
    const i18n = lookupService(this, 'i18n');
    const failureNotifySpy = sinon.spy(globalNotify, 'backendError');
    const actionResult = { error: { a: 1 } };
    const targetTranslation = 'someTranslation';
    sinon.stub(i18n, 't')
      .withArgs('prefix.failureNotificationActionName', actionResult.error)
      .returns(targetTranslation);

    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });
    action.notifyFailure(actionResult);

    expect(failureNotifySpy)
      .to.be.calledWith(targetTranslation, actionResult.error);
  });

  it('notifies about success on notifyResult() with done action result', function () {
    const actionResult = { status: 'done', error: { a: 1 } };
    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });
    const notifySuccessSpy = sinon.spy(action, 'notifySuccess');

    action.notifyResult(actionResult);

    expect(notifySuccessSpy).to.be.calledWith(actionResult);
  });

  it('notifies about failure on notifyResult() with failed action result', function () {
    const actionResult = { status: 'failed', error: { a: 1 } };
    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });
    const notifyFailureSpy = sinon.spy(action, 'notifyFailure');

    action.notifyResult(actionResult);

    expect(notifyFailureSpy).to.be.calledWith(actionResult);
  });
});
