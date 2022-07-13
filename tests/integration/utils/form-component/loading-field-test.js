import { expect } from 'chai';
import { describe, it } from 'mocha';
import LoadingField from 'onedata-gui-common/utils/form-component/loading-field';
import { get } from '@ember/object';
import { setupTest } from 'ember-mocha';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import MissingMessage from 'onedata-gui-common/utils/i18n/missing-message';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise, resolve, reject } from 'rsvp';
import { settled } from '@ember/test-helpers';

describe('Integration | Utility | form component/loading field', function () {
  setupTest();

  it('defines fieldComponentName as "form-component/loading-field"', function () {
    const field = LoadingField.create();
    expect(get(field, 'fieldComponentName'))
      .to.equal('form-component/loading-field');
  });

  it(
    'has loadingText property set to "loadingText" translation by default',
    function () {
      sinon.stub(lookupService(this, 'i18n'), 't')
        .withArgs('some.parent.name.loadingText')
        .returns('someText');

      const field = LoadingField.create({
        ownerSource: this.owner,
        i18nPrefix: 'some',
        parent: {
          translationPath: 'parent',
        },
        name: 'name',
      });

      expect(get(field, 'loadingText')).to.equal('someText');
    }
  );

  it(
    'has empty loadingText property if "loadingText" default translation not exists',
    function () {
      this.owner.register('util:i18n/missing-message', MissingMessage);

      const field = LoadingField.create({
        ownerSource: this.owner,
        i18nPrefix: 'some',
        parent: {
          path: 'parent',
        },
        name: 'name',
      });

      expect(get(field, 'loadingText')).to.be.empty;
    }
  );

  it(
    'has true isPending, false isFulfilled and false isRejected when loadingProxy is pending',
    async function () {
      const field = LoadingField.create({
        loadingProxy: PromiseObject.create({
          promise: new Promise(() => {}),
        }),
      });

      await settled();
      expect(get(field, 'isPending')).to.be.true;
      expect(get(field, 'isFulfilled')).to.be.false;
      expect(get(field, 'isRejected')).to.be.false;
    }
  );

  it(
    'has false isPending, true isFulfilled and false isRejected when loadingProxy is fulfilled',
    async function () {
      const field = LoadingField.create({
        loadingProxy: PromiseObject.create({
          promise: resolve(),
        }),
      });

      await settled();
      expect(get(field, 'isPending')).to.be.false;
      expect(get(field, 'isFulfilled')).to.be.true;
      expect(get(field, 'isRejected')).to.be.false;
    }
  );

  it(
    'has false isPending, false isFulfilled and true isRejected when loadingProxy is rejected',
    async function () {
      const field = LoadingField.create({
        loadingProxy: PromiseObject.create({
          promise: reject(),
        }),
      });

      await settled();
      expect(get(field, 'isPending')).to.be.false;
      expect(get(field, 'isFulfilled')).to.be.false;
      expect(get(field, 'isRejected')).to.be.true;
    }
  );

  it(
    'has false isPending, true isFulfilled and false isRejected when loadingProxy is not provided',
    async function () {
      const field = LoadingField.create();
      // Simulate accessing promise object to launch promise
      get(field, 'loadingProxy');

      await settled();
      expect(get(field, 'isPending')).to.be.false;
      expect(get(field, 'isFulfilled')).to.be.true;
      expect(get(field, 'isRejected')).to.be.false;
    }
  );
});
