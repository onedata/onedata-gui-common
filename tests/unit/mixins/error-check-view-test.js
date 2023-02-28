import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import ErrorCheckViewMixin from 'onedata-gui-common/mixins/error-check-view';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';
import { get } from '@ember/object';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Unit | Mixin | error-check-view', function () {
  it('resolves tryErrorCheck proxy with undefined if error check is disabled',
    async function () {
      const checkErrorType = 'one';
      const resourceId = 'two';
      const checkError = sinon.stub().returns(false);

      new DisabledErrorCheckList(checkErrorType).disableErrorCheckFor(resourceId);
      const ErrorCheckViewObject = EmberObject.extend(ErrorCheckViewMixin, {
        resourceId,
        checkErrorType,
        checkError,
      });
      const subject = ErrorCheckViewObject.create();

      await settled();
      expect(get(subject, 'tryErrorCheckProxy.isFulfilled')).to.be.true;
      expect(get(subject, 'tryErrorCheckProxy.content')).to.be.undefined;
      expect(checkError).to.be.not.called;
    });

  it(
    'resolves tryErrorCheck proxy with true if error check is enabled and returns true',
    async function () {
      const checkErrorType = 'one';
      const resourceId = 'two';
      const checkError = sinon.stub().returns(true);
      const redirectToIndex = sinon.spy();

      const ErrorCheckViewObject = EmberObject.extend(ErrorCheckViewMixin, {
        resourceId,
        checkErrorType,
        checkError,
        redirectToIndex,
      });
      const subject = ErrorCheckViewObject.create();

      await settled();
      expect(get(subject, 'tryErrorCheckProxy.isFulfilled')).to.be.true;
      expect(get(subject, 'tryErrorCheckProxy.content')).to.be.true;
      expect(redirectToIndex).to.be.not.called;
      expect(checkError).to.be.called;
    }
  );

  it(
    'resolves tryErrorCheck proxy with false and invokes redirectToIndex if error check is enabled and returns false',
    async function () {
      const checkErrorType = 'one';
      const resourceId = 'two';
      const checkError = sinon.stub().returns(false);
      const redirectToIndex = sinon.spy();

      const ErrorCheckViewObject = EmberObject.extend(ErrorCheckViewMixin, {
        resourceId,
        checkErrorType,
        checkError,
        redirectToIndex,
      });
      const subject = ErrorCheckViewObject.create();

      await settled();
      expect(get(subject, 'tryErrorCheckProxy.isFulfilled')).to.be.true;
      expect(get(subject, 'tryErrorCheckProxy.content')).to.be.false;
      expect(checkError).to.be.called;
      expect(redirectToIndex).to.be.calledOnce;
    }
  );
});
