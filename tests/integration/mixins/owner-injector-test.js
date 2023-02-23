import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject, { get, set } from '@ember/object';
import { lookupService, registerService } from '../../helpers/stub-service';
import OwnerInjectorMixin from 'onedata-gui-common/mixins/owner-injector';
import Service, { inject as service } from '@ember/service';
import { setupTest } from 'ember-mocha';

describe('Integration | Mixin | owner-injector', function () {
  setupTest();

  beforeEach(function () {
    registerService(this, 'test-service', Service);
    this.set('testService', lookupService(this, 'test-service'));
  });

  it('does not inject service, when ownerSource is not specified', function () {
    const subject = OwnerInjectorObject.create();

    let error;
    try {
      get(subject, 'testService');
    } catch (e) {
      error = e;
    }
    expect(get(error, 'message')).to.contain('container');
  });

  it('injects service, when ownerSource is specified', function () {
    const subject = OwnerInjectorObject.create({
      ownerSource: this.owner,
    });

    expect(get(subject, 'testService')).to.equal(this.get('testService'));
  });

  it('injects service, when ownerSource is specified after init', function () {
    const subject = OwnerInjectorObject.create();
    set(subject, 'ownerSource', this.owner);

    expect(get(subject, 'testService')).to.equal(this.get('testService'));
  });
});

const OwnerInjectorObject = EmberObject.extend(OwnerInjectorMixin, {
  testService: service(),
});
