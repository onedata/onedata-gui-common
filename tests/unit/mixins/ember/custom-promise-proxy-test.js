import { expect } from 'chai';
import { describe, it } from 'mocha';
import { default as EmberObject, get } from '@ember/object';
import EmberCustomPromiseProxyMixin from 'onedata-gui-common/mixins/ember/custom-promise-proxy';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';

describe('Unit | Mixin | ember/custom promise proxy', function () {
  it('sets chosen property after promise resolve', function (done) {
    const val = {};
    const propertyName = 'hello';
    const EmberCustomPromiseProxyObject = EmberObject.extend(
      EmberCustomPromiseProxyMixin, {
        resolvedContentProperty: propertyName,
      }
    );
    const subject = EmberCustomPromiseProxyObject.create({
      promise: Promise.resolve(val),
      [propertyName]: null,
    });
    wait().then(() => {
      expect(get(subject, propertyName)).to.equal(val);
      done();
    });
  });
});
