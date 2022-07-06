import { expect } from 'chai';
import { describe, it } from 'mocha';
import { default as EmberObject, get } from '@ember/object';
import EmberCustomPromiseProxyMixin from 'onedata-gui-common/mixins/ember/custom-promise-proxy';
import { settled } from '@ember/test-helpers';
import { Promise } from 'rsvp';

describe('Unit | Mixin | ember/custom promise proxy', function () {
  it('sets chosen property after promise resolve', async function () {
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

    await settled();
    expect(get(subject, propertyName)).to.equal(val);
  });
});
