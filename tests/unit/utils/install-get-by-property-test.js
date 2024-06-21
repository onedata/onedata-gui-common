import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import installGetByProperty from 'onedata-gui-common/utils/install-get-by-property';

describe('Unit | Utility | includes-all', function () {
  afterEach(function () {
    this.obj?.destroy();
  });

  it('returns true if superset includes all of subset elements', function () {
    this.obj = EmberObject.extend({
      watchedPropertyKey: 'foo',
      internalObj: EmberObject.create({
        foo: 1,
        bar: 2,
      }),
      init() {
        installGetByProperty(this, 'b', 'internalObj', 'watchedPropertyKey');
      },
    }).create();

    expect(this.obj.b).to.equal(1);
    this.obj.set('watchedPropertyKey', 'bar');
    expect(this.obj.b).to.equal(2);
    this.obj.internalObj.set('bar', '3');
    expect(this.obj.b).to.equal(3);
  });
});
