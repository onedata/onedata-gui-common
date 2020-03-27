import { expect } from 'chai';
import { describe, it } from 'mocha';
import { default as EmberObject, get } from '@ember/object';
import emberObjectReplace from 'onedata-gui-common/utils/ember-object-replace';

describe('Unit | Utility | ember object replace', function () {
  it('adds and removes first level properties from Ember Object based on POJSO',
    function () {
      const foo = {
        bar: 1,
      };
      const eobj = EmberObject.create({
        one: 1,
        foo,
        oldProp: 10,
      });
      const newContent = {
        one: 11,
        foo: {
          bar: 1,
        },
        newProp: 20,
      };

      const result = emberObjectReplace(eobj, newContent);

      expect(result, 'reference to object stays the same').to.equal(eobj);
      expect(get(result, 'one'), 'primitive gets replaced').to.equal(11);
      expect(
        get(result, 'foo'),
        'object ref. stays the same, because it deeply equals'
      ).to.equal(foo);
      expect(
        get(result, 'oldProp'),
        'properties not present in new content are deleted'
      ).to.be.undefined;
      expect(
        get(result, 'newProp'),
        'new properties are added'
      ).to.equal(20);
    });

  it('handles ember object as a source', function () {
    const target = EmberObject.create({
      foo: 1,
    });
    const source = EmberObject.create({
      foo: 2,
    });

    const result = emberObjectReplace(target, source);

    expect(result, 'reference to object stays the same').to.equal(target);
    expect(get(result, 'foo'), 'primitive gets replaced').to.equal(2);
  });
});
