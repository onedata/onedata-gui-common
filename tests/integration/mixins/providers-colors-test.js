import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import { A } from '@ember/array';
import ComponentsProvidersColorsMixin from 'onedata-gui-common/mixins/components/providers-colors';
import { getOwner } from '@ember/application';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

describe('Integration | Mixin | components/providers colors', function () {
  setupComponentTest('components/providers-colors', {
    integration: true,
  });

  it('detects overflow', function () {
    const ID_1 = 'dasdfsafe30rq3j8';
    const ComponentsProvidersColorsObject = EmberObject.extend(
      ComponentsProvidersColorsMixin
    );
    const subject = ComponentsProvidersColorsObject.create(
      getOwner(this).ownerInjection(), {
        providersProxy: PromiseArray.create({
          promise: Promise.resolve(A([
            PromiseObject.create({
              promise: Promise.resolve({
                id: ID_1,
              }),
            }),
          ])),
        }),
      }
    );

    return wait().then(() => {
      const colors = subject.get('providersColors');
      expect(colors).to.be.instanceOf(Object);
      expect(colors).to.have.property(ID_1);
      expect(colors[ID_1]).to.match(/#....../);
    });
  });
});
