import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject, { get, set } from '@ember/object';
import { lookupService, registerService } from '../../helpers/stub-service';
import OwnerInjector, { DynamicOwnerInjector } from 'onedata-gui-common/mixins/owner-injector';
import Service, { inject as service } from '@ember/service';
import { setupTest } from 'ember-mocha';
import { reads } from '@ember/object/computed';

describe('Integration | Mixin | owner-injector', function () {
  const { afterEach } = setupTest();

  beforeEach(function () {
    registerService(this, 'test-service', Service);
    this.set('testService', lookupService(this, 'test-service'));
  });

  afterEach(function () {
    this.subject?.destroy();
  });

  it('injects service, when ownerSource is specified on create', function () {
    this.subject = OwnerInjectorObject.create({
      ownerSource: this.owner,
    });

    expect(get(this.subject, 'testService')).to.equal(this.get('testService'));
  });

  it('throws error if ownerSource is not provided on create', function () {
    expect(() => {
      OwnerInjectorObject.create({
        ownerSource: null,
      });
    }).to.throw;
  });

  it('throws error if ownerSource is computed property with empty value on init',
    function () {
      const otherObject = EmberObject.create({
        sharedOwner: undefined,
      });

      const TestClass = DynamicOwnerInjectorObject.extend({
        ownerSource: reads('otherObject.sharedOwner'),
      });

      expect(() => {
        TestClass.create({
          otherObject,
        });
      }).to.throw;
    }
  );

  it('[DynamicOwnerInjector] injects service, when ownerSource is set after init', function () {
    this.subject = DynamicOwnerInjectorObject.create();
    set(this.subject, 'ownerSource', this.owner);

    expect(get(this.subject, 'testService')).to.equal(this.get('testService'));
  });

  it('[DynamicOwnerInjector] injects service, when ownerSource is provided by computed property after init',
    function () {
      const otherObject = EmberObject.create({
        sharedOwner: undefined,
      });
      this.subject = DynamicOwnerInjectorObject.extend({
        ownerSource: reads('otherObject.sharedOwner'),
      }).create({
        otherObject,
      });

      set(otherObject, 'sharedOwner', this.owner);

      expect(get(this.subject, 'testService')).to.equal(this.get('testService'));
    }
  );

  it('[DynamicOwnerInjector] does not inject service, when ownerSource is not specified', function () {
    this.subject = DynamicOwnerInjectorObject.create();

    let error;
    try {
      get(this.subject, 'testService');
    } catch (e) {
      error = e;
    }
    expect(get(error, 'message')).to.contain('container');
  });
});

const DynamicOwnerInjectorObject = EmberObject.extend(DynamicOwnerInjector, {
  testService: service(),
});

const OwnerInjectorObject = EmberObject.extend(OwnerInjector, {
  testService: service(),
});
