import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import ComponentsProviderSpaceMixin from 'onedata-gui-common/mixins/components/provider-space';

describe('Unit | Mixin | components/provider space', function () {
  it('finds support size for a specified provider', function () {
    let ProviderSpaceObject = EmberObject.extend(ComponentsProviderSpaceMixin);
    let subject = ProviderSpaceObject.create();
    subject.setProperties({
      space: {
        supportSizes: {
          '1': 123,
          '2': 456,
        },
      },
      providerId: '1',
    });
    expect(subject.get('_supportSize')).to.be.equal(123);
  });
});
