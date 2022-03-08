import { expect } from 'chai';
import { describe, it } from 'mocha';
import PromiseUpdatedObject from 'onedata-gui-common/utils/promise-updated-object';
import { Promise } from 'rsvp';
import { default as EmberObject, get } from '@ember/object';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | promise updated object', function () {
  it('leaves original reference to content', async function () {
    const c1 = EmberObject.create({
      one: 1,
      foo: 1,
    });
    const c2 = EmberObject.create({
      two: 2,
      foo: 2,
    });
    const obj = PromiseUpdatedObject.create({
      promise: Promise.resolve(c1),
    });

    await settled();
    obj.set('promise', Promise.resolve(c2));
    await settled();

    expect(get(obj, 'content')).to.equal(c1);
    expect(get(obj, 'content.one'), 'removed old property')
      .to.be.undefined;
    expect(get(obj, 'content.two'), 'added new property')
      .to.equal(2);
    expect(get(obj, 'content.foo'), 'replaced value of property')
      .to.equal(2);
  });
});
