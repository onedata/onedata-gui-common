import { expect } from 'chai';
import { describe, it } from 'mocha';
import removeObjectsFirstOccurence from 'onedata-gui-common/utils/remove-objects-first-occurence';
import { A } from '@ember/array';
import EmberObject, { observer } from '@ember/object';
import sinon from 'sinon';

describe('Unit | Utility | remove-objects-first-occurence', function () {
  it('removes only first occurence of each object specified to remove from target array', function () {
    const array = A([
      'one',
      'two',
      'three',
      'three',
      'three',
      'four',
      'four',
      'five',
    ]);

    removeObjectsFirstOccurence(array, ['two', 'three', 'four']);

    expect(array.toArray().join(',')).to.equal([
      'one',
      'three',
      'three',
      'four',
      'five',
    ].join(','));
  });

  it('removes exect number of occurences of objects if multiple same object to remove are specified', function () {
    const array = A([
      'one',
      'one',
      'one',
      'one',
      'one',
    ]);

    removeObjectsFirstOccurence(array, ['one', 'one']);

    expect(array.toArray().join(',')).to.equal([
      'one',
      'one',
      'one',
    ].join(','));
  });

  it('notifies about array changes once', function () {
    const observerSpy = sinon.spy();
    const array = A([
      'one',
      'two',
      'three',
    ]);
    EmberObject.extend({
      array,
      arrayObserver: observer('array.[]', function arrayObserver() {
        observerSpy();
      }),
      init() {
        this._super(...arguments);
        // activate observer
        this.get('array.firstObject');
      },
    }).create();

    expect(observerSpy).to.have.not.been.called;
    removeObjectsFirstOccurence(array, ['one', 'two']);

    expect(observerSpy).to.have.been.calledOnce;
  });

  it('removes objects from array end', function () {
    const array = A([
      'one',
      'two',
      'three',
      'two',
      'four',
    ]);

    removeObjectsFirstOccurence(array, ['two']);

    expect(array.toArray()).to.deep.equal([
      'one',
      'two',
      'three',
      'four',
    ]);
  });
});
