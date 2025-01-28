import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import OwnedEmberObject, { DynamicOwnedEmberObject } from 'onedata-gui-common/utils/owned-ember-object';
import Service, { inject as service } from '@ember/service';
import { registerService } from '../../helpers/stub-service';

class DummyService extends Service {
  hello = 'world';
}

describe('Integration | Utility | owned-ember-object', function () {
  setupRenderingTest();

  it('allows to inject service', function () {
    registerService(this, 'dummy', DummyService);
    class ObjectWithService extends OwnedEmberObject {
      @service dummy;
    }
    const object = ObjectWithService.create({ ownerSource: this.owner });
    expect(object.dummy?.hello).to.equal('world');
  });

  it('(DynamicOwnedEmberObject) allows to inject service after creation', function () {
    registerService(this, 'dummy', DummyService);
    class DynamicObjectWithService extends DynamicOwnedEmberObject {
      @service dummy;
    }
    let object;
    try {
      object = DynamicObjectWithService.create();
      object.set('ownerSource', this.owner);
      expect(object.dummy?.hello).to.equal('world');
    } finally {
      object.destroy();
    }
  });
});
