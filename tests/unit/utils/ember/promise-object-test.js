import { expect } from 'chai';
import { describe, it } from 'mocha';
import { get, set } from '@ember/object';
import EmberPromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';

describe('Unit | Utility | ember/promise object', function () {
  it('still has first resolved content after promise replace', function (done) {
    const content1 = { c1: null };
    const content2 = { c2: null };
    const obj = EmberPromiseObject.create({
      promise: Promise.resolve(content1),
    });
    wait().then(() => {
      expect(get(obj, 'content'), 'after resolve of first promise')
        .to.equal(content1);
      set(obj, 'promise', Promise.resolve(content2));
      expect(get(obj, 'content'), 'before resolve of second promise')
        .to.equal(content1);
      wait().then(() => {
        expect(get(obj, 'content'), 'after resolve of second promise')
          .to.equal(content2);
        done();
      });
    });
  });
});
