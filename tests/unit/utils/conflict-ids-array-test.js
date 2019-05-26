import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import wait from 'ember-test-helpers/wait';
import ConflictIdsArray from 'onedata-gui-common/utils/conflict-ids-array';

function createMockArray() {
  return new A([
    EmberObject.create({
      id: 'abcdef1',
      name: 'Some',
    }),
    EmberObject.create({
      id: 'abcdef2',
      name: 'Some',
    }),
  ]);
}

describe('Unit | Utility | conflict ids array', function () {
  it('computes conflict labels on init', function () {
    const array = createMockArray();

    let arrayProxy = ConflictIdsArray.create({
      content: array,
    });

    expect(arrayProxy.objectAt(0).get('conflictLabel')).to.equal('abcdef1');
    expect(arrayProxy.objectAt(1).get('conflictLabel')).to.equal('abcdef2');
  });

  it('computes conflict labels on array change', function (done) {
    const array = createMockArray();

    let arrayProxy = ConflictIdsArray.create({
      content: array,
    });
    array.pushObject(EmberObject.create({
      id: 'abcdef3',
      name: 'Some',
    }));

    wait().then(() => {
      expect(arrayProxy.objectAt(2).get('conflictLabel')).to.equal('abcdef3');
      done();
    });
  });
});
