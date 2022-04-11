import { expect } from 'chai';
import { describe, context, it } from 'mocha';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import sinon from 'sinon';
import { get } from '@ember/object';
import { lookupService } from '../../helpers/stub-service';
import { setupComponentTest } from 'ember-mocha';
import { resolve, reject } from 'rsvp';
import suppressRejections from '../../helpers/suppress-rejections';

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

  it('calls onExecute and passes its result when execute is called', function () {
    const actionResult = ActionResult.create({ status: 'done' });
    const onExecute = sinon.stub().resolves(actionResult);
    const action = Action.create({
      ownerSource: this,
      onExecute,
    });

    return action.execute()
      .then(result => {
        expect(onExecute).to.be.calledOnce;
        expect(result).to.equal(actionResult);
      });
  });

  it(
    'calls onExecute and passes its result when execute is called (onExecute returns non-ActionResult object)',
    function () {
      const onExecute = sinon.stub().resolves(123);
      const action = Action.create({
        ownerSource: this,
        onExecute,
      });

      return action.execute()
        .then(result => {
          expect(onExecute).to.be.calledOnce;
          expect(result).to.have.property('result', 123);
          expect(result).to.have.property('status', 'done');
        });
    }
  );

  it(
    'calls execute hooks in the registration order',
    function () {
      const actionResult = ActionResult.create({ status: 'done' });
      const onExecute = sinon.stub().resolves(actionResult);
      const action = Action.create({
        ownerSource: this,
        onExecute,
      });
      const order = [];
      const hook1 = sinon.spy(() => order.push(1));
      const hook2 = sinon.spy(() => order.push(2));
      action.addExecuteHook(hook1);
      action.addExecuteHook(hook2);

      return action.execute()
        .then(result => {
          expect(hook1).to.be.calledOnce;
          expect(hook1).to.be.calledWith(actionResult, action);
          expect(hook2).to.be.calledOnce;
          expect(hook2).to.be.calledWith(actionResult, action);
          expect(order).to.deep.equal([1, 2]);
          expect(result).to.equal(actionResult);
        });
    }
  );

  it(
    'allows to deregister execute hook',
    function () {
      const actionResult = ActionResult.create({ status: 'done' });
      const onExecute = sinon.stub().resolves(actionResult);
      const action = Action.create({
        ownerSource: this,
        onExecute,
      });
      const hook1 = sinon.spy();
      const hook2 = sinon.spy();
      action.addExecuteHook(hook1);
      action.addExecuteHook(hook2);
      action.removeExecuteHook(hook1);

      return action.execute()
        .then(result => {
          expect(hook1).to.be.not.be.called;
          expect(hook2).to.be.calledOnce;
          expect(hook2).to.be.calledWith(actionResult, action);
          expect(result).to.equal(actionResult);
        });
    }
  );

  it('has default translation for title', function () {
    const i18n = lookupService(this, 'i18n');
    const targetTranslation = 'someTranslation';
    sinon.stub(i18n, 't')
      .withArgs('prefix.title')
      .returns(targetTranslation);

    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });

    expect(get(action, 'title')).to.equal(targetTranslation);
  });

  it('fallbacks default translation for title to empty string, when translation does not exist', function () {
    const i18n = lookupService(this, 'i18n');
    sinon.stub(i18n, 't')
      .withArgs('prefix.title')
      .returns('<missing-...');

    const action = Action.create({
      ownerSource: this,
      i18nPrefix: 'prefix',
    });

    expect(get(action, 'title')).to.equal('');
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
    const actionResult = ActionResult.create({ status: 'done' });
    const action = Action.create({
      ownerSource: this,
      onExecute: () => resolve(actionResult),
    });
    const notifySuccessSpy = sinon.spy(action, 'notifySuccess');

    return action.execute()
      .then(() => expect(notifySuccessSpy).to.be.calledWith(actionResult));
  });

  it('notifies about failure on notifyResult() with failed action result', function () {
    const actionResult = ActionResult.create({ status: 'failed', error: { a: 1 } });
    const action = Action.create({
      ownerSource: this,
      onExecute: () => resolve(actionResult),
    });
    const notifyFailureSpy = sinon.spy(action, 'notifyFailure');

    return action.execute()
      .then(() => expect(notifyFailureSpy).to.be.calledWith(actionResult));
  });

  context('handles errors', function () {
    suppressRejections();

    it(
      'calls onExecute and passes its result when execute is called (onExecute rejects with non-ActionResult object)',
      function (done) {
        const onExecute = sinon.stub().rejects(123);
        const action = Action.create({
          ownerSource: this,
          onExecute,
        });

        action.execute()
          .then(result => {
            expect(onExecute).to.be.calledOnce;
            expect(result).to.have.property('error', 123);
            expect(result).to.have.property('status', 'failed');
            done();
          });
      }
    );

    it(
      'calls onExecute and passes its result when execute is called (onExecute rejects with ActionResult object)',
      function (done) {
        const actionResult = ActionResult.create({ status: 'failed', error: { a: 1 } });
        const onExecute = sinon.stub().rejects(actionResult);
        const action = Action.create({
          ownerSource: this,
          onExecute,
        });

        action.execute()
          .then(result => {
            expect(onExecute).to.be.calledOnce;
            expect(result).to.equal(actionResult);
            done();
          });
      }
    );

    it(
      'changes result and stops hooks execution when one of the hooks fails',
      function (done) {
        const error = { id: 'err' };
        const actionResult = ActionResult.create({ status: 'done' });
        const onExecute = sinon.stub().resolves(actionResult);
        const action = Action.create({
          ownerSource: this,
          onExecute,
        });
        const hook1 = sinon.stub().returns(reject(error));
        const hook2 = sinon.spy();
        action.addExecuteHook(hook1);
        action.addExecuteHook(hook2);

        action.execute()
          .then(result => {
            expect(hook1).to.be.calledOnce;
            expect(hook1).to.be.calledWith(actionResult, action);
            expect(hook2).to.not.be.called;
            expect(result).to.not.equal(actionResult);
            expect(result).to.have.property('status', 'failed');
            expect(result).to.have.property('error', error);
            done();
          });
      }
    );
  });
});
