import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import installGetByProperty from 'onedata-gui-common/utils/install-get-by-property';

describe('Unit | Utility | install-get-by-property', function () {
  afterEach(function () {
    this.obj?.destroy();
  });

  it('installs property reacting to target changes for the watched property in nested object', function () {
    this.obj = EmberObject.extend({
      watchedPropertyKey: 'foo',
      nestedObject: EmberObject.create({
        foo: 1,
        bar: 2,
      }),
      init() {
        installGetByProperty(this, 'b', 'nestedObject', 'watchedPropertyKey');
      },
    }).create();

    // reads on init
    expect(this.obj.b).to.equal(1);
    this.obj.set('watchedPropertyKey', 'bar');
    // reads gets value using the new property
    expect(this.obj.b).to.equal(2);
    // reads value after change
    this.obj.nestedObject.set('bar', 3);
    expect(this.obj.b).to.equal(3);
  });
});
