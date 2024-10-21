import { expect } from 'chai';
import isEveryTheSame from 'onedata-gui-common/macros/is-every-the-same';
import { describe, it } from 'mocha';
import EmberObject, { get, set } from '@ember/object';

const HostObject = EmberObject.extend({
  arr: Object.freeze([]),
  isEveryTheSame: isEveryTheSame('arr', 'key1'),
});

describe('Unit | Macro | is-every-the-same', function () {
  it('returns false when collection has different field value for each item', function () {
    const hostObject = HostObject.create({
      arr: [{ key1: 'abc' }, { key1: 'def' }],
    });

    expect(get(hostObject, 'isEveryTheSame')).to.be.false;
  });

  it('returns true when collection has the same field value for each item', function () {
    const hostObject = HostObject.create({
      arr: [{ key1: 'abc' }, { key1: 'abc' }],
    });

    expect(get(hostObject, 'isEveryTheSame')).to.be.true;
  });

  it('recalculates when array element property changes', function () {
    const hostObject = HostObject.create({
      arr: [EmberObject.create({ key1: 'abc' }), EmberObject.create({ key1: 'def' })],
    });

    set(get(hostObject, 'arr')[0], 'key1', 'def');

    expect(get(hostObject, 'isEveryTheSame')).to.be.true;
  });
});
