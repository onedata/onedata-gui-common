import { expect } from 'chai';
import { describe, it } from 'mocha';
import computedT from 'onedata-gui-common/utils/computed-t';
import EmberObject, { get } from '@ember/object';

describe('Unit | Utility | computed-t', function () {
  it('computes translation', function () {
    const testObject = EmberObject.extend({
      test: computedT('testi18n'),
      // emulates t() method from I18n mixin
      t(key) {
        if (key === 'testi18n') {
          return 'success';
        }
      },
    }).create();
    expect(get(testObject, 'test')).to.equal('success');
  });

  it('computes translation with interpolations', function () {
    const testObject = EmberObject.extend({
      test: computedT('testi18n', {
        one: 'first',
        two: 'second',
      }),
      // emulates t() method from I18n mixin
      t(key, interpolations) {
        if (key === 'testi18n') {
          return `success ${interpolations.one} ${interpolations.two}`;
        }
      },
    }).create();
    expect(get(testObject, 'test')).to.equal('success first second');
  });
});
