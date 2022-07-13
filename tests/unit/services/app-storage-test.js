import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject, { observer } from '@ember/object';

describe('Unit | Service | app storage', function () {
  setupTest();

  it('sets data', function () {
    const service = this.owner.lookup('service:app-storage');
    const key = 'exampleKey';
    const value = 'exampleValue';
    service.setData(key, value);
    expect(service.getData(key)).to.equal(value);
  });

  it('returns undefined for incorrect key', function () {
    const service = this.owner.lookup('service:app-storage');
    expect(service.getData('weirdKey')).to.be.undefined;
  });

  it('allows to observe data', function () {
    const service = this.owner.lookup('service:app-storage');
    const testObservator = EmberObject.extend({
      value: undefined,

      appStorageObserver: observer('appStorage.data.testData', function () {
        this.set('value', this.get('appStorage').getData('testData'));
      }),

      init() {
        this._super(...arguments);
        this.appStorageObserver();
      },
    }).create({
      appStorage: service,
    });
    const testValue = 'test';

    service.setData('testData', testValue);
    expect(testObservator.get('value')).to.equal(testValue);
  });
});
