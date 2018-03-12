import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import ComponentsProvidersColorsMixin from 'onedata-gui-common/mixins/components/providers-colors';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import Promise from 'rsvp';
import wait from 'ember-test-helpers/wait';

describe('Unit | Mixin | components/providers colors', function () {
  it('has providersColors computed property with colors', function () {
    const ENTITY_ID_1 = 'dasdfsafe30rq3j8';
    const ComponentsProvidersColorsObject = EmberObject.extend(
      ComponentsProvidersColorsMixin
    );
    const subject = ComponentsProvidersColorsObject.create({
      providersProxy: PromiseArray.create({
        promise: Promise.resolve(A([
          PromiseObject.create({
            promise: Promise.resolve({
              entityId: ENTITY_ID_1,
            }),
          }),
        ])),
      }),
    });

    return wait().then(() => {
      const colors = subject.get('providersColors');
      expect(colors).to.be.instanceOf(Object);
      expect(colors).to.have.property(ENTITY_ID_1);
      expect(colors[ENTITY_ID_1]).to.match(/#....../);
    });
  });
});
