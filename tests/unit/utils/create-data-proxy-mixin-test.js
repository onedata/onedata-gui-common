import { expect } from 'chai';
import { describe, it } from 'mocha';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import EmberObject, { get } from '@ember/object';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Unit | Utility | create data proxy mixin', function () {
  it('adds property that will eventually contain resolved data using fetch function',
    function () {
      const data = 'hello';
      const fetch = sinon.stub().resolves(data);

      const mixin = createDataProxyMixin('world', fetch);
      const obj = EmberObject.extend(mixin, {}).create();
      obj.updateWorldProxy();

      expect(get(obj, 'worldProxy.isFulfilled')).to.be.false;
      return wait().then(() => {
        expect(get(obj, 'worldProxy.isFulfilled')).to.be.true;
        expect(get(obj, 'world')).to.equal(data);
      });
    }
  );
});
