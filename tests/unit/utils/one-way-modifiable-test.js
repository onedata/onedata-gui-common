import { expect } from 'chai';
import { describe, it } from 'mocha';
import oneWayModifiable from 'onedata-gui-common/utils/one-way-modifiable';
import EmberObject from '@ember/object';

const SampleObject = EmberObject.extend({
  sourceProperty: 'source',
  computedProperty: oneWayModifiable('sourceProperty'),
});

describe('Unit | Utility | one way modifiable', function () {
  it('is computed', function () {
    let sampleObject = SampleObject.create();
    expect(sampleObject.get('computedProperty'))
      .to.be.equal(sampleObject.get('sourceProperty'));
  });

  it('can be modified', function () {
    let sampleObject = SampleObject.create();
    sampleObject.set('computedProperty', false);
    expect(sampleObject.get('computedProperty')).to.be.false;
  });

  it('does not change source after modification', function () {
    let sampleObject = SampleObject.create();
    sampleObject.set('computedProperty', false);
    expect(sampleObject.get('sourceProperty')).to.be.equal('source');
  });

  it('is updated after source change', function () {
    let sampleObject = SampleObject.create();
    const newValue = 'src';
    sampleObject.set('sourceProperty', newValue);
    expect(sampleObject.get('computedProperty')).to.be.equal(newValue);
  });

  it('forgets modification after source change', function () {
    let sampleObject = SampleObject.create();
    const newValue = 'src';
    sampleObject.set('computedProperty', false)
    sampleObject.set('sourceProperty', newValue);
    expect(sampleObject.get('computedProperty')).to.be.equal(newValue);
  });
});
